'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronDown, LogOut, X, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { useAppContext } from '@/context/AppContext'

interface TopBarProps {
  greeting: string
  subtitle: string
}

export function TopBar({ greeting, subtitle }: TopBarProps) {
  const router = useRouter()
  const { openEditTask, activeUser, logout, appTasks } = useAppContext()

  const [showUserMenu, setShowUserMenu]   = useState(false)
  const [searchQuery,  setSearchQuery]    = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const userMenuRef  = useRef<HTMLDivElement>(null)
  const searchRef    = useRef<HTMLDivElement>(null)

  // Close user menu on outside click
  useEffect(() => {
    if (!showUserMenu) return
    function h(e: MouseEvent) { if (!userMenuRef.current?.contains(e.target as Node)) setShowUserMenu(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [showUserMenu])

  // Close search results on outside click
  useEffect(() => {
    if (!searchFocused) return
    function h(e: MouseEvent) { if (!searchRef.current?.contains(e.target as Node)) setSearchFocused(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [searchFocused])

  // Search results: tasks matching query
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q || q.length < 2) return []
    return appTasks
      .filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.clientName.toLowerCase().includes(q) ||
        t.service.toLowerCase().includes(q) ||
        t.assignee.toLowerCase().includes(q),
      )
      .slice(0, 6)
  }, [searchQuery, appTasks])

  function handleLogout() {
    logout()
    router.replace('/login')
  }

  function handleSelectResult(taskId: string) {
    setSearchQuery('')
    setSearchFocused(false)
    openEditTask(taskId)
  }

  const showDropdown = searchFocused && searchQuery.trim().length >= 2

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 h-16 flex items-center gap-4 px-6">
      {/* Greeting */}
      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-bold text-slate-800 truncate">{greeting}</h1>
        <p className="text-[12px] text-slate-400 truncate">{subtitle}</p>
      </div>

      {/* Search */}
      <div ref={searchRef} className="relative hidden md:block">
        <div className={cn(
          'flex items-center gap-2 bg-slate-50 border rounded-lg px-3 py-2 transition-all duration-200',
          searchFocused ? 'border-brand/40 ring-2 ring-brand/10 w-64 bg-white' : 'border-slate-200 w-48',
        )}>
          <Search size={14} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar tareas, clientes…"
            className="bg-transparent text-[13px] text-slate-700 placeholder-slate-400 outline-none flex-1 min-w-0 font-sans"
            onFocus={() => setSearchFocused(true)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
              <X size={12} />
            </button>
          )}
        </div>

        {/* Results dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 min-w-[300px]">
            {searchResults.length === 0 ? (
              <p className="text-[12px] text-slate-400 px-4 py-3 text-center">Sin resultados para "{searchQuery}"</p>
            ) : (
              searchResults.map(task => (
                <button
                  key={task.id}
                  onMouseDown={() => handleSelectResult(task.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 text-left transition-colors"
                >
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: task.clientColor }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800 truncate">{task.title}</p>
                    <p className="text-[11px] text-slate-400 truncate">{task.clientName} · {task.service}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Notification Center */}
      <NotificationCenter />

      {/* User dropdown */}
      <div ref={userMenuRef} className="relative">
        <button
          onClick={() => setShowUserMenu(v => !v)}
          className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
            style={{ background: activeUser.color }}
          >
            {activeUser.initials}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-[12px] font-semibold text-slate-700 leading-none">{activeUser.name}</p>
            <p className="text-[11px] text-slate-400 leading-none mt-0.5">{activeUser.role}</p>
          </div>
          <ChevronDown
            size={13}
            className={cn('text-slate-400 hidden md:block transition-transform duration-150', showUserMenu && 'rotate-180')}
          />
        </button>

        {showUserMenu && (
          <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 w-48 z-50">
            <div className="px-3 py-2 border-b border-slate-100 mb-1">
              <p className="text-[12px] font-bold text-slate-700">{activeUser.name}</p>
              <p className="text-[11px] text-slate-400">{activeUser.role}</p>
            </div>
            <button
              onClick={() => { setShowUserMenu(false); router.push('/configuracion') }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-600 hover:bg-slate-50 transition-colors text-left"
            >
              <Settings size={14} />
              <span className="text-[13px] font-medium">Configuración</span>
            </button>
            <button
              onClick={() => { setShowUserMenu(false); handleLogout() }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-red-500 hover:bg-red-50 transition-colors text-left"
            >
              <LogOut size={14} />
              <span className="text-[13px] font-semibold">Cerrar sesión</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
