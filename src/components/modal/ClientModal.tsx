'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Plus } from 'lucide-react'
import { useAppContext } from '@/context/AppContext'
import type { AppClient } from '@/types'
import { cn } from '@/lib/utils'

const PRESET_COLORS = [
  '#6366F1', '#EC4899', '#10B981', '#F59E0B', '#06B6D4',
  '#8B5CF6', '#EF4444', '#F97316', '#3B82F6', '#FF6B35',
  '#84CC16', '#14B8A6',
]

function autoInitials(name: string): string {
  return name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

interface ClientModalProps {
  client?: AppClient
  onClose: () => void
}

export function ClientModal({ client, onClose }: ClientModalProps) {
  const { globalServices, addClient, updateClient } = useAppContext()
  const isEditing = !!client

  const [name,     setName]     = useState(client?.name ?? '')
  const [industry, setIndustry] = useState(client?.industry ?? '')
  const [color,    setColor]    = useState(client?.color ?? PRESET_COLORS[0])
  const [services, setServices] = useState<string[]>(client?.services ?? [])

  const initials = autoInitials(name)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  function toggleService(svc: string) {
    setServices(prev => prev.includes(svc) ? prev.filter(s => s !== svc) : [...prev, svc])
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const data: AppClient = {
      id:       client?.id ?? `c${Date.now()}`,
      name:     name.trim(),
      industry: industry.trim(),
      color,
      initials,
      services,
    }
    if (isEditing) updateClient(data)
    else addClient(data)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-[13px]"
              style={{ background: color }}
            >
              {initials || '?'}
            </div>
            <h2 className="text-[16px] font-bold text-slate-800">
              {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name + industry */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Nombre del cliente *
              </label>
              <input
                autoFocus
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej: Marca Viva"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Rubro / Industria
              </label>
              <input
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                placeholder="Ej: E-commerce"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
              />
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">
              Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-7 h-7 rounded-lg transition-all',
                    color === c && 'ring-2 ring-offset-2 ring-brand scale-110',
                  )}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          {/* Services */}
          {globalServices.length > 0 && (
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">
                Servicios contratados
              </label>
              <div className="flex flex-wrap gap-2">
                {globalServices.map(svc => (
                  <button
                    key={svc}
                    type="button"
                    onClick={() => toggleService(svc)}
                    className={cn(
                      'text-[12px] font-semibold px-3 py-1.5 rounded-lg border transition-all',
                      services.includes(svc)
                        ? 'bg-brand text-white border-brand'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
                    )}
                  >
                    {services.includes(svc) ? '✓ ' : ''}{svc}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="text-[13px] font-medium text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex items-center gap-2 bg-brand text-white text-[13px] font-semibold px-5 py-2 rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-40"
            >
              <Plus size={14} />
              {isEditing ? 'Guardar cambios' : 'Crear cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
