import { AlertTriangle, Clock, ChevronRight, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AlertItem } from '@/lib/mock-data'

function timeAgo(minutes: number): string {
  if (minutes < 60) return `hace ${minutes}min`
  if (minutes < 1440) return `hace ${Math.round(minutes / 60)}h`
  return `hace ${Math.round(minutes / 1440)}d`
}

const TYPE_CONFIG = {
  blocked: {
    dot: 'bg-red-500',
    badge: 'bg-red-100 text-red-600 border-red-200',
    label: 'Bloqueada',
    border: 'border-l-red-500',
  },
  overdue: {
    dot: 'bg-orange-500',
    badge: 'bg-orange-100 text-orange-600 border-orange-200',
    label: 'Vencida',
    border: 'border-l-orange-500',
  },
  waiting: {
    dot: 'bg-amber-400',
    badge: 'bg-amber-100 text-amber-600 border-amber-200',
    label: 'Esperando',
    border: 'border-l-amber-400',
  },
}

interface AlertsPanelProps {
  alerts: AlertItem[]
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <div className="card flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <AlertTriangle size={16} className="text-red-500" />
          <h2 className="text-[14px] font-bold text-slate-800">Panel de Alertas</h2>
          <span className="bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {alerts.length}
          </span>
        </div>
        <button className="text-[11px] font-semibold text-brand hover:text-brand-dark flex items-center gap-1 transition-colors">
          Ver todas <ChevronRight size={12} />
        </button>
      </div>

      {/* Alert list */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
        {alerts.map((alert) => {
          const cfg = TYPE_CONFIG[alert.type]
          return (
            <div
              key={alert.id}
              className={cn(
                'px-5 py-3.5 border-l-2 hover:bg-slate-50/60 cursor-pointer transition-colors group',
                cfg.border,
              )}
            >
              <div className="flex items-start gap-3">
                <span className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', cfg.dot)} />
                <div className="flex-1 min-w-0">
                  {/* Task name */}
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[13px] font-semibold text-slate-800 truncate group-hover:text-brand transition-colors">
                      {alert.taskTitle}
                    </p>
                    <ExternalLink size={11} className="text-slate-300 group-hover:text-brand flex-shrink-0 transition-colors" />
                  </div>
                  {/* Client + project */}
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                      style={{ background: alert.clientColor }}
                    >
                      {alert.clientName}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate">{alert.projectName}</span>
                  </div>
                  {/* Reason */}
                  <p className="text-[12px] text-slate-500 mb-2 line-clamp-1">
                    ⚠ {alert.reason}
                  </p>
                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span className={cn('badge text-[10px] border', cfg.badge)}>
                      {cfg.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">{alert.assigneeName}</span>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock size={10} />
                        {timeAgo(alert.minutesAgo)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer CTA */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
        <button className="w-full text-[12px] font-semibold text-slate-500 hover:text-brand transition-colors flex items-center justify-center gap-1">
          Ver historial completo de alertas <ChevronRight size={12} />
        </button>
      </div>
    </div>
  )
}
