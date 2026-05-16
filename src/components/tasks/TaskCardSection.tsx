'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, GitBranch } from 'lucide-react'
import { useAppContext } from '@/context/AppContext'
import { STATUS_OPTIONS, PRIORITY_COLORS } from '@/types'
import type { AppTask } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_MAP     = Object.fromEntries(STATUS_OPTIONS.map(s => [s.value, s]))
const STATUS_PRIORITY: Record<string, number> = {
  blocked: 0, waiting_client: 1, correction: 2, in_review: 3, in_progress: 4, pending: 5,
}

function isCriticalDue(dueDate: string, status: string): boolean {
  if (['completed', 'cancelled', 'approved'].includes(status)) return false
  return Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000) <= 1
}

function AppTaskCard({ task, onEdit }: { task: AppTask; onEdit: () => void }) {
  const statusDef = STATUS_MAP[task.status]
  const daysLeft  = Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / 86400000)
  const isOverdue = daysLeft < 0
  const isDueSoon = !isOverdue && daysLeft <= 1

  return (
    <div
      onClick={onEdit}
      className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-150 cursor-pointer group p-4 flex flex-col gap-3"
      style={{ borderLeft: `3px solid ${PRIORITY_COLORS[task.priority]}` }}
    >
      {/* Client + priority */}
      <div className="flex items-start justify-between gap-2">
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0"
          style={{ background: task.clientColor + '18', color: task.clientColor }}
        >
          {task.clientName}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wide flex-shrink-0" style={{ color: PRIORITY_COLORS[task.priority] }}>
          {task.priority === 'critical' ? 'CRÍTICA' : task.priority === 'high' ? 'ALTA' : task.priority === 'medium' ? 'MEDIA' : 'BAJA'}
        </span>
      </div>

      {/* Title */}
      <p className="text-[14px] font-semibold text-slate-800 group-hover:text-brand transition-colors leading-snug">
        {task.title}
      </p>

      {/* Status + dates */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-[11px] font-semibold px-2.5 py-1 rounded-lg"
          style={{ background: statusDef?.bg, color: statusDef?.color, border: `1px solid ${statusDef?.border}` }}
        >
          {statusDef?.label ?? task.status}
        </span>
        <span className={cn(
          'text-[11px] font-medium ml-auto',
          isOverdue ? 'text-red-500 font-bold' : isDueSoon ? 'text-red-500 font-bold' : 'text-slate-400',
        )}>
          {isOverdue
            ? `Venció hace ${Math.abs(daysLeft)}d`
            : daysLeft === 0 ? '¡Vence hoy!'
            : isDueSoon ? '¡Vence mañana!'
            : `${task.startDate.slice(5)} → ${task.dueDate.slice(5)}`}
        </span>
      </div>

      {/* Assignee */}
      <div className="flex items-center gap-2">
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
          style={{ background: task.clientColor }}
        >
          {task.assignee.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <span className="text-[12px] text-slate-500 truncate">{task.assignee}</span>
        <span className="text-[11px] text-slate-300 ml-auto flex-shrink-0">{task.estimatedHours}h est.</span>
      </div>

      {/* Dependency warning */}
      {task.dependsOnId && task.status === 'blocked' && (
        <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5">
          <GitBranch size={11} className="text-red-400 flex-shrink-0" />
          <span className="text-[11px] text-red-600 font-semibold">Bloqueada por dependencia</span>
        </div>
      )}
    </div>
  )
}

export function TaskCardSection() {
  const { appTasks, openEditTask } = useAppContext()
  const router = useRouter()

  const activeTasks = useMemo(() =>
    [...appTasks]
      .filter(t => t.status !== 'completed' && t.status !== 'cancelled')
      .sort((a, b) => (STATUS_PRIORITY[a.status] ?? 9) - (STATUS_PRIORITY[b.status] ?? 9))
      .slice(0, 6),
  [appTasks])

  const blockedCount     = appTasks.filter(t => t.status === 'blocked').length
  const waitingCount     = appTasks.filter(t => t.status === 'waiting_client').length
  const criticalDueCount = appTasks.filter(t => isCriticalDue(t.dueDate, t.status)).length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-[14px] font-bold text-slate-800">Tareas activas del equipo</h2>
          <div className="flex items-center gap-2">
            {blockedCount > 0 && (
              <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200">
                {blockedCount} bloqueadas
              </span>
            )}
            {waitingCount > 0 && (
              <span className="bg-amber-100 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                {waitingCount} esperando
              </span>
            )}
            {criticalDueCount > 0 && (
              <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200">
                {criticalDueCount} vencen hoy/mañana
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => router.push('/tareas?role=all')}
          className="flex items-center gap-1 text-[12px] font-semibold text-brand hover:text-brand-dark transition-colors flex-shrink-0"
        >
          Ver todas <ChevronRight size={13} />
        </button>
      </div>

      {activeTasks.length === 0 ? (
        <div className="card px-6 py-10 text-center">
          <p className="text-[13px] text-slate-400">No hay tareas activas en el sistema.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {activeTasks.map(task => (
            <AppTaskCard
              key={task.id}
              task={task}
              onEdit={() => openEditTask(task.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
