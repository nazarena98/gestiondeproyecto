import { ChevronRight, CheckCircle2, Play, RefreshCw, MessageSquare, Timer, FolderPlus, AlertOctagon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ActivityItem } from '@/lib/mock-data'

function timeAgo(minutes: number): string {
  if (minutes < 60)   return `hace ${minutes}min`
  if (minutes < 1440) return `hace ${Math.round(minutes / 60)}h`
  return `hace ${Math.round(minutes / 1440)}d`
}

function getActionIcon(action: string) {
  if (action.includes('completó'))      return { Icon: CheckCircle2, color: 'text-emerald-500' }
  if (action.includes('inició'))        return { Icon: Play, color: 'text-blue-500' }
  if (action.includes('cambió'))        return { Icon: RefreshCw, color: 'text-violet-500' }
  if (action.includes('comentó'))       return { Icon: MessageSquare, color: 'text-slate-400' }
  if (action.includes('time tracking')) return { Icon: Timer, color: 'text-amber-500' }
  if (action.includes('creó'))          return { Icon: FolderPlus, color: 'text-brand' }
  if (action.includes('bloqueada'))     return { Icon: AlertOctagon, color: 'text-red-500' }
  return { Icon: RefreshCw, color: 'text-slate-400' }
}

interface ActivityFeedProps {
  items: ActivityItem[]
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 className="text-[14px] font-bold text-slate-800">Actividad reciente</h2>
        <button className="text-[11px] font-semibold text-brand hover:text-brand-dark flex items-center gap-1 transition-colors">
          Ver todo <ChevronRight size={12} />
        </button>
      </div>

      {/* Feed */}
      <div className="divide-y divide-slate-50">
        {items.map((item, idx) => {
          const { Icon, color } = getActionIcon(item.action)
          return (
            <div
              key={item.id}
              className="flex items-start gap-3.5 px-5 py-3.5 hover:bg-slate-50/60 cursor-pointer transition-colors group"
            >
              {/* Avatar + action icon */}
              <div className="relative flex-shrink-0">
                <div
                  className="avatar avatar-md"
                  style={{ background: item.actorColor }}
                >
                  {item.actorAvatar}
                </div>
                <div className={cn(
                  'absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-white rounded-full flex items-center justify-center shadow-sm border border-white',
                )}>
                  <Icon size={10} className={color} />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-slate-600 leading-snug">
                  <span className="font-semibold text-slate-800">{item.actorName}</span>
                  {' '}{item.action}{' '}
                  <span className="font-semibold text-slate-700 group-hover:text-brand transition-colors">
                    {item.target}
                  </span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded"
                    style={{ background: '#94A3B8' }}
                  >
                    {item.clientName}
                  </span>
                  <span className="text-[11px] text-slate-400">{timeAgo(item.minutesAgo)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
