'use client'

import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isSameDay, addMonths, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CALENDAR_TASK_COUNTS } from '@/lib/mock-data'

const TODAY = new Date(2026, 4, 15)
const DAY_LABELS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

interface MiniCalendarProps {
  taskCounts: typeof CALENDAR_TASK_COUNTS
}

export function MiniCalendar({ taskCounts }: MiniCalendarProps) {
  const [current, setCurrent] = useState(TODAY)

  const monthStart = startOfMonth(current)
  const monthEnd   = endOfMonth(current)
  const days       = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Monday-based offset (Mon=0 … Sun=6)
  const startOffset = (getDay(monthStart) + 6) % 7

  const [selected, setSelected] = useState<Date | null>(TODAY)

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[14px] font-bold text-slate-800 capitalize">
          {format(current, 'MMMM yyyy', { locale: es })}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrent(subMonths(current, 1))}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={14} className="text-slate-500" />
          </button>
          <button
            onClick={() => setCurrent(addMonths(current, 1))}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <ChevronRight size={14} className="text-slate-500" />
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {/* Offset cells */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`off-${i}`} />
        ))}

        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          const data = taskCounts[key]
          const isT = isSameDay(day, TODAY)
          const isSel = selected && isSameDay(day, selected)
          const hasBlocked = data?.hasBlocked
          const hasOverdue = data?.hasOverdue
          const count = data?.count ?? 0

          return (
            <button
              key={key}
              onClick={() => setSelected(day)}
              className={cn(
                'relative flex flex-col items-center justify-center h-9 rounded-lg text-[12px] font-medium transition-all duration-150',
                isSel
                  ? 'bg-brand text-white shadow-md'
                  : isT
                  ? 'bg-brand/10 text-brand font-bold ring-1 ring-brand/30'
                  : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              <span className="leading-none">{format(day, 'd')}</span>
              {count > 0 && (
                <div className="flex items-center gap-0.5 mt-0.5">
                  {hasBlocked || hasOverdue ? (
                    <span className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      isSel ? 'bg-white' : hasBlocked ? 'bg-red-500' : 'bg-orange-400',
                    )} />
                  ) : (
                    <span className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      isSel ? 'bg-white/70' : 'bg-brand/40',
                    )} />
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day detail */}
      {selected && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-bold text-slate-700 capitalize">
              {format(selected, "EEEE d 'de' MMMM", { locale: es })}
            </p>
            <button className="text-[11px] text-brand font-semibold hover:text-brand-dark transition-colors flex items-center gap-1">
              Ver <ChevronRight size={11} />
            </button>
          </div>
          {taskCounts[format(selected, 'yyyy-MM-dd')] ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Tareas programadas</span>
                <span className="font-bold text-slate-700">
                  {taskCounts[format(selected, 'yyyy-MM-dd')]?.count ?? 0}
                </span>
              </div>
              {taskCounts[format(selected, 'yyyy-MM-dd')]?.hasBlocked && (
                <div className="flex items-center gap-1.5 text-[11px] text-red-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Hay tareas bloqueadas
                </div>
              )}
              {taskCounts[format(selected, 'yyyy-MM-dd')]?.hasOverdue && (
                <div className="flex items-center gap-1.5 text-[11px] text-orange-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  Hay tareas vencidas
                </div>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400">Sin tareas programadas</p>
          )}
        </div>
      )}

      {/* Link to full calendar */}
      <button className="mt-4 w-full py-2 rounded-lg border border-brand/20 text-brand text-[12px] font-semibold hover:bg-brand/5 transition-colors">
        Abrir Calendario Global
      </button>
    </div>
  )
}
