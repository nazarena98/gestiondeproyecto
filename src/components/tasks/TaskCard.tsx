'use client'

import { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Clock, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTaskContext } from '@/context/TaskContext'
import { STATUS_OPTIONS, PRIORITY_COLORS, type GanttTask, type TaskStatus } from '@/types'

interface TaskCardProps {
  task: GanttTask
  compact?: boolean
}

function StatusDot({ status }: { status: TaskStatus }) {
  const opt = STATUS_OPTIONS.find(o => o.value === status)
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-full border"
      style={{ color: opt?.color, background: opt?.bg, borderColor: opt?.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: opt?.color }} />
      {opt?.label}
    </span>
  )
}

export function TaskCard({ task, compact = false }: TaskCardProps) {
  const { updateTaskStatus, updateTaskDates } = useTaskContext()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dateEditOpen, setDateEditOpen] = useState(false)
  const [startVal, setStartVal] = useState(format(task.startDate, 'yyyy-MM-dd'))
  const [dueVal, setDueVal] = useState(format(task.dueDate, 'yyyy-MM-dd'))
  const menuRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  function handleStatusSelect(value: TaskStatus) {
    updateTaskStatus(task.id, value)
    setMenuOpen(false)
  }

  function handleDateSave() {
    const start = new Date(startVal + 'T00:00:00')
    const due   = new Date(dueVal   + 'T00:00:00')
    if (!isNaN(start.getTime()) && !isNaN(due.getTime()) && due >= start) {
      updateTaskDates(task.id, start, due)
    }
    setDateEditOpen(false)
  }

  const priorityColor = PRIORITY_COLORS[task.priority]
  const statusOpt = STATUS_OPTIONS.find(o => o.value === task.status)

  const isUrgent = task.status === 'blocked' || task.status === 'correction'
  const isGood   = task.status === 'approved' || task.status === 'completed'

  return (
    <div
      ref={cardRef}
      className={cn(
        'card relative flex flex-col gap-3 p-4 transition-all duration-200',
        'hover:shadow-card-hover cursor-pointer select-none',
        isUrgent && 'border-red-200 bg-red-50/40',
        isGood   && 'border-emerald-200 bg-emerald-50/30',
        compact  && 'p-3 gap-2',
      )}
    >
      {/* Priority stripe */}
      <div
        className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
        style={{ background: priorityColor }}
      />

      {/* Top row: client + priority */}
      <div className="flex items-center justify-between pl-2">
        <span
          className="text-[10px] font-bold text-white px-2 py-0.5 rounded-md"
          style={{ background: task.clientColor }}
        >
          {task.clientName}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: priorityColor }}>
          {task.priority}
        </span>
      </div>

      {/* Task title */}
      <p className={cn(
        'font-semibold text-slate-800 leading-snug pl-2',
        compact ? 'text-[12px]' : 'text-[13px]',
      )}>
        {task.title}
      </p>

      {/* Status button (clickable) */}
      <div className="relative pl-2" ref={menuRef}>
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen) }}
          className={cn(
            'flex items-center gap-2 rounded-lg px-2 py-1.5 border transition-all duration-150 group',
            'hover:shadow-sm',
          )}
          style={{ background: statusOpt?.bg, borderColor: statusOpt?.border }}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: statusOpt?.color }} />
          <span className="text-[11px] font-bold" style={{ color: statusOpt?.color }}>{statusOpt?.label}</span>
          <ChevronDown
            size={11}
            className="ml-auto transition-transform duration-150"
            style={{ color: statusOpt?.color, transform: menuOpen ? 'rotate(180deg)' : 'rotate(0)' }}
          />
        </button>

        {/* Status dropdown */}
        {menuOpen && (
          <div className="absolute left-0 top-full mt-1.5 z-50 w-56 bg-white rounded-xl shadow-dropdown border border-slate-100 py-1.5 overflow-hidden">
            <p className="text-label text-slate-400 px-3 py-2 border-b border-slate-50">
              Cambiar estado
            </p>
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleStatusSelect(opt.value)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 transition-colors',
                  task.status === opt.value && 'bg-slate-50',
                )}
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: opt.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-slate-700">{opt.label}</p>
                  <p className="text-[10px] text-slate-400">{opt.description}</p>
                </div>
                {task.status === opt.value && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dates + edit */}
      <div className="pl-2">
        {!dateEditOpen ? (
          <button
            onClick={() => setDateEditOpen(true)}
            className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-brand transition-colors group"
          >
            <Calendar size={11} className="flex-shrink-0" />
            <span>{format(task.startDate, 'd MMM', { locale: es })}</span>
            <span className="text-slate-300">→</span>
            <span>{format(task.dueDate, 'd MMM', { locale: es })}</span>
            <span className="text-slate-300 group-hover:text-brand/40 ml-1 text-[10px]">✎</span>
          </button>
        ) : (
          <div className="flex flex-col gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-label text-slate-400 text-[10px]">Editar fechas</p>
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <p className="text-[10px] text-slate-400 mb-0.5">Inicio</p>
                <input
                  type="date"
                  value={startVal}
                  onChange={e => setStartVal(e.target.value)}
                  className="w-full text-[11px] bg-white border border-slate-200 rounded-md px-2 py-1 outline-none focus:border-brand/40 font-sans"
                />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 mb-0.5">Vencimiento</p>
                <input
                  type="date"
                  value={dueVal}
                  onChange={e => setDueVal(e.target.value)}
                  className="w-full text-[11px] bg-white border border-slate-200 rounded-md px-2 py-1 outline-none focus:border-brand/40 font-sans"
                />
              </div>
            </div>
            <div className="flex items-center gap-1.5 pt-0.5">
              <button
                onClick={handleDateSave}
                className="flex-1 text-[11px] font-bold bg-brand text-white rounded-md py-1.5 hover:bg-brand-dark transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={() => setDateEditOpen(false)}
                className="px-2 py-1.5 text-[11px] text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom row: assignee + hours */}
      <div className="flex items-center justify-between pl-2">
        <div className="flex items-center gap-1.5">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ background: task.assigneeColor }}
          >
            {task.assigneeAvatar}
          </div>
          <span className="text-[11px] text-slate-500">{task.assigneeName}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Clock size={10} />
          <span>{task.loggedHours}h / {task.estimatedHours}h</span>
        </div>
      </div>

      {/* Blocker warning */}
      {task.blockerDescription && task.status === 'blocked' && (
        <div className="ml-2 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5">
          <p className="text-[10px] font-bold text-red-500 mb-0.5">⚠ Bloqueada</p>
          <p className="text-[11px] text-red-600">{task.blockerDescription}</p>
        </div>
      )}
    </div>
  )
}
