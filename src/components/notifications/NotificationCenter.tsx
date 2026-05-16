'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck, X, Plus, RefreshCw, User2, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useAppContext } from '@/context/AppContext'
import type { UserNotificationType } from '@/types'

const NOTIF_ICONS: Record<UserNotificationType, {
  Icon: React.ElementType; color: string; bg: string
}> = {
  task_created:        { Icon: Plus,          color: 'text-blue-500',    bg: 'bg-blue-50'    },
  task_status_changed: { Icon: RefreshCw,     color: 'text-orange-500',  bg: 'bg-orange-50'  },
  task_due_soon:       { Icon: AlertTriangle, color: 'text-red-500',     bg: 'bg-red-50'     },
  task_assigned:       { Icon: User2,         color: 'text-purple-500',  bg: 'bg-purple-50'  },
}

export function NotificationCenter() {
  const {
    notifications, unreadCount,
    markNotificationRead, markAllNotificationsRead,
    appTasks,
  } = useAppContext()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const btnRef   = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        btnRef.current   && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function handleNotifClick(id: string, taskId?: string) {
    markNotificationRead(id)
    if (taskId) {
      const task = appTasks.find(t => t.id === taskId)
      if (task) router.push(`/clientes/${task.clientId}?task=${taskId}`)
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className={cn(
          'relative p-2 rounded-lg transition-all duration-150',
          open ? 'bg-brand/10 text-brand' : 'hover:bg-slate-50 text-slate-500',
        )}
        title="Centro de notificaciones"
      >
        <Bell size={18} className={cn('transition-colors', open ? 'text-brand' : 'text-slate-500')} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center px-0.5">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-xl shadow-dropdown border border-slate-100 z-50 flex flex-col max-h-[80vh] font-sans"
          style={{ animation: 'toast-slide-in 0.2s ease-out forwards' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-slate-600" />
              <h3 className="text-[14px] font-bold text-slate-800">Notificaciones</h3>
              {unreadCount > 0 && (
                <span className="bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount} sin leer
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="flex items-center gap-1 text-[11px] text-brand hover:text-brand-dark font-semibold px-2 py-1 rounded-md hover:bg-brand/5 transition-colors"
                >
                  <CheckCheck size={12} />
                  Marcar todo
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Bell size={28} className="mb-2 opacity-30" />
                <p className="text-[13px]">Sin notificaciones</p>
              </div>
            ) : (
              notifications.map(notif => {
                const iconDef = NOTIF_ICONS[notif.type] ?? NOTIF_ICONS['task_status_changed']
                const { Icon, color, bg } = iconDef
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleNotifClick(notif.id, notif.taskId)}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50/60',
                      !notif.read && 'bg-brand/[0.03]',
                      notif.taskId && 'cursor-pointer',
                    )}
                  >
                    {/* Icon */}
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5', bg)}>
                      <Icon size={14} className={color} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn('text-[12px] font-semibold text-slate-800 leading-snug', !notif.read && 'text-slate-900')}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-brand flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{notif.message}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <p className="text-[10px] text-slate-400">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: es })}
                        </p>
                        {notif.taskId && (
                          <span className="text-[10px] text-brand font-semibold">Ver tarea →</span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 text-center">
              <p className="text-[11px] text-slate-400">{notifications.length} notificaciones en total</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
