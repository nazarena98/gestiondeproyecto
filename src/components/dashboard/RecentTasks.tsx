'use client'

import Link from 'next/link'
import { ArrowRight, Plus } from 'lucide-react'
import { useAppContext } from '@/context/AppContext'
import { STATUS_OPTIONS } from '@/types'

const STATUS_MAP = Object.fromEntries(STATUS_OPTIONS.map(s => [s.value, s]))

export function RecentTasks() {
  const { appTasks, openNewTask, openEditTask } = useAppContext()

  const recent = [...appTasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 7)

  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-[14px] font-bold text-slate-800">Tareas Recientes</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">{appTasks.length} tareas en el sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openNewTask()}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-brand hover:bg-brand/5 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={13} />
            Nueva tarea
          </button>
          <Link
            href="/tareas"
            className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500 hover:text-brand transition-colors px-2 py-1.5"
          >
            Ver todas
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      <div className="divide-y divide-slate-50">
        {recent.map(task => {
          const statusDef = STATUS_MAP[task.status]
          const daysLeft  = Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / 86400000)
          const isOverdue = daysLeft < 0

          return (
            <div
              key={task.id}
              className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
              onClick={() => openEditTask(task.id)}
            >
              {/* Client color dot */}
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: task.clientColor }}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-800 truncate">{task.title}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {task.clientName} · {task.service} · {task.assignee}
                </p>
              </div>

              {/* Status */}
              <span
                className="text-[10px] font-semibold px-2 py-1 rounded-lg flex-shrink-0 hidden sm:block"
                style={{ background: statusDef?.bg, color: statusDef?.color }}
              >
                {statusDef?.label}
              </span>

              {/* Due */}
              <span className={`text-[11px] font-medium flex-shrink-0 ${isOverdue ? 'text-red-500' : daysLeft <= 2 ? 'text-amber-500' : 'text-slate-400'}`}>
                {isOverdue ? `${Math.abs(daysLeft)}d` : daysLeft === 0 ? 'Hoy' : daysLeft === 1 ? 'Mañana' : `${daysLeft}d`}
              </span>
            </div>
          )
        })}

        {recent.length === 0 && (
          <div className="px-5 py-8 text-center">
            <p className="text-[13px] text-slate-400 mb-3">No hay tareas todavía.</p>
            <button
              onClick={() => openNewTask()}
              className="bg-brand text-white text-[12px] font-semibold px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors"
            >
              + Crear primera tarea
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
