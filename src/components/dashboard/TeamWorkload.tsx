import { Users, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROLE_LABELS } from '@/lib/utils'
import type { TeamMember } from '@/lib/mock-data'

function workloadColor(pct: number): { bar: string; text: string; bg: string } {
  if (pct >= 90) return { bar: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50' }
  if (pct >= 75) return { bar: 'bg-amber-400', text: 'text-amber-600', bg: 'bg-amber-50' }
  return { bar: 'bg-emerald-400', text: 'text-emerald-600', bg: 'bg-emerald-50' }
}

interface TeamWorkloadProps {
  team: TeamMember[]
}

export function TeamWorkload({ team }: TeamWorkloadProps) {
  const online = team.filter((m) => m.online).length

  return (
    <div className="card flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <Users size={15} className="text-slate-500" />
          <h2 className="text-[14px] font-bold text-slate-800">Carga del equipo</h2>
          <span className="flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {online} online
          </span>
        </div>
        <button className="text-[11px] font-semibold text-brand hover:text-brand-dark flex items-center gap-1 transition-colors">
          Ver equipo <ChevronRight size={12} />
        </button>
      </div>

      {/* Members */}
      <div className="flex-1 divide-y divide-slate-50">
        {team.map((member) => {
          const { bar, text, bg } = workloadColor(member.capacityPercent)
          const isOverloaded = member.capacityPercent >= 90

          return (
            <div
              key={member.id}
              className={cn(
                'flex items-center gap-3 px-5 py-3 hover:bg-slate-50/60 cursor-pointer transition-colors',
                isOverloaded && 'bg-red-50/40 hover:bg-red-50/70',
              )}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className="avatar avatar-sm"
                  style={{ background: member.color }}
                >
                  {member.avatar}
                </div>
                {member.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                )}
              </div>

              {/* Name + role */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <p className="text-[12px] font-semibold text-slate-800 truncate leading-none">
                    {member.name}
                  </p>
                  {isOverloaded && (
                    <span className="text-[9px] font-bold text-red-500 bg-red-100 px-1 py-0.5 rounded uppercase tracking-wide flex-shrink-0">
                      Sobrecargada
                    </span>
                  )}
                </div>
                {/* Progress bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-700', bar)}
                      style={{ width: `${member.capacityPercent}%` }}
                    />
                  </div>
                  <span className={cn('text-[10px] font-bold w-8 text-right flex-shrink-0', text)}>
                    {member.capacityPercent}%
                  </span>
                </div>
              </div>

              {/* Task count */}
              <div className="flex-shrink-0 text-right">
                <p className="text-[13px] font-bold text-slate-700">{member.taskCount}</p>
                <p className="text-[10px] text-slate-400">tareas</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Promedio de carga</span>
          <span className="font-bold text-slate-700">
            {Math.round(team.reduce((a, m) => a + m.capacityPercent, 0) / team.length)}%
          </span>
        </div>
      </div>
    </div>
  )
}
