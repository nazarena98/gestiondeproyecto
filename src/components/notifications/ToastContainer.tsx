'use client'

import { X, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTaskContext } from '@/context/TaskContext'
import type { ToastMessage } from '@/types'

const TOAST_CONFIG: Record<ToastMessage['type'], {
  Icon: React.ElementType
  iconColor: string
  iconBg: string
  borderColor: string
  progressColor: string
}> = {
  success: {
    Icon: CheckCircle2, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-50',
    borderColor: 'border-l-emerald-400', progressColor: 'bg-emerald-400',
  },
  warning: {
    Icon: AlertTriangle, iconColor: 'text-amber-500', iconBg: 'bg-amber-50',
    borderColor: 'border-l-amber-400', progressColor: 'bg-amber-400',
  },
  error: {
    Icon: XCircle, iconColor: 'text-red-500', iconBg: 'bg-red-50',
    borderColor: 'border-l-red-400', progressColor: 'bg-red-400',
  },
  info: {
    Icon: Info, iconColor: 'text-blue-500', iconBg: 'bg-blue-50',
    borderColor: 'border-l-blue-400', progressColor: 'bg-blue-400',
  },
}

function Toast({ toast }: { toast: ToastMessage }) {
  const { dismissToast } = useTaskContext()
  const { Icon, iconColor, iconBg, borderColor, progressColor } = TOAST_CONFIG[toast.type]

  return (
    <div
      className={cn(
        'relative w-[360px] bg-white rounded-xl shadow-dropdown border border-slate-100 border-l-4',
        'flex items-start gap-3 px-4 py-3.5 overflow-hidden font-sans',
        borderColor,
        toast.exiting ? 'animate-toast-out' : 'animate-toast-in',
      )}
    >
      {/* Icon */}
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5', iconBg)}>
        <Icon size={15} className={iconColor} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-slate-800 leading-snug">{toast.title}</p>
        {toast.message && (
          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{toast.message}</p>
        )}
      </div>

      {/* Close */}
      <button
        onClick={() => dismissToast(toast.id)}
        className="flex-shrink-0 p-1 rounded-md text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-colors mt-0.5"
      >
        <X size={13} />
      </button>

      {/* Auto-dismiss progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100 overflow-hidden rounded-b-xl">
        <div
          className={cn('h-full rounded-full', progressColor)}
          style={{
            animation: `progress-shrink ${toast.duration}ms linear forwards`,
          }}
        />
      </div>
    </div>
  )
}

export function ToastContainer() {
  const { toasts } = useTaskContext()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} />
        </div>
      ))}
    </div>
  )
}
