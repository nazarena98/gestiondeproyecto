'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { differenceInDays, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppContext } from '@/context/AppContext'
import { STATUS_OPTIONS, STATUS_BAR_COLORS, PRIORITY_COLORS, type TaskStatus } from '@/types'
import type { AppTask } from '@/types'

// ── GANTT WINDOW: dynamic 6-month window centered on today ───────
const _today     = new Date()
const WIN_START  = new Date(_today.getFullYear(), _today.getMonth() - 1, 1)
const WIN_END    = new Date(_today.getFullYear(), _today.getMonth() + 4, 30)
const TOTAL_DAYS = differenceInDays(WIN_END, WIN_START)
const TODAY      = _today

function getMonths() {
  const months = []
  const cur = new Date(WIN_START)
  while (cur < WIN_END) {
    const y = cur.getFullYear()
    const m = cur.getMonth()
    const days = new Date(y, m + 1, 0).getDate()
    const labels = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
    months.push({ short: labels[m], days })
    cur.setMonth(m + 1)
  }
  return months
}
const MONTHS = getMonths()

const LABEL_W    = 220
const TIMELINE_H = 44
const CLIENT_H   = 34
const SERVICE_H  = 26
const TASK_H     = 52

function dateToPct(date: Date): number {
  return Math.min(100, Math.max(0, (differenceInDays(date, WIN_START) / TOTAL_DAYS) * 100))
}
function dateToX(date: Date, trackW: number): number {
  return (dateToPct(date) / 100) * trackW
}

// ── INTERNAL DISPLAY TYPE ────────────────────────────────────────
interface DisplayTask {
  raw: AppTask
  startDate: Date
  dueDate: Date
  assigneeInitials: string
  assigneeColor: string
}

type GanttRow =
  | { kind: 'client';  clientId: string; name: string; color: string }
  | { kind: 'service'; service: string;  color: string }
  | { kind: 'task';    dt: DisplayTask }

function buildRows(tasks: DisplayTask[]): GanttRow[] {
  const rows: GanttRow[] = []
  // Group: clientId → service → tasks
  const byClient = new Map<string, { name: string; color: string; byService: Map<string, DisplayTask[]> }>()
  for (const dt of tasks) {
    const cid = dt.raw.clientId
    if (!byClient.has(cid)) byClient.set(cid, { name: dt.raw.clientName, color: dt.raw.clientColor, byService: new Map() })
    const { byService } = byClient.get(cid)!
    const svc = dt.raw.service || 'Sin servicio'
    if (!byService.has(svc)) byService.set(svc, [])
    byService.get(svc)!.push(dt)
  }
  const sortedClients = Array.from(byClient.entries()).sort(([, a], [, b]) => a.name.localeCompare(b.name))
  for (const [clientId, { name, color, byService }] of sortedClients) {
    rows.push({ kind: 'client', clientId, name, color })
    const sortedServices = Array.from(byService.entries()).sort(([a], [b]) => a.localeCompare(b))
    for (const [service, serviceTasks] of sortedServices) {
      rows.push({ kind: 'service', service, color })
      const sorted = [...serviceTasks].sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      for (const dt of sorted) rows.push({ kind: 'task', dt })
    }
  }
  return rows
}

// ── STATUS MINI MENU ─────────────────────────────────────────────
function StatusMiniMenu({
  task, onSelect, onClose,
}: { task: AppTask; onSelect: (s: TaskStatus) => void; onClose: () => void }) {
  const menuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function h(e: MouseEvent) { if (!menuRef.current?.contains(e.target as Node)) onClose() }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [onClose])

  return (
    <div
      ref={menuRef}
      className="bg-white rounded-xl shadow-dropdown border border-slate-100 py-1.5 w-52 z-50 font-sans"
    >
      <p className="text-[10px] font-bold text-slate-400 px-3 py-1.5 border-b border-slate-50 uppercase tracking-wide">
        {task.title.slice(0, 28)}{task.title.length > 28 ? '…' : ''}
      </p>
      {STATUS_OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 transition-colors text-left',
            task.status === opt.value && 'bg-slate-50',
          )}
        >
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: opt.color }} />
          <span className="text-[12px] font-medium text-slate-700">{opt.label}</span>
          {task.status === opt.value && <span className="ml-auto text-brand text-[10px]">✓</span>}
        </button>
      ))}
    </div>
  )
}

// ── MAIN COMPONENT ───────────────────────────────────────────────
interface GanttChartProps {
  filterClientId?: string
  filterAssigneeNames?: string[]
  compact?: boolean
}

export function GanttChart({ filterClientId, filterAssigneeNames, compact = false }: GanttChartProps) {
  const { appTasks, teamMembers, updateAppTask } = useAppContext()
  const trackRef = useRef<HTMLDivElement>(null)
  const [trackW, setTrackW] = useState(700)
  const [activeTaskId, setActiveTaskId] = useState<{ id: string; x: number; y: number } | null>(null)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    setTrackW(el.clientWidth)
    const obs = new ResizeObserver(entries => {
      for (const e of entries) setTrackW(e.contentRect.width)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Build a name→color map from teamMembers for assignee colors
  const memberColorMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const m of teamMembers) map.set(m.name, m.color)
    return map
  }, [teamMembers])

  // Convert AppTasks to DisplayTasks, applying filters
  const displayTasks = useMemo((): DisplayTask[] => {
    let tasks = appTasks.filter(t => t.status !== 'cancelled')
    if (filterClientId) tasks = tasks.filter(t => t.clientId === filterClientId)
    if (filterAssigneeNames?.length) tasks = tasks.filter(t => filterAssigneeNames.includes(t.assignee))
    return tasks.map(t => ({
      raw: t,
      startDate: new Date(t.startDate + 'T12:00:00'),
      dueDate:   new Date(t.dueDate   + 'T12:00:00'),
      assigneeInitials: t.assignee.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      assigneeColor: memberColorMap.get(t.assignee) ?? '#94A3B8',
    }))
  }, [appTasks, filterClientId, filterAssigneeNames, memberColorMap])

  const rows = useMemo(() => buildRows(displayTasks), [displayTasks])
  const svgH = rows.reduce((acc, row) =>
    acc + (row.kind === 'client' ? CLIENT_H : row.kind === 'service' ? SERVICE_H : TASK_H), 0)
  const todayX = dateToX(TODAY, trackW)

  function handleBarClick(taskId: string, e: React.MouseEvent) {
    e.stopPropagation()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const menuH = 280
    const y = rect.bottom + 6 + menuH > window.innerHeight
      ? rect.top - menuH - 6
      : rect.bottom + 6
    setActiveTaskId({ id: taskId, x: rect.left, y })
  }

  function handleStatusSelect(status: TaskStatus) {
    if (!activeTaskId) return
    const task = appTasks.find(t => t.id === activeTaskId.id)
    if (task) updateAppTask({ ...task, status })
    setActiveTaskId(null)
  }

  // Empty state
  if (displayTasks.length === 0) {
    return (
      <div className="card px-6 py-10 text-center">
        <Calendar size={32} className="text-slate-300 mx-auto mb-3" />
        <p className="text-[14px] font-semibold text-slate-500 mb-1">Sin tareas en el Gantt</p>
        <p className="text-[12px] text-slate-400">
          {filterClientId
            ? 'Creá una tarea para este cliente y aparecerá aquí automáticamente.'
            : 'Creá tareas para verlas en la línea de tiempo.'}
        </p>
      </div>
    )
  }

  return (
    <div className="card flex flex-col" onClick={() => setActiveTaskId(null)}>
      {/* Header */}
      {compact ? (
        <div className="px-5 py-3 border-b border-slate-100">
          <h3 className="text-[13px] font-bold text-slate-700">Línea de Tiempo — Gantt</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Hacé clic en una barra para cambiar el estado</p>
        </div>
      ) : (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-[14px] font-bold text-slate-800">Gantt Interactivo</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Hacé clic en cualquier barra para cambiar el estado · {displayTasks.length} tareas activas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="w-px h-3 bg-red-400 inline-block" /> Hoy
            </div>
          </div>
        </div>
      )}

      {/* Timeline body */}
      <div className="flex overflow-x-auto scrollbar-hide">
        {/* Label column */}
        <div className="flex-shrink-0" style={{ width: LABEL_W }}>
          {/* Corner cell */}
          <div
            className="border-b border-r border-slate-100 bg-slate-50/50 flex items-end pb-2 px-3"
            style={{ height: TIMELINE_H }}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Tarea</span>
          </div>
          {/* Label rows */}
          {rows.map((row, i) =>
            row.kind === 'client' ? (
              <div
                key={`c-${row.clientId}-${i}`}
                className="flex items-center gap-2 px-3 border-b border-slate-100 bg-slate-50/40"
                style={{ height: CLIENT_H, borderLeft: `3px solid ${row.color}` }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: row.color }} />
                <span className="text-[11px] font-bold text-slate-700 truncate">{row.name}</span>
              </div>
            ) : row.kind === 'service' ? (
              <div
                key={`s-${row.service}-${i}`}
                className="flex items-center gap-1.5 pl-5 pr-3 border-b border-slate-100/70 bg-slate-50/20"
                style={{ height: SERVICE_H }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 opacity-60" style={{ background: row.color }} />
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide truncate">{row.service}</span>
              </div>
            ) : (
              <div
                key={`l-${row.dt.raw.id}`}
                className={cn(
                  'flex items-center gap-2 pl-7 pr-3 border-b border-slate-50 hover:bg-slate-50/60 transition-colors',
                  row.dt.raw.status === 'blocked' && 'bg-red-50/40',
                )}
                style={{ height: TASK_H }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: PRIORITY_COLORS[row.dt.raw.priority] }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-slate-700 truncate leading-snug">{row.dt.raw.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0"
                      style={{ background: row.dt.assigneeColor }}
                    >
                      {row.dt.assigneeInitials[0]}
                    </div>
                    <span className="text-[10px] text-slate-400 truncate">{row.dt.raw.assignee}</span>
                    {row.dt.raw.status === 'blocked' && (
                      <span className="text-[9px] font-bold text-red-500 bg-red-100 px-1 py-0.5 rounded ml-1 flex-shrink-0">⛔ bloqueada</span>
                    )}
                    {row.dt.raw.dependsOnId && row.dt.raw.status !== 'blocked' && (
                      <span className="text-[9px] font-bold text-amber-500 bg-amber-50 px-1 py-0.5 rounded ml-1 flex-shrink-0">↳ dep.</span>
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Track area */}
        <div ref={trackRef} className="flex-1 relative min-w-0">
          {/* Month header */}
          <div className="flex border-b border-slate-100 bg-slate-50/30" style={{ height: TIMELINE_H }}>
            {MONTHS.map(m => (
              <div
                key={m.label}
                className="flex items-end justify-start pb-2 pl-2 border-r border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0"
                style={{ width: `${(m.days / TOTAL_DAYS) * 100}%` }}
              >
                {m.short}
              </div>
            ))}
          </div>

          {/* Today line */}
          <div
            className="absolute top-0 bottom-0 w-px bg-red-400/70 z-10 pointer-events-none"
            style={{ left: todayX }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-400 rounded-full" />
            <div className="absolute top-2 left-2 text-[9px] font-bold text-red-400 whitespace-nowrap">Hoy</div>
          </div>

          {/* Task rows */}
          {rows.map((row, i) =>
            row.kind === 'client' ? (
              <div
                key={`ct-${row.clientId}-${i}`}
                className="border-b border-slate-100 bg-slate-50/40"
                style={{ height: CLIENT_H }}
              />
            ) : row.kind === 'service' ? (
              <div
                key={`st-${row.service}-${i}`}
                className="border-b border-slate-100/70 bg-slate-50/20"
                style={{ height: SERVICE_H }}
              />
            ) : (
              <div
                key={`tr-${row.dt.raw.id}`}
                className="relative border-b border-slate-50 hover:bg-slate-50/30 transition-colors"
                style={{ height: TASK_H }}
              >
                {/* Alternating month columns */}
                {MONTHS.map((m, mi) => (
                  <div
                    key={mi}
                    className="absolute top-0 bottom-0 border-r border-slate-100/60"
                    style={{
                      left:  `${MONTHS.slice(0, mi).reduce((a, x) => a + x.days, 0) / TOTAL_DAYS * 100}%`,
                      width: `${m.days / TOTAL_DAYS * 100}%`,
                      background: mi % 2 === 0 ? 'transparent' : 'rgba(248,250,252,0.5)',
                    }}
                  />
                ))}

                {/* Bar */}
                {(() => {
                  const dt = row.dt
                  const leftPct  = dateToPct(dt.startDate)
                  const rightPct = dateToPct(dt.dueDate)
                  const widthPct = Math.max(0.5, rightPct - leftPct)
                  const barColor = STATUS_BAR_COLORS[dt.raw.status]

                  return (
                    <button
                      title={`${dt.raw.title} — clic para cambiar estado`}
                      onClick={(e) => handleBarClick(dt.raw.id, e)}
                      className="absolute top-1/2 -translate-y-1/2 rounded-md flex items-center overflow-hidden
                                 hover:brightness-110 hover:scale-y-105 active:scale-95
                                 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                      style={{
                        left:     `${leftPct}%`,
                        width:    `${widthPct}%`,
                        height:   '26px',
                        background: barColor,
                        minWidth: 8,
                      }}
                    >
                      {dt.raw.status === 'in_progress' && (
                        <div className="absolute inset-0 animate-shimmer" />
                      )}
                      {dt.raw.status === 'blocked' && (
                        <div className="absolute inset-0 opacity-30"
                          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 0, transparent 50%)', backgroundSize: '8px 8px' }} />
                      )}
                      {widthPct > 6 && (
                        <span className="text-[10px] font-bold text-white/90 px-2 truncate leading-none drop-shadow-sm">
                          {dt.raw.status === 'blocked' ? '⛔ ' : ''}{dt.raw.title.split(' ').slice(0, 3).join(' ')}
                        </span>
                      )}
                    </button>
                  )
                })()}

                {/* Due date label */}
                <span
                  className="absolute top-1/2 -translate-y-1/2 text-[9px] text-slate-400 whitespace-nowrap pointer-events-none"
                  style={{ left: `${dateToPct(row.dt.dueDate)}%`, marginLeft: 4 }}
                >
                  {format(row.dt.dueDate, 'd MMM', { locale: es })}
                </span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-4 overflow-x-auto flex-nowrap">
        {STATUS_OPTIONS.filter(s => s.value !== 'cancelled').map(s => (
          <div key={s.value} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: STATUS_BAR_COLORS[s.value] }} />
            <span className="text-[10px] text-slate-500">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Floating status menu */}
      {activeTaskId && (() => {
        const task = appTasks.find(t => t.id === activeTaskId.id)
        if (!task) return null
        return (
          <div
            style={{ position: 'fixed', left: activeTaskId.x, top: activeTaskId.y, zIndex: 9999 }}
            onClick={e => e.stopPropagation()}
          >
            <StatusMiniMenu
              task={task}
              onSelect={handleStatusSelect}
              onClose={() => setActiveTaskId(null)}
            />
          </div>
        )
      })()}
    </div>
  )
}
