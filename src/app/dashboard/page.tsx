'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  FolderOpen, CheckSquare, AlertTriangle, Users, Clock, Info,
} from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { TopBar } from '@/components/layout/TopBar'
import { KPICard } from '@/components/dashboard/KPICard'
import { RecentTasks } from '@/components/dashboard/RecentTasks'
import { TaskCardSection } from '@/components/tasks/TaskCardSection'
import { GanttChart } from '@/components/gantt/GanttChart'
import { useAppContext } from '@/context/AppContext'
import { STATUS_OPTIONS } from '@/types'

const TODAY = '2026-05-15'

function DashboardContent() {
  const router = useRouter()
  const { clients, appTasks, teamMembers } = useAppContext()

  const todayTasks = useMemo(() =>
    appTasks.filter(t =>
      t.status !== 'completed' && t.status !== 'cancelled' &&
      t.startDate <= TODAY && t.dueDate >= TODAY
    ), [appTasks])

  const criticalCount = useMemo(() => {
    const now = Date.now()
    return appTasks.filter(t => {
      if (t.status === 'blocked' || t.status === 'waiting_client') return true
      if (['completed', 'cancelled', 'approved'].includes(t.status)) return false
      return Math.ceil((new Date(t.dueDate).getTime() - now) / 86400000) <= 1
    }).length
  }, [appTasks])

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of appTasks) {
      if (t.status !== 'completed' && t.status !== 'cancelled') {
        counts[t.status] = (counts[t.status] ?? 0) + 1
      }
    }
    return counts
  }, [appTasks])

  const KPIs = [
    {
      title: 'Clientes activos',
      value: clients.length,
      subtitle: `${clients.length} clientes en cartera`,
      icon: FolderOpen,
      iconColor: 'text-brand',
      iconBg: 'bg-brand/10',
      onClick: () => router.push('/clientes'),
    },
    {
      title: 'Tareas para hoy',
      value: todayTasks.length,
      subtitle: `Activas hoy`,
      icon: CheckSquare,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-50',
      onClick: () => router.push('/tareas'),
    },
    {
      title: 'Alertas críticas',
      value: criticalCount,
      subtitle: `Bloqueadas y esperando`,
      icon: AlertTriangle,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-50',
      urgent: criticalCount > 0,
      onClick: () => router.push('/tareas?filter=critical'),
    },
    {
      title: 'Equipo',
      value: teamMembers.length,
      subtitle: `Miembros registrados`,
      icon: Users,
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-50',
    },
  ]

  const activeStatusRows = STATUS_OPTIONS.filter(s =>
    s.value !== 'completed' && s.value !== 'cancelled' && (statusCounts[s.value] ?? 0) > 0
  )

  return (
    <main className="flex-1 p-6 space-y-6">
      {/* KPI ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIs.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* STATUS STRIP */}
      <div className="card px-5 py-3.5">
        <div className="flex items-center gap-2 mb-2.5">
          <Clock size={13} className="text-slate-400" />
          <span className="text-label text-slate-400">Estado actual del portafolio</span>
        </div>
        <div className="flex items-center gap-6 flex-wrap">
          {activeStatusRows.length === 0 ? (
            <p className="text-[12px] text-slate-400">Sin tareas activas</p>
          ) : (
            activeStatusRows.map(s => (
              <button
                key={s.value}
                onClick={() => router.push('/tareas')}
                className="flex items-center gap-2 cursor-pointer group hover:opacity-80 transition-opacity"
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                <span className="text-[13px] font-bold text-slate-700">{statusCounts[s.value] ?? 0}</span>
                <span className="text-[12px] text-slate-500 group-hover:text-slate-700 transition-colors">{s.label}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* HINT BANNER */}
      <div className="bg-brand/5 border border-brand/20 rounded-xl px-4 py-3 flex items-center gap-3">
        <Info size={15} className="text-brand flex-shrink-0" />
        <p className="text-[12px] text-brand/80 font-medium">
          <span className="font-bold">Datos en tiempo real.</span>
          {' '}Las KPIs y el estado del portafolio se actualizan al crear o modificar tareas.
        </p>
      </div>

      <RecentTasks />
      <TaskCardSection />
      <GanttChart />
    </main>
  )
}

export default function DashboardPage() {
  return (
    <MainLayout>
      <TopBar
        greeting="Dashboard"
        subtitle="Vista general del portafolio"
      />
      <DashboardContent />
    </MainLayout>
  )
}
