'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, CheckSquare, Calendar,
  GanttChart, BookOpen, MessageCircle, Settings, Zap, ChevronUp, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppContext } from '@/context/AppContext'

const NAV = [
  { href: '/dashboard',    label: 'Dashboard',         icon: LayoutDashboard },
  { href: '/clientes',     label: 'Clientes',          icon: Users },
  { href: '/tareas',       label: 'Mis Tareas',        icon: CheckSquare },
  { href: '/calendario',   label: 'Calendario Global', icon: Calendar },
  { href: '/gantt',        label: 'Gantt Global',      icon: GanttChart },
  { href: '/conocimiento', label: 'Hub Conocimiento',  icon: BookOpen },
  { href: '/chat',         label: 'Chat',              icon: MessageCircle },
]

export function Sidebar() {
  const pathname  = usePathname()
  const { activeUser, teamMembers, setActiveUser, logout } = useAppContext()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Close dropdown on outside click
  useEffect(() => {
    if (!showUserMenu) return
    function handleClick() { setShowUserMenu(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showUserMenu])

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar flex flex-col z-50 select-none">
      {/* Logo → dashboard */}
      <Link href="/dashboard" className="px-5 py-5 border-b border-white/[0.08] hover:bg-white/[0.04] transition-colors block">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center flex-shrink-0 shadow-lg">
            <Zap className="w-4.5 h-4.5 text-white" fill="white" size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm tracking-widest truncate">NAZARENA</p>
            <p className="text-white/40 text-[11px] truncate">Digital Agency · PPM</p>
          </div>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-4 pb-2 overflow-y-auto scrollbar-hide space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-brand text-white shadow-md'
                  : 'text-white/55 hover:text-white hover:bg-white/[0.07]',
              )}
            >
              <Icon size={16} className="flex-shrink-0" />
              <span className="flex-1 truncate">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pt-2 pb-4 border-t border-white/[0.08]">
        <Link
          href="/configuracion"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
            pathname === '/configuracion'
              ? 'bg-brand text-white'
              : 'text-white/55 hover:text-white hover:bg-white/[0.07]',
          )}
        >
          <Settings size={16} />
          <span>Configuración</span>
        </Link>

        {/* User switcher */}
        <div className="relative mt-2" onClick={e => e.stopPropagation()}>
          {/* Dropdown (opens upward) */}
          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#1E2242] border border-white/[0.10] rounded-xl shadow-dropdown overflow-hidden z-50">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 pt-3 pb-2">
                Cambiar usuario
              </p>
              {teamMembers.map(member => (
                <button
                  key={member.id}
                  onClick={() => { setActiveUser(member); setShowUserMenu(false) }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left',
                    activeUser.id === member.id
                      ? 'bg-white/[0.08] text-white'
                      : 'text-white/60 hover:bg-white/[0.05] hover:text-white',
                  )}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                    style={{ background: member.color }}
                  >
                    {member.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold truncate">{member.name}</p>
                    <p className="text-[10px] text-white/40 truncate">{member.role}</p>
                  </div>
                  {activeUser.id === member.id && (
                    <span className="text-brand text-[11px] font-bold">✓</span>
                  )}
                </button>
              ))}
              <div className="border-t border-white/[0.08] mt-1 pt-1">
                <button
                  onClick={() => { logout(); setShowUserMenu(false); router.replace('/login') }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
                >
                  <LogOut size={14} className="flex-shrink-0" />
                  <span className="text-[12px] font-semibold">Cerrar sesión</span>
                </button>
              </div>
            </div>
          )}

          {/* Active user pill */}
          <button
            onClick={() => setShowUserMenu(v => !v)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.05] cursor-pointer transition-colors"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
              style={{ background: activeUser.color }}
            >
              {activeUser.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[13px] font-semibold truncate text-left">{activeUser.name}</p>
              <p className="text-white/40 text-[11px] truncate text-left">{activeUser.role}</p>
            </div>
            <ChevronUp
              size={13}
              className={cn(
                'text-white/40 transition-transform duration-200 flex-shrink-0',
                !showUserMenu && 'rotate-180',
              )}
            />
          </button>
        </div>
      </div>
    </aside>
  )
}
