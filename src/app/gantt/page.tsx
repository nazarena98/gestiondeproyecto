'use client'

import { useState, useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { TopBar } from '@/components/layout/TopBar'
import { GanttChart } from '@/components/gantt/GanttChart'
import { useAppContext } from '@/context/AppContext'
import { cn } from '@/lib/utils'

function Select({
  value, onChange, options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none bg-white border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-[13px] font-medium text-slate-700 focus:outline-none focus:border-brand cursor-pointer hover:border-slate-300 transition-colors"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  )
}

function GanttContent() {
  const { clients, teamMembers } = useAppContext()
  const [clientFilter, setClientFilter] = useState('all')
  const [roleFilter,   setRoleFilter]   = useState('all')

  const clientOptions = [
    { value: 'all', label: 'Todos los clientes' },
    ...clients.map(c => ({ value: c.id, label: c.name })),
  ]

  const uniqueRoles = useMemo(() => {
    const roles = new Set(teamMembers.map(m => m.role))
    return Array.from(roles)
  }, [teamMembers])

  const roleOptions = [
    { value: 'all', label: 'Todos los rubros' },
    ...uniqueRoles.map(r => ({ value: r, label: r })),
  ]

  const filterAssigneeNames = useMemo(() => {
    if (roleFilter === 'all') return undefined
    return teamMembers.filter(m => m.role === roleFilter).map(m => m.name)
  }, [roleFilter, teamMembers])

  const filterClientId = clientFilter === 'all' ? undefined : clientFilter

  return (
    <main className="flex-1 p-6 space-y-4">
      {/* Filters bar */}
      <div className="bg-white rounded-2xl shadow-card px-5 py-3.5 flex items-center gap-4 flex-wrap">
        <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wide flex-shrink-0">Filtrar por:</p>
        <Select value={clientFilter} onChange={setClientFilter} options={clientOptions} />
        <Select value={roleFilter}   onChange={setRoleFilter}   options={roleOptions} />
        {(clientFilter !== 'all' || roleFilter !== 'all') && (
          <button
            onClick={() => { setClientFilter('all'); setRoleFilter('all') }}
            className="text-[12px] font-semibold text-brand hover:text-brand-dark transition-colors"
          >
            Limpiar filtros
          </button>
        )}
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {clientFilter !== 'all' && (
            <span
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full text-white"
              style={{ background: clients.find(c => c.id === clientFilter)?.color ?? '#FF6B35' }}
            >
              {clients.find(c => c.id === clientFilter)?.name}
            </span>
          )}
          {roleFilter !== 'all' && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-700 text-white">
              {roleFilter}
            </span>
          )}
        </div>
      </div>

      <GanttChart
        filterClientId={filterClientId}
        filterAssigneeNames={filterAssigneeNames}
      />
    </main>
  )
}

export default function GanttPage() {
  return (
    <MainLayout>
      <TopBar
        greeting="Gantt Global"
        subtitle="Vista completa de dependencias y línea de tiempo — filtrá por cliente o rubro"
      />
      <GanttContent />
    </MainLayout>
  )
}
