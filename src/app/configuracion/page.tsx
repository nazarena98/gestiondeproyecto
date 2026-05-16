'use client'

import { useState } from 'react'
import { X, Plus, Layers, Users, Pencil, Check } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { TopBar } from '@/components/layout/TopBar'
import { useAppContext } from '@/context/AppContext'
import type { TeamMember } from '@/types'
import { cn } from '@/lib/utils'

const PRESET_COLORS = [
  '#FF6B35', '#EC4899', '#8B5CF6', '#3B82F6', '#10B981',
  '#F59E0B', '#EF4444', '#06B6D4', '#6366F1', '#F97316',
]

function autoInitials(name: string): string {
  return name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

interface MemberFormData {
  name: string
  email: string
  role: string
  color: string
}

function MemberRow({
  member, isSelf, onDelete,
}: {
  member: TeamMember; isSelf: boolean; onDelete: () => void
}) {
  return (
    <div className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors group">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
        style={{ background: member.color }}
      >
        {member.initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-slate-800 truncate">{member.name}</p>
        <p className="text-[11px] text-slate-400 truncate">{member.email}</p>
      </div>
      <span
        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg flex-shrink-0"
        style={{ background: member.color + '18', color: member.color }}
      >
        {member.role}
      </span>
      {isSelf ? (
        <span className="text-[10px] text-slate-400 flex-shrink-0">activo</span>
      ) : (
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 flex-shrink-0"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

function AddMemberForm({ onAdd }: { onAdd: (m: TeamMember) => void }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<MemberFormData>({ name: '', email: '', role: '', color: PRESET_COLORS[4] })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.role.trim()) return
    onAdd({
      id:       `u${Date.now()}`,
      name:     form.name.trim(),
      email:    form.email.trim(),
      role:     form.role.trim(),
      color:    form.color,
      initials: autoInitials(form.name),
    })
    setForm({ name: '', email: '', role: '', color: PRESET_COLORS[4] })
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-[13px] font-semibold text-brand hover:text-brand-dark transition-colors"
      >
        <Plus size={15} />
        Invitar integrante
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Nombre *</label>
          <input
            autoFocus
            required
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="Ej: Ana García"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand bg-white"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Email *</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            placeholder="ana@gmail.com"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand bg-white"
          />
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Rol *</label>
        <input
          required
          value={form.role}
          onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
          placeholder="Ej: Diseñadora Gráfica"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand bg-white"
        />
      </div>
      <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Color</label>
        <div className="flex gap-2 flex-wrap">
          {PRESET_COLORS.map(c => (
            <button
              key={c} type="button" onClick={() => setForm(p => ({ ...p, color: c }))}
              className={cn('w-6 h-6 rounded-full transition-all', form.color === c && 'ring-2 ring-offset-1 ring-slate-400 scale-110')}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 pt-1">
        <button type="button" onClick={() => setOpen(false)} className="text-[12px] font-medium text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!form.name.trim() || !form.email.trim() || !form.role.trim()}
          className="flex items-center gap-1.5 text-[12px] font-semibold bg-brand text-white px-4 py-1.5 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-40"
        >
          <Check size={13} />
          Agregar
        </button>
      </div>
    </form>
  )
}

function ConfiguracionContent() {
  const {
    globalServices, addService, deleteService,
    teamMembers, activeUser, addTeamMember, deleteTeamMember,
  } = useAppContext()
  const [newService, setNewService] = useState('')

  function handleAddService(e: React.FormEvent) {
    e.preventDefault()
    addService(newService)
    setNewService('')
  }

  return (
    <main className="flex-1 p-6 space-y-6 max-w-3xl">

      {/* Team Members */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
            <Users size={16} className="text-brand" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-slate-800">Equipo de trabajo</h2>
            <p className="text-[12px] text-slate-400">Integrantes, roles y accesos</p>
          </div>
        </div>

        <p className="text-[13px] text-slate-500 mt-4 mb-4">
          Cada integrante tiene un rol que aparece como filtro en Mis Tareas. Podés agregar nuevos roles invitando a un email.
        </p>

        <div className="divide-y divide-slate-50 mb-4">
          {teamMembers.map(member => (
            <MemberRow
              key={member.id}
              member={member}
              isSelf={member.id === activeUser.id}
              onDelete={() => deleteTeamMember(member.id)}
            />
          ))}
        </div>

        <AddMemberForm onAdd={addTeamMember} />
      </div>

      {/* Servicios globales */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
            <Layers size={16} className="text-brand" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-slate-800">Librería de Servicios</h2>
            <p className="text-[12px] text-slate-400">Lista global disponible en todas las tareas</p>
          </div>
        </div>

        <p className="text-[13px] text-slate-500 mt-4 mb-5">
          Estos servicios aparecen como opciones al crear o editar cualquier tarea.
          Al eliminar un servicio, las tareas que lo usaban quedan sin servicio asignado.
        </p>

        <div className="flex flex-wrap gap-2 mb-6 min-h-[40px]">
          {globalServices.map(svc => (
            <span
              key={svc}
              className="flex items-center gap-2 bg-brand/10 text-brand text-[12px] font-semibold px-3 py-1.5 rounded-xl"
            >
              {svc}
              <button
                onClick={() => deleteService(svc)}
                className="hover:text-brand-dark transition-colors -mr-0.5"
                title={`Eliminar ${svc}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
          {globalServices.length === 0 && (
            <p className="text-[13px] text-slate-400 italic">No hay servicios. Agregá el primero.</p>
          )}
        </div>

        <form onSubmit={handleAddService} className="flex gap-2">
          <input
            type="text"
            value={newService}
            onChange={e => setNewService(e.target.value)}
            placeholder="Nombre del nuevo servicio..."
            className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
          />
          <button
            type="submit"
            disabled={!newService.trim()}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white text-[13px] font-semibold rounded-xl hover:bg-brand-dark transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={14} />
            Agregar
          </button>
        </form>
      </div>

      {/* Info footer */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4">
        <p className="text-[12px] text-slate-500">
          <span className="font-semibold text-slate-700">{teamMembers.length} integrantes</span> en el equipo ·{' '}
          <span className="font-semibold text-slate-700">{globalServices.length} servicios</span> en la librería global ·
          Los cambios se guardan automáticamente.
        </p>
      </div>
    </main>
  )
}

export default function ConfiguracionPage() {
  return (
    <MainLayout>
      <TopBar
        greeting="Configuración"
        subtitle="Equipo, roles, servicios y preferencias del sistema"
      />
      <ConfiguracionContent />
    </MainLayout>
  )
}
