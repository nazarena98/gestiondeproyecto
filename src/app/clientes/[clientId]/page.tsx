'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Plus, CheckCircle, AlertCircle, Circle, GanttChart as GanttIcon, ChevronDown, ChevronRight } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { TopBar } from '@/components/layout/TopBar'
import { useAppContext } from '@/context/AppContext'
import { GanttChart } from '@/components/gantt/GanttChart'
import { STATUS_OPTIONS } from '@/types'
import type { AppTask, TaskStatus } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_MAP = Object.fromEntries(STATUS_OPTIONS.map(s => [s.value, s]))

function StatusDropdown({ task, onUpdate }: { task: AppTask; onUpdate: (t: AppTask) => void }) {
  const [open, setOpen]   = useState(false)
  const [pos,  setPos]    = useState({ top: 0, left: 0 })
  const btnRef  = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function h(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current  && !btnRef.current.contains(e.target as Node)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  function handleOpen(e: React.MouseEvent) {
    e.stopPropagation()
    if (btnRef.current) {
      const r   = btnRef.current.getBoundingClientRect()
      const left = Math.max(4, r.right - 192)
      // 9 options × ~34px + padding ≈ 330px; flip upward if not enough space below
      const dropH = 340
      const top   = window.innerHeight - r.bottom >= dropH
        ? r.bottom + 4
        : Math.max(4, r.top - dropH - 4)
      setPos({ top, left })
    }
    setOpen(v => !v)
  }

  const def = STATUS_MAP[task.status]

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 hover:opacity-80 transition-opacity flex-shrink-0"
        style={{ background: def?.bg, color: def?.color, border: `1px solid ${def?.border}` }}
      >
        {def?.label ?? task.status}
        <ChevronDown size={10} />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          className="bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 w-48"
          style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999, maxHeight: '80vh', overflowY: 'auto' }}
        >
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={(e) => { e.stopPropagation(); onUpdate({ ...task, status: opt.value }); setOpen(false) }}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-left transition-colors',
                task.status === opt.value && 'bg-slate-50',
              )}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: opt.color }} />
              <span className="text-[12px] font-medium text-slate-700">{opt.label}</span>
              {task.status === opt.value && <span className="ml-auto text-brand text-[10px]">✓</span>}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </>
  )
}

function TaskRow({
  task, onEdit, onUpdate, highlighted,
}: { task: AppTask; onEdit: () => void; onUpdate: (t: AppTask) => void; highlighted: boolean }) {
  const daysLeft  = Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const isOverdue = daysLeft < 0

  return (
    <div
      id={`task-${task.id}`}
      className={cn(
        'flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group',
        highlighted && 'task-highlighted',
      )}
      onClick={onEdit}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-slate-800 truncate group-hover:text-brand transition-colors">
          {task.title}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">{task.assignee}</p>
      </div>
      <StatusDropdown task={task} onUpdate={onUpdate} />
      <div className="text-right flex-shrink-0 hidden md:block">
        <p className="text-[11px] font-medium text-slate-500">{task.startDate} → {task.dueDate}</p>
        <p className={`text-[10px] font-semibold mt-0.5 ${isOverdue ? 'text-red-500' : daysLeft <= 2 ? 'text-amber-500' : 'text-slate-400'}`}>
          {isOverdue ? `${Math.abs(daysLeft)}d vencida` : daysLeft === 0 ? 'Vence hoy' : `${daysLeft}d restantes`}
        </p>
      </div>
    </div>
  )
}

const ACTIVE_STATUS_ORDER: TaskStatus[] = [
  'blocked', 'waiting_client', 'in_progress', 'in_review', 'correction', 'pending',
]
const DONE_STATUSES: TaskStatus[] = ['approved', 'completed']

function StatusGroup({
  statusValue, tasks, onEditTask, onUpdateTask, highlightedTaskId,
}: {
  statusValue: TaskStatus
  tasks: AppTask[]
  onEditTask: (id: string) => void
  onUpdateTask: (t: AppTask) => void
  highlightedTaskId: string | null
}) {
  const def = STATUS_OPTIONS.find(s => s.value === statusValue)!
  return (
    <div>
      <div className="flex items-center gap-2 px-5 py-2 bg-slate-50 border-y border-slate-100">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: def.color }} />
        <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: def.color }}>{def.label}</span>
        <span className="text-[10px] font-bold text-slate-400 ml-1">{tasks.length}</span>
      </div>
      <div className="divide-y divide-slate-50">
        {tasks.map(task => (
          <TaskRow
            key={task.id}
            task={task}
            onEdit={() => onEditTask(task.id)}
            onUpdate={onUpdateTask}
            highlighted={highlightedTaskId === task.id}
          />
        ))}
      </div>
    </div>
  )
}

function ServiceSection({
  service, tasks, clientId, clientColor, onEditTask, onUpdateTask, onNewTask, highlightedTaskId,
}: {
  service: string
  tasks: AppTask[]
  clientId: string
  clientColor: string
  onEditTask: (id: string) => void
  onUpdateTask: (t: AppTask) => void
  onNewTask: (svc: string) => void
  highlightedTaskId: string | null
}) {
  const [showDone, setShowDone] = useState(false)

  const visible = tasks.filter(t => t.status !== 'cancelled')

  const activeGroups = ACTIVE_STATUS_ORDER
    .map(s => ({ statusValue: s, items: visible.filter(t => t.status === s) }))
    .filter(g => g.items.length > 0)

  const doneTasks    = visible.filter(t => DONE_STATUSES.includes(t.status))
  const activeCount  = visible.filter(t => t.status === 'in_progress' || t.status === 'in_review').length
  const blockedCount = visible.filter(t => t.status === 'blocked' || t.status === 'waiting_client').length

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: clientColor + '20' }}>
            <div className="w-3 h-3 rounded-sm" style={{ background: clientColor }} />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-slate-800">{service}</h3>
            <div className="flex items-center gap-3 mt-0.5">
              {activeCount > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-blue-600">
                  <Circle size={8} fill="currentColor" /> {activeCount} activa{activeCount > 1 ? 's' : ''}
                </span>
              )}
              {blockedCount > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-red-500">
                  <AlertCircle size={10} /> {blockedCount} bloqueada{blockedCount > 1 ? 's' : ''}
                </span>
              )}
              {doneTasks.length > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-600">
                  <CheckCircle size={10} /> {doneTasks.length} finalizada{doneTasks.length > 1 ? 's' : ''}
                </span>
              )}
              {visible.length === 0 && <span className="text-[11px] text-slate-400">Sin tareas</span>}
            </div>
          </div>
        </div>
        {/* Nueva tarea por servicio */}
        <button
          onClick={() => onNewTask(service)}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-brand hover:bg-brand/8 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus size={13} />
          Nueva tarea
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="px-5 py-6 text-center">
          <p className="text-[13px] text-slate-400">No hay tareas para este servicio.</p>
        </div>
      ) : (
        <>
          {activeGroups.map(g => (
            <StatusGroup
              key={g.statusValue}
              statusValue={g.statusValue}
              tasks={g.items}
              onEditTask={onEditTask}
              onUpdateTask={onUpdateTask}
              highlightedTaskId={highlightedTaskId}
            />
          ))}

          {doneTasks.length > 0 && (
            <div>
              <button
                onClick={() => setShowDone(v => !v)}
                className="w-full flex items-center gap-2 px-5 py-2 bg-emerald-50 border-t border-emerald-100 hover:bg-emerald-100 transition-colors"
              >
                {showDone ? <ChevronDown size={12} className="text-emerald-600" /> : <ChevronRight size={12} className="text-emerald-600" />}
                <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">Finalizadas</span>
                <span className="text-[10px] font-bold text-emerald-500 ml-1">{doneTasks.length}</span>
              </button>
              {showDone && (
                <div className="divide-y divide-slate-50">
                  {doneTasks.map(task => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onEdit={() => onEditTask(task.id)}
                      onUpdate={onUpdateTask}
                      highlighted={highlightedTaskId === task.id}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── INNER COMPONENT (uses useSearchParams) ────────────────────────
function ClientDetailContent({ clientId }: { clientId: string }) {
  const { clients, appTasks, openNewTask, openEditTask, updateAppTask } = useAppContext()
  const searchParams   = useSearchParams()
  const highlightParam = searchParams.get('task')
  const [ganttOpen,          setGanttOpen]         = useState(false)
  const [highlightedTaskId,  setHighlightedTaskId] = useState<string | null>(null)

  // Scroll to and highlight the notified task
  useEffect(() => {
    if (!highlightParam) return
    setHighlightedTaskId(highlightParam)
    // Small delay so the DOM is fully painted before scrolling
    const timer = setTimeout(() => {
      const el = document.getElementById(`task-${highlightParam}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 350)
    // Clear highlight after animation finishes
    const clear = setTimeout(() => setHighlightedTaskId(null), 3000)
    return () => { clearTimeout(timer); clearTimeout(clear) }
  }, [highlightParam])

  const client = clients.find(c => c.id === clientId)
  if (!client) {
    return (
      <main className="flex-1 p-6">
        <div className="text-center py-20">
          <p className="text-slate-500">Cliente no encontrado.</p>
          <Link href="/clientes" className="mt-4 inline-block text-brand font-semibold hover:underline">
            ← Volver a Clientes
          </Link>
        </div>
      </main>
    )
  }

  const clientTasks = appTasks.filter(t => t.clientId === clientId)

  const allServices = Array.from(new Set([
    ...client.services,
    ...clientTasks.map(t => t.service).filter(Boolean),
  ]))

  const tasksByService = allServices.reduce<Record<string, AppTask[]>>((acc, svc) => {
    acc[svc] = clientTasks.filter(t => t.service === svc)
    return acc
  }, {})

  const totalTasks   = clientTasks.length
  const activeTasks  = clientTasks.filter(t => t.status === 'in_progress' || t.status === 'in_review').length
  const blockedTasks = clientTasks.filter(t => t.status === 'blocked' || t.status === 'waiting_client').length
  const doneTasks    = clientTasks.filter(t => t.status === 'completed' || t.status === 'approved').length

  return (
    <main className="flex-1 p-6 space-y-6">
      {/* Back + client header */}
      <div className="flex items-start gap-5">
        <Link
          href="/clientes"
          className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-brand transition-colors mt-1"
        >
          <ArrowLeft size={14} />
          Volver
        </Link>
        <div className="flex items-center gap-4 flex-1">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-[18px] shadow-sm flex-shrink-0"
            style={{ background: client.color }}
          >
            {client.initials}
          </div>
          <div>
            <h1 className="text-[22px] font-black text-slate-800">{client.name}</h1>
            <p className="text-[13px] text-slate-400">{client.industry}</p>
          </div>
        </div>
        <button
          onClick={() => openNewTask(clientId)}
          className="flex items-center gap-2 bg-brand text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-dark transition-colors shadow-sm"
        >
          <Plus size={15} />
          Nueva tarea
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Tareas totales', value: totalTasks,   color: client.color },
          { label: 'En proceso',     value: activeTasks,  color: '#3B82F6' },
          { label: 'Bloqueadas',     value: blockedTasks, color: '#EF4444' },
          { label: 'Completadas',    value: doneTasks,    color: '#10B981' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl shadow-card px-5 py-4">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-[28px] font-black leading-none" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Service sections */}
      <div className="space-y-4">
        {allServices.map(svc => (
          <ServiceSection
            key={svc}
            service={svc}
            tasks={tasksByService[svc] ?? []}
            clientId={clientId}
            clientColor={client.color}
            onEditTask={openEditTask}
            onUpdateTask={updateAppTask}
            onNewTask={(service) => openNewTask(clientId, service)}
            highlightedTaskId={highlightedTaskId}
          />
        ))}
      </div>

      {/* Gantt colapsable */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <button
          onClick={() => setGanttOpen(v => !v)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: client.color + '20' }}
            >
              <GanttIcon size={15} style={{ color: client.color }} />
            </div>
            <div className="text-left">
              <h3 className="text-[14px] font-bold text-slate-800">Línea de Tiempo</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Gantt de tareas — hacé clic en una barra para cambiar el estado
              </p>
            </div>
          </div>
          <ChevronDown
            size={16}
            className={cn('text-slate-400 transition-transform duration-200', ganttOpen && 'rotate-180')}
          />
        </button>
        {ganttOpen && (
          <div className="border-t border-slate-100">
            <GanttChart filterClientId={clientId} compact />
          </div>
        )}
      </div>
    </main>
  )
}

export default function ClientDetailPage({ params }: { params: { clientId: string } }) {
  const { clientId } = params
  return (
    <MainLayout>
      <TopBar
        greeting="Detalle de Cliente"
        subtitle="Módulos de servicio y tareas asociadas"
      />
      <Suspense fallback={null}>
        <ClientDetailContent clientId={clientId} />
      </Suspense>
    </MainLayout>
  )
}
