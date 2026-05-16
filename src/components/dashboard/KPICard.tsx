import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  iconColor: string
  iconBg: string
  trend?: { value: number; positive: boolean; label: string }
  urgent?: boolean
  onClick?: () => void
}

export function KPICard({
  title, value, subtitle, icon: Icon,
  iconColor, iconBg, trend, urgent, onClick,
}: KPICardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'card card-hover p-5',
        onClick ? 'cursor-pointer' : 'cursor-default',
        urgent && 'border-red-200 bg-red-50/60',
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconBg)}>
          <Icon size={18} className={iconColor} />
        </div>
        {trend && (
          <div className={cn(
            'flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full',
            trend.positive
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-red-50 text-red-500',
          )}>
            {trend.positive
              ? <TrendingUp size={11} />
              : <TrendingDown size={11} />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      <p className={cn(
        'text-3xl font-bold tracking-tight mb-1',
        urgent ? 'text-red-600' : 'text-slate-800',
      )}>
        {value}
      </p>
      <p className="text-[13px] font-semibold text-slate-600">{title}</p>
      {subtitle && (
        <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
      )}
    </div>
  )
}
