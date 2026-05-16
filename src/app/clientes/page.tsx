'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Layers, Plus, Pencil, Trash2 } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { TopBar } from '@/components/layout/TopBar'
import { ClientModal } from '@/components/modal/ClientModal'
import { useAppContext } from '@/context/AppContext'
import type { AppClient } from '@/types'

function ClientCard({
  client, taskCount, onEdit, onDelete,
}: {
  client: AppClient
  taskCount: number
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="relative group">
      <Link href={`/clientes/${client.id}`}>
        <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden cursor-pointer">
          <div className="h-1.5 w-full" style={{ background: client.color }} />
          <div className="p-5">
            <div className="flex items-start gap-4 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-[15px] flex-shrink-0 shadow-sm"
                style={{ background: client.color }}
              >
                {client.initials}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-bold text-slate-800 group-hover:text-brand transition-colors truncate">
                  {client.name}
                </h3>
                <p className="text-[12px] text-slate-400 mt-0.5">{client.industry}</p>
              </div>
              <ArrowRight
                size={16}
                className="text-slate-300 group-hover:text-brand group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {client.services.slice(0, 3).map(s => (
                <span
                  key={s}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-lg"
                  style={{ background: client.color + '18', color: client.color }}
                >
                  {s}
                </span>
              ))}
              {client.services.length > 3 && (
                <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500">
                  +{client.services.length - 3}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <Layers size={12} className="text-slate-400" />
                <span className="text-[12px] text-slate-500">{client.services.length} servicios</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: taskCount > 0 ? client.color : '#CBD5E1' }} />
                <span className="text-[12px] font-semibold text-slate-700">
                  {taskCount} {taskCount === 1 ? 'tarea' : 'tareas'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Edit / Delete — only visible on hover */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); onEdit() }}
          className="w-7 h-7 bg-white rounded-lg shadow-sm border border-slate-200 flex items-center justify-center text-slate-500 hover:text-brand hover:border-brand/30 transition-colors"
          title="Editar cliente"
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); onDelete() }}
          className="w-7 h-7 bg-white rounded-lg shadow-sm border border-slate-200 flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-red-200 transition-colors"
          title="Eliminar cliente"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}

function DeleteConfirmModal({ client, onConfirm, onCancel }: {
  client: AppClient; onConfirm: () => void; onCancel: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6"
        onClick={e => e.stopPropagation()}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-[15px] mx-auto mb-4"
          style={{ background: client.color }}
        >
          {client.initials}
        </div>
        <h3 className="text-[16px] font-bold text-slate-800 text-center mb-2">
          Eliminar {client.name}
        </h3>
        <p className="text-[13px] text-slate-500 text-center mb-6">
          Se eliminarán todas las tareas, links y mensajes de este cliente. Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 text-[13px] font-semibold text-slate-600 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 text-[13px] font-semibold text-white bg-red-500 py-2.5 rounded-xl hover:bg-red-600 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

function ClientesContent() {
  const { clients, appTasks, deleteClient } = useAppContext()
  const [showModal,     setShowModal]     = useState(false)
  const [editingClient, setEditingClient] = useState<AppClient | undefined>(undefined)
  const [deletingClient, setDeletingClient] = useState<AppClient | undefined>(undefined)

  const taskCountByClient = clients.reduce<Record<string, number>>((acc, c) => {
    acc[c.id] = appTasks.filter(t => t.clientId === c.id).length
    return acc
  }, {})

  const active  = appTasks.filter(t => t.status === 'in_progress' || t.status === 'in_review').length
  const blocked = appTasks.filter(t => t.status === 'blocked' || t.status === 'waiting_client').length

  function openNew() { setEditingClient(undefined); setShowModal(true) }
  function openEdit(client: AppClient) { setEditingClient(client); setShowModal(true) }
  function handleDelete() {
    if (deletingClient) { deleteClient(deletingClient.id); setDeletingClient(undefined) }
  }

  return (
    <main className="flex-1 p-6 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Clientes activos',        value: clients.length,   color: '#FF6B35' },
          { label: 'Tareas totales',           value: appTasks.length,  color: '#6366F1' },
          { label: 'En proceso / revisión',    value: active,           color: '#3B82F6' },
          { label: 'Bloqueadas / esperando',   value: blocked,          color: '#EF4444' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl shadow-card px-5 py-4">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-[28px] font-black leading-none" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-slate-800">Cartera de Clientes</h2>
          <p className="text-[13px] text-slate-400 mt-0.5">
            Hacé clic para ver módulos de servicio y tareas · Pasá el mouse sobre una tarjeta para editar o eliminar
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-brand text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-dark transition-colors shadow-sm"
        >
          <Plus size={15} />
          Nuevo Cliente
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[15px] font-semibold text-slate-500 mb-2">No hay clientes todavía</p>
          <button onClick={openNew} className="text-brand font-semibold hover:underline text-[13px]">
            + Crear el primer cliente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              taskCount={taskCountByClient[client.id] ?? 0}
              onEdit={() => openEdit(client)}
              onDelete={() => setDeletingClient(client)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <ClientModal
          client={editingClient}
          onClose={() => { setShowModal(false); setEditingClient(undefined) }}
        />
      )}
      {deletingClient && (
        <DeleteConfirmModal
          client={deletingClient}
          onConfirm={handleDelete}
          onCancel={() => setDeletingClient(undefined)}
        />
      )}
    </main>
  )
}

export default function ClientesPage() {
  return (
    <MainLayout>
      <TopBar
        greeting="Clientes"
        subtitle="Cartera de clientes — creá, editá y organizá tus cuentas"
      />
      <ClientesContent />
    </MainLayout>
  )
}
