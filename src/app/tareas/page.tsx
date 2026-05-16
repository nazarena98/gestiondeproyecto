'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, Filter, AlertTriangle } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { TopBar } from '@/components/layout/TopBar'
import { useAppContext } from '@/context/AppContext'
import { STATUS_OPTIONS } from '@/types'
import type { AppTask, TaskStatus } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_MAP = Object.fromEntries(STATUS_OPTIONS.map(s => [s.value, s]))

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#EF4444', high: '#F97316', medium: '#F59E0B', low: '#94A3B8',
}

const CRITICAL_STATUSES: TaskStatus[] = ['blocked', 'waiting_client']

function isCriticalTask(task: AppTask): boolean {
  if (CRITICAL_STATUSES.includes(task.status)) return true
  if (['completed', 'cancelled', 'approved'].includes(task.status)) return false
  return Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / 86400000) <= 1
}

function TaskItem({ task, onEdit }: { task: AppTask; onEdit: () => void }) {
  const statusDef = STATUS_MAP[task.status]
  const daysLeft  = Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / 86400000)
  const isOverdue = daysLeft < 0

  return (
    <div
      className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-150 cursor-pointer group p-4"
      onClick={onEdit}
    >
      <div className="flex items-start gap-3">
        <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: PRIORITY_COLORS[task.priority] }} />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start gap-2 flex-wrap">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0"
              style={{ background: task.clientColor + '18', color: task.clientColor }}>
              {task.clientName}
            </span>
            <span className="text-[11px] text-slate-400 flex-shrink-0">{task.service}</span>
          </div>
          <p className="text-[14px] font-semibold text-slate-800 group-hover:text-brand transition-colors leading-snug">
            {task.title}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg"
              style={{ background: statusDef?.bg, color: statusDef?.color, border: `1px solid ${statusDef?.border}` }}>
              {statusDef?.label ?? task.status}
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                style={{ background: task.clientColor }}>
                {task.assignee.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
              <span className="text-[12px] text-slate-500">{task.assignee}</span>
            </div>
            <span className={cn(
              'text-[11px] font-medium ml-auto',
              isOverdue ? 'text-red-500' : daysLeft <= 2 ? 'text-amber-500' : 'text-slate-400',
            )}>
              {isOverdue ? `Venció ${Math.abs(daysLeft)}d` : daysLeft === 0 ? 'Vence hoy' : daysLeft === 1 ? '¡Vence mañana!' : `Vence ${task.dueDate}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

type StatusFilter = TaskStatus | 'all' | 'critical'

function TareasContent() {
  const { appTasks, openNewTask, openEditTask, activeUser, teamMembers, clients } = useAppContext()
  const searchParams = useSearchParams()

  const [roleFilter,   setRoleFilter]   = useState<string>('mine')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [clientFilter, setClientFilter] = useState<string>('all')

  // Pre-apply filters from URL params
  useEffect(() => {
    const f = searchParams.get('filter')
    const r = searchParams.get('role')
    if (f === 'critical') setStatusFilter('critical')
    if (r === 'all') setRoleFilter('all')
  }, [searchParams])

  const uniqueRoles = useMemo(() => {
    const roles = new Set(teamMembers.map(m => m.role))
    return Array.from(roles)
  }, [teamMembers])

  // Clients that actually have tasks
  const activeClients = useMemo(() => {
    const ids = new Set(appTasks.map(t => t.clientId))
    return clients.filter(c => ids.has(c.id))
  }, [appTasks, clients])

  const byRole = useMemo(() => {
    if (roleFilter === 'all')  return appTasks
    if (roleFilter === 'mine') return appTasks.filter(t => t.assignee === activeUser.name)
    const names = teamMembers.filter(m => m.role === roleFilter).map(m => m.name)
    return appTasks.filter(t => names.includes(t.assignee))
  }, [appTasks, roleFilter, activeUser.name, teamMembers])

  const byClient = useMemo(() =>
    clientFilter === 'all' ? byRole : byRole.filter(t => t.clientId === clientFilter),
    [byRole, clientFilter],
  )

  const filtered = useMemo(() => {
    if (statusFilter === 'all')      return byClient
    if (statusFilter === 'critical') return byClient.filter(isCriticalTask)
    return byClient.filter(t => t.status === statusFilter)
  }, [byClient, statusFilter])

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all:      byClient.length,
      critical: byClient.filter(isCriticalTask).length,
    }
    for (const s of STATUS_OPTIONS) {
      counts[s.value] = byClient.filter(t => t.status === s.value).length
    }
    return counts
  }, [byClient])

  const roleLabel =
    roleFilter === 'all'  ? 'todos' :
    roleFilter === 'mine' ? activeUser.name :
    roleFilter

  return (
    <main className="flex-1 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-slate-800">Tareas</h2>
          <p className="text-[13px] text-slate-400 mt-0.5">
            {byClient.length} tareas · mostrando <span className="font-semibold text-slate-600">{roleLabel}</span>
            {clientFilter !== 'all' && (
              <> · <span className="font-semibold text-slate-600">{clients.find(c => c.id === clientFilter)?.name}</span></>
            )}
          </p>
        </div>
        <button
          onClick={() => openNewTask()}
          className="flex items-center gap-2 bg-brand text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-dark transition-colors shadow-sm"
        >
          <Plus size={15} />
          Nueva tarea
        </button>
      </div>

      {/* Alerta críticas banner */}
      {statusFilter === 'critical' && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-[13px] font-semibold text-red-700">
            Mostrando tareas críticas — bloqueadas, esperando cliente o vencen hoy/mañana
          </p>
          <button
            onClick={() => setStatusFilter('all')}
            className="ml-auto text-[12px] text-red-500 hover:text-red-700 font-semibold underline flex-shrink-0"
          >
            Ver todas
          </button>
        </div>
      )}

      {/* Role filter */}
      <div className="bg-white rounded-2xl shadow-card px-4 py-3 flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-1 flex-shrink-0">Ver:</span>
        {[
          { key: 'mine', label: 'Mis tareas' },
          { key: 'all',  label: 'Todas' },
          ...uniqueRoles.map(r => ({ key: r, label: r })),
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setRoleFilter(key)}
            className={cn(
              'text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all',
              roleFilter === key
                ? 'bg-brand text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Client filter */}
      {activeClients.length > 1 && (
        <div className="bg-white rounded-2xl shadow-card px-4 py-3 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-1 flex-shrink-0">Cliente:</span>
          <button
            onClick={() => setClientFilter('all')}
            className={cn(
              'text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all',
              clientFilter === 'all' ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            )}
          >
            Todos
          </button>
          {activeClients.map(c => (
            <button
              key={c.id}
              onClick={() => setClientFilter(c.id)}
              className={cn(
                'flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all',
                clientFilter === c.id ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              )}
              style={clientFilter === c.id ? { background: c.color } : undefined}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: clientFilter === c.id ? 'white' : c.color }} />
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Status filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={13} className="text-slate-400 flex-shrink-0" />

        {/* Todas */}
        <button
          onClick={() => setStatusFilter('all')}
          className={cn(
            'flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all',
            statusFilter === 'all'
              ? 'bg-brand text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200',
          )}
        >
          Todas
          <span className={cn(
            'text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center',
            statusFilter === 'all' ? 'bg-white/25' : 'bg-slate-100 text-slate-500',
          )}>
            {statusCounts.all}
          </span>
        </button>

        {/* Críticas chip — always visible if there are any */}
        {statusCounts.critical > 0 && (
          <button
            onClick={() => setStatusFilter('critical')}
            className={cn(
              'flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all',
              statusFilter === 'critical'
                ? 'bg-red-500 text-white shadow-sm'
                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200',
            )}
          >
            {statusFilter !== 'critical' && <AlertTriangle size={11} className="flex-shrink-0" />}
            Críticas
            <span className={cn(
              'text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center',
              statusFilter === 'critical' ? 'bg-white/25' : 'bg-red-100 text-red-500',
            )}>
              {statusCounts.critical}
            </span>
          </button>
        )}

        {/* Per-status chips */}
        {STATUS_OPTIONS.filter(s => (statusCounts[s.value] ?? 0) > 0).map(s => {
          const active = statusFilter === s.value
          return (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={cn(
                'flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all',
                active
                  ? 'bg-brand text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200',
              )}
            >
              {!active && (
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
              )}
              {s.label}
              <span className={cn(
                'text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center',
                active ? 'bg-white/25' : 'bg-slate-100 text-slate-500',
              )}>
                {statusCounts[s.value]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Task grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[15px] font-semibold text-slate-500 mb-2">No hay tareas en esta categoría</p>
          <button onClick={() => openNewTask()} className="text-brand font-semibold hover:underline text-[13px]">
            + Crear nueva tarea
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(task => (
            <TaskItem key={task.id} task={task} onEdit={() => openEditTask(task.id)} />
          ))}
        </div>
      )}
    </main>
  )
}

export default function TareasPage() {
  return (
    <MainLayout>
      <TopBar
        greeting="Tareas"
        subtitle="Filtrá por rubro, estado o responsable"
      />
      <Suspense>
        <TareasContent />
      </Suspense>
    </MainLayout>
  )
}
