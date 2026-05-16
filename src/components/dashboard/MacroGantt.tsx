'use client'

import { useState } from 'react'
import { differenceInDays, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronRight, ExternalLink, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Project } from '@/lib/mock-data'

// Window: April 1 → August 31, 2026
const WIN_START = new Date(2026, 3, 1)
const WIN_END   = new Date(2026, 7, 31)
const TOTAL_DAYS = differenceInDays(WIN_END, WIN_START)
const TODAY = new Date(2026, 4, 15)

const MONTHS = [
  { label: 'Abr', days: 30 },
  { label: 'May', days: 31 },
  { label: 'Jun', days: 30 },
  { label: 'Jul', days: 31 },
  { label: 'Ago', days: 31 },
]

function pct(date: Date): number {
  return Math.min(100, Math.max(0, (differenceInDays(date, WIN_START) / TOTAL_DAYS) * 100))
}

const STATUS_CONFIG: Record<string, { label: string; dot: string }> = {
  active:    { label: 'Activo',     dot: 'bg-emerald-400' },
  on_hold:   { label: 'En pausa',   dot: 'bg-amber-400' },
  completed: { label: 'Completado', dot: 'bg-slate-400' },
  planning:  { label: 'Planificación', dot: 'bg-brand' },
}

interface MacroGanttProps {
  projects: Project[]
}

export function MacroGantt({ projects }: MacroGanttProps) {
  const [hovered, setHovered] = useState<string | null>(null)
  const todayPct = pct(TODAY)

  return (
    <div className="card flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-[14px] font-bold text-slate-800">Gantt Global — Macro View</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Abr 2026 · Ago 2026 · {projects.length} proyectos activos</p>
        </div>
        <button className="text-[11px] font-semibold text-brand hover:text-brand-dark flex items-center gap-1 transition-colors">
          Ver Gantt detallado <ChevronRight size={12} />
        </button>
      </div>

      {/* Timeline header */}
      <div className="px-5 pt-3 pb-1">
        <div className="flex ml-[180px] border-b border-slate-100 pb-1">
          {MONTHS.map((m) => (
            <div
              key={m.label}
              className="text-[10px] font-semibold text-slate-400 text-center uppercase tracking-widest"
              style={{ width: `${(m.days / TOTAL_DAYS) * 100}%` }}
            >
              {m.label}
            </div>
          ))}
        </div>
      </div>

      {/* Project rows */}
      <div className="flex-1 overflow-y-auto px-5 py-2 space-y-2">
        {projects.map((p) => {
          const left  = pct(p.startDate)
          const right = pct(p.dueDate)
          const width = right - left
          const fillW = width * (p.progress / 100)
          const isHov = hovered === p.id

          return (
            <div
              key={p.id}
              className={cn(
                'flex items-center gap-3 py-2 px-2 rounded-lg cursor-pointer transition-colors duration-150',
                isHov ? 'bg-slate-50' : 'hover:bg-slate-50/60',
              )}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Client + project label */}
              <div className="w-[180px] flex-shrink-0 flex items-center gap-2 min-w-0">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: p.clientColor }}
                />
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-slate-700 truncate leading-none">{p.name}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{p.clientName}</p>
                </div>
              </div>

              {/* Bar track */}
              <div className="flex-1 relative h-7">
                {/* Today line */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-red-400/60 z-10"
                  style={{ left: `${todayPct}%` }}
                >
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-400 rounded-full" />
                </div>

                {/* Track bg */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-6 rounded-md opacity-15"
                  style={{ left: `${left}%`, width: `${width}%`, background: p.clientColor }}
                />

                {/* Fill */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-6 rounded-md transition-all duration-500"
                  style={{ left: `${left}%`, width: `${fillW}%`, background: p.clientColor }}
                />

                {/* Progress label inside bar */}
                {fillW > 8 && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-6 flex items-center pl-2"
                    style={{ left: `${left}%`, width: `${fillW}%` }}
                  >
                    <span className="text-[10px] font-bold text-white drop-shadow-sm">
                      {p.progress}%
                    </span>
                  </div>
                )}

                {/* Date label at end */}
                {isHov && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 ml-1 whitespace-nowrap"
                    style={{ left: `${right}%` }}
                  >
                    <span className="text-[10px] text-slate-400 ml-1">
                      {format(p.dueDate, 'd MMM', { locale: es })}
                    </span>
                  </div>
                )}
              </div>

              {/* Status + tasks */}
              <div className="w-[90px] flex-shrink-0 flex flex-col items-end gap-0.5">
                <div className="flex items-center gap-1">
                  <span
                    className={cn('w-1.5 h-1.5 rounded-full', STATUS_CONFIG[p.status]?.dot ?? 'bg-slate-400')}
                  />
                  <span className="text-[10px] text-slate-500">{STATUS_CONFIG[p.status]?.label}</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {p.taskDone}/{p.taskTotal} tareas
                </span>
              </div>

              <ExternalLink
                size={13}
                className={cn('flex-shrink-0 transition-colors', isHov ? 'text-brand' : 'text-slate-200')}
              />
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-5 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-1 bg-slate-300 rounded" />
          <span className="text-[10px] text-slate-400">Planificado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ background: '#6366F1' }} />
          <span className="text-[10px] text-slate-400">Progreso real</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-px h-3 bg-red-400" />
          <span className="text-[10px] text-slate-400">Hoy</span>
        </div>
      </div>
    </div>
  )
}
