'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, CalendarDays, ExternalLink } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { TopBar } from '@/components/layout/TopBar'
import { useAppContext } from '@/context/AppContext'
import { STATUS_OPTIONS } from '@/types'
import type { AppTask } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_MAP = Object.fromEntries(STATUS_OPTIONS.map(s => [s.value, s]))

const DAY_NAMES = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function toYMD(d: Date): string {
  return d.toISOString().split('T')[0]
}

// Monday-first calendar grid for a given month
function getCalendarDays(month: Date): Date[] {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
  const lastDay  = new Date(month.getFullYear(), month.getMonth() + 1, 0)

  // Days before the 1st to fill the Monday-first grid
  const dow = firstDay.getDay() // 0=Sun
  const daysBeforeFirst = dow === 0 ? 6 : dow - 1
  const gridStart = new Date(firstDay)
  gridStart.setDate(gridStart.getDate() - daysBeforeFirst)

  // Days after the last to fill to Sunday
  const lastDow = lastDay.getDay()
  const daysAfterLast = lastDow === 0 ? 0 : 7 - lastDow
  const gridEnd = new Date(lastDay)
  gridEnd.setDate(gridEnd.getDate() + daysAfterLast)

  const days: Date[] = []
  const cur = new Date(gridStart)
  while (cur <= gridEnd) {
    days.push(new Date(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

function getTasksForDay(tasks: AppTask[], day: Date): AppTask[] {
  const dayStr = toYMD(day)
  return tasks.filter(t => {
    if (t.status === 'completed' || t.status === 'cancelled') return false
    // Appears on a day if: starts that day, due that day, or actively spans it
    return t.startDate <= dayStr && t.dueDate >= dayStr
  })
}

function CalendarioContent() {
  const { appTasks } = useAppContext()
  const router = useRouter()
  // Default to May 2026 (matching the app's demo context)
  const [currentMonth, setCurrentMonth] = useState(() => new Date(2026, 4, 1))
  const [selectedDay,  setSelectedDay]  = useState<Date | null>(new Date(2026, 4, 15))

  const calDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth])
  const today   = new Date(2026, 4, 15) // app's "today"

  function prevMonth() { setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1)) }
  function nextMonth() { setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1)) }

  const selectedTasks = selectedDay ? getTasksForDay(appTasks, selectedDay) : []

  return (
    <main className="flex-1 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

        {/* Calendar grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-card overflow-hidden flex flex-col">
          {/* Month navigation */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <button onClick={prevMonth} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
              <ChevronLeft size={16} className="text-slate-600" />
            </button>
            <h2 className="text-[16px] font-bold text-slate-800">
              {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <button onClick={nextMonth} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
              <ChevronRight size={16} className="text-slate-600" />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-[11px] font-bold text-slate-400 py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 flex-1">
            {calDays.map((day, i) => {
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth()
              const isToday     = toYMD(day) === toYMD(today)
              const isSelected  = selectedDay ? toYMD(day) === toYMD(selectedDay) : false
              const dayTasks    = isCurrentMonth ? getTasksForDay(appTasks, day) : []
              const isLastRow   = i >= calDays.length - 7

              return (
                <div
                  key={i}
                  onClick={() => isCurrentMonth && setSelectedDay(day)}
                  className={cn(
                    'border-b border-r border-slate-100 p-1.5 min-h-[72px] transition-colors',
                    isCurrentMonth ? 'cursor-pointer hover:bg-slate-50' : 'bg-slate-50/50',
                    isSelected && 'bg-brand/5 border-brand/20',
                    isLastRow && 'border-b-0',
                    (i + 1) % 7 === 0 && 'border-r-0',
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      'text-[12px] font-semibold w-6 h-6 flex items-center justify-center rounded-full',
                      !isCurrentMonth && 'text-slate-300',
                      isCurrentMonth && !isToday && !isSelected && 'text-slate-700',
                      isToday && 'bg-brand text-white',
                      isSelected && !isToday && 'bg-brand/15 text-brand',
                    )}>
                      {day.getDate()}
                    </span>
                    {dayTasks.length > 3 && (
                      <span className="text-[9px] font-bold text-slate-400">+{dayTasks.length - 3}</span>
                    )}
                  </div>

                  {/* Task pills */}
                  <div className="space-y-0.5">
                    {dayTasks.slice(0, 3).map(t => (
                      <div
                        key={t.id}
                        className="text-[9px] font-semibold truncate px-1.5 py-0.5 rounded text-white leading-tight"
                        style={{ background: t.clientColor }}
                        title={t.title}
                      >
                        {t.title.split(' ').slice(0, 3).join(' ')}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Side panel — selected day tasks */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="px-4 py-4 border-b border-slate-100">
              {selectedDay ? (
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">
                    {DAY_NAMES[(selectedDay.getDay() + 6) % 7]}
                  </p>
                  <h3 className="text-[16px] font-bold text-slate-800">
                    {selectedDay.getDate()} de {MONTH_NAMES[selectedDay.getMonth()]}
                  </h3>
                  <p className="text-[12px] text-slate-400 mt-0.5">
                    {selectedTasks.length} {selectedTasks.length === 1 ? 'tarea activa' : 'tareas activas'}
                  </p>
                </div>
              ) : (
                <p className="text-[13px] text-slate-500">Seleccioná un día</p>
              )}
            </div>

            <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
              {selectedTasks.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <CalendarDays size={28} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-[13px] text-slate-400">
                    {selectedDay ? 'Sin tareas activas este día' : 'Tocá un día para ver sus tareas'}
                  </p>
                </div>
              ) : (
                selectedTasks.map(task => {
                  const def = STATUS_MAP[task.status]
                  const dayStr = selectedDay ? toYMD(selectedDay) : ''
                  const isStart = task.startDate === dayStr
                  const isDue   = task.dueDate === dayStr
                  return (
                    <button
                      key={task.id}
                      onClick={() => router.push(`/clientes/${task.clientId}`)}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left group"
                    >
                      <div className="w-1 self-stretch rounded-full flex-shrink-0 mt-1" style={{ background: task.clientColor }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-[12px] font-semibold text-slate-800 leading-snug truncate group-hover:text-brand transition-colors">{task.title}</p>
                          <ExternalLink size={10} className="text-slate-400 group-hover:text-brand flex-shrink-0 transition-colors" />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">{task.clientName} · {task.assignee}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                            style={{ background: def?.bg, color: def?.color }}
                          >
                            {def?.label}
                          </span>
                          {isStart && (
                            <span className="text-[10px] font-bold text-emerald-600">↗ Inicia</span>
                          )}
                          {isDue && (
                            <span className="text-[10px] font-bold text-orange-500">⌛ Vence</span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-2xl shadow-card px-4 py-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">Leyenda</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-600">↗ Inicia</span>
                <span className="text-[11px] text-slate-500">La tarea comienza ese día</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-orange-500">⌛ Vence</span>
                <span className="text-[11px] text-slate-500">Fecha límite de entrega</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-4 h-3 rounded text-white text-[7px] flex items-center justify-center" style={{ background: '#6366F1' }}>■</div>
                <span className="text-[11px] text-slate-500">En progreso (span entre fechas)</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                Las tareas completadas o canceladas no aparecen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function CalendarioPage() {
  return (
    <MainLayout>
      <TopBar
        greeting="Calendario Global"
        subtitle="Vista mensual de tareas activas — hacé clic para abrir"
      />
      <CalendarioContent />
    </MainLayout>
  )
}
