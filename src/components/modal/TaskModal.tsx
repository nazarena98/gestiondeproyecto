'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { X, Plus, FileText, MessageSquare, AlignLeft, Link2, Trash2, GitBranch, AlertTriangle, Bold, Italic, Strikethrough, List, Package } from 'lucide-react'
import { useAppContext } from '@/context/AppContext'
import type { AppTask, TaskStatus, TaskPriority, TaskLink } from '@/types'
import { STATUS_OPTIONS } from '@/types'
import { cn } from '@/lib/utils'

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'critical', label: 'Crítica' },
  { value: 'high',     label: 'Alta' },
  { value: 'medium',   label: 'Media' },
  { value: 'low',      label: 'Baja' },
]

type Tab = 'detalles' | 'descripcion' | 'feedback'

// ── RICH TEXT TOOLBAR BUTTON ──────────────────────────────────────
function ToolBtn({
  onClick, title, active, children,
}: { onClick: () => void; title: string; active?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      className={cn(
        'w-7 h-7 flex items-center justify-center rounded-md transition-colors text-slate-600',
        active ? 'bg-brand/15 text-brand' : 'hover:bg-slate-200',
      )}
    >
      {children}
    </button>
  )
}

// ── RICH TEXT EDITOR ──────────────────────────────────────────────
function RichTextEditor({
  initialValue,
  onChange,
  placeholder = 'Detallá qué implica esta tarea, contexto, pasos, requisitos...',
}: {
  initialValue: string
  onChange: (html: string) => void
  placeholder?: string
}) {
  const editorRef = useRef<HTMLDivElement>(null)

  // Set innerHTML only on mount (avoid fighting React re-renders vs contentEditable cursor)
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialValue
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function exec(cmd: string, value?: string) {
    editorRef.current?.focus()
    document.execCommand(cmd, false, value ?? '')
    onChange(editorRef.current?.innerHTML ?? '')
  }

  function handleInput() {
    onChange(editorRef.current?.innerHTML ?? '')
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const blob = item.getAsFile()
        if (!blob) return
        const reader = new FileReader()
        reader.onload = ev => {
          const dataUrl = ev.target?.result as string
          editorRef.current?.focus()
          document.execCommand('insertImage', false, dataUrl)
          onChange(editorRef.current?.innerHTML ?? '')
        }
        reader.readAsDataURL(blob)
        return
      }
    }
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10 transition-all">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-slate-100 bg-slate-50/80">
        <ToolBtn onClick={() => exec('bold')}          title="Negrita (Ctrl+B)"><Bold size={13} /></ToolBtn>
        <ToolBtn onClick={() => exec('italic')}        title="Cursiva (Ctrl+I)"><Italic size={13} /></ToolBtn>
        <ToolBtn onClick={() => exec('strikeThrough')} title="Tachado"><Strikethrough size={13} /></ToolBtn>
        <div className="w-px h-4 bg-slate-200 mx-1" />
        <ToolBtn onClick={() => exec('formatBlock', 'h2')} title="Título grande">
          <span className="text-[11px] font-black">H1</span>
        </ToolBtn>
        <ToolBtn onClick={() => exec('formatBlock', 'h3')} title="Título chico">
          <span className="text-[10px] font-bold">H2</span>
        </ToolBtn>
        <ToolBtn onClick={() => exec('formatBlock', 'p')} title="Párrafo normal">
          <span className="text-[11px]">P</span>
        </ToolBtn>
        <div className="w-px h-4 bg-slate-200 mx-1" />
        <ToolBtn onClick={() => exec('insertUnorderedList')} title="Lista con viñetas"><List size={13} /></ToolBtn>
      </div>
      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        className="rich-editor min-h-[180px] max-h-[320px] overflow-y-auto px-3 py-2.5 text-[13px] text-slate-700 outline-none leading-relaxed"
      />
    </div>
  )
}

// ── MAIN MODAL ────────────────────────────────────────────────────
export function TaskModal() {
  const {
    clients, appTasks, isModalOpen, editingTaskId,
    presetClientId, presetServiceName,
    closeModal, addAppTask, updateAppTask, deleteAppTask,
    globalServices, teamMembers, activeUser,
  } = useAppContext()

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [tab,          setTab]          = useState<Tab>('detalles')
  const [clientId,     setClientId]     = useState('')
  const [service,      setService]      = useState('')
  const [category,     setCategory]     = useState('')
  const [title,        setTitle]        = useState('')
  const [assignee,     setAssignee]     = useState('')
  const [status,       setStatus]       = useState<TaskStatus>('pending')
  const [priority,     setPriority]     = useState<TaskPriority>('medium')
  const [startDate,    setStartDate]    = useState('')
  const [dueDate,      setDueDate]      = useState('')
  const [hours,        setHours]        = useState('8')
  const [description,  setDescription]  = useState('')
  const [deliverable,  setDeliverable]  = useState('')
  const [feedback,     setFeedback]     = useState('')
  const [links,        setLinks]        = useState<TaskLink[]>([])
  const [newUrl,       setNewUrl]       = useState('')
  const [newLabel,     setNewLabel]     = useState('')
  const [dependsOnId,  setDependsOnId]  = useState('')

  const editingTask    = editingTaskId ? appTasks.find(t => t.id === editingTaskId) ?? null : null
  const isClientLocked = !!presetClientId && !editingTask
  const isServiceLocked = !!presetServiceName && !editingTask

  useEffect(() => {
    if (!isModalOpen) return
    setTab('detalles')
    setConfirmDelete(false)
    if (editingTask) {
      setClientId(editingTask.clientId)
      setService(editingTask.service)
      setCategory(editingTask.category ?? '')
      setTitle(editingTask.title)
      setAssignee(editingTask.assignee)
      setStatus(editingTask.status)
      setPriority(editingTask.priority)
      setStartDate(editingTask.startDate)
      setDueDate(editingTask.dueDate)
      setHours(String(editingTask.estimatedHours))
      setDescription(editingTask.description ?? '')
      setDeliverable(editingTask.deliverable ?? '')
      setFeedback(editingTask.feedback ?? '')
      setLinks(editingTask.links ?? [])
      setDependsOnId(editingTask.dependsOnId ?? '')
    } else {
      setClientId(presetClientId ?? '')
      setService(presetServiceName ?? '')
      setCategory('')
      setTitle('')
      setAssignee(activeUser.name)
      setStatus('pending')
      setPriority('medium')
      setStartDate(new Date().toISOString().slice(0, 10))
      setDueDate('')
      setHours('8')
      setDescription('')
      setDeliverable('')
      setFeedback('')
      setLinks([])
      setDependsOnId('')
    }
    setNewUrl('')
    setNewLabel('')
  }, [isModalOpen, editingTaskId, activeUser.name, presetClientId, presetServiceName])

  const siblingTasks = useMemo(() =>
    clientId ? appTasks.filter(t => t.clientId === clientId && t.id !== editingTask?.id) : [],
    [appTasks, clientId, editingTask?.id],
  )

  const presetClient = presetClientId ? clients.find(c => c.id === presetClientId) : null

  function addLink() {
    const url = newUrl.trim()
    if (!url) return
    const normalized = /^https?:\/\//i.test(url) ? url : 'https://' + url
    setLinks(prev => [...prev, { id: crypto.randomUUID(), url: normalized, label: newLabel.trim() || normalized }])
    setNewUrl('')
    setNewLabel('')
  }

  function removeLink(id: string) {
    setLinks(prev => prev.filter(l => l.id !== id))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!clientId || !service || !title.trim() || !startDate || !dueDate) return

    const client = clients.find(c => c.id === clientId)!
    const now    = new Date().toISOString()

    const task: AppTask = {
      id:             editingTask?.id ?? ('at-' + crypto.randomUUID()),
      clientId,
      clientName:     client.name,
      clientColor:    client.color,
      service,
      category:       category.trim() || undefined,
      title:          title.trim(),
      assignee:       assignee || 'Sin asignar',
      status,
      priority,
      startDate,
      dueDate,
      estimatedHours: Math.max(1, parseInt(hours) || 8),
      createdAt:      editingTask?.createdAt ?? now,
      description:    description || undefined,
      deliverable:    deliverable.trim() || undefined,
      feedback:       feedback.trim() || undefined,
      links:          links.length > 0 ? links : undefined,
      dependsOnId:    dependsOnId || undefined,
    }

    if (editingTask) updateAppTask(task)
    else addAppTask(task)
    closeModal()
  }

  if (!isModalOpen) return null

  const TABS: { key: Tab; label: string; Icon: React.ElementType }[] = [
    { key: 'detalles',    label: 'Detalles',     Icon: FileText },
    { key: 'descripcion', label: 'Descripción',  Icon: AlignLeft },
    { key: 'feedback',    label: 'Feedback',     Icon: MessageSquare },
  ]

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand/10 flex items-center justify-center">
              <Plus size={16} className="text-brand" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-800">
                {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
              </h2>
              {presetClient && !editingTask && (
                <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: presetClient.color }} />
                  {presetClient.name}
                  {presetServiceName && <> · <span className="font-semibold">{presetServiceName}</span></>}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 flex-shrink-0">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-3 text-[13px] font-semibold border-b-2 transition-colors',
                tab === key
                  ? 'border-brand text-brand'
                  : 'border-transparent text-slate-400 hover:text-slate-600',
              )}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

            {/* ── TAB DETALLES ── */}
            {tab === 'detalles' && (
              <>
                {/* Cliente + Servicio */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Cliente *
                    </label>
                    {isClientLocked ? (
                      <div className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-700 bg-slate-50 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: presetClient?.color }} />
                        {presetClient?.name}
                      </div>
                    ) : (
                      <select
                        value={clientId}
                        onChange={e => { setClientId(e.target.value); setDependsOnId('') }}
                        required
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 appearance-none cursor-pointer"
                      >
                        <option value="">Seleccioná...</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Servicio *
                    </label>
                    {isServiceLocked ? (
                      <div className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-700 bg-slate-50 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-400 flex-shrink-0" />
                        {presetServiceName}
                      </div>
                    ) : (
                      <select
                        value={service}
                        onChange={e => setService(e.target.value)}
                        required
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 appearance-none cursor-pointer"
                      >
                        <option value="">Seleccioná...</option>
                        {globalServices.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Nombre + Categoría */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Nombre de Tarea *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      required
                      placeholder="Ej: Diseño de stories semana 3"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Categoría
                    </label>
                    <input
                      type="text"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      placeholder="Ej: Stories"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
                    />
                  </div>
                </div>

                {/* Responsable */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Responsable
                  </label>
                  <select
                    value={assignee}
                    onChange={e => setAssignee(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 appearance-none cursor-pointer"
                  >
                    <option value="">Sin asignar</option>
                    {teamMembers.map(m => (
                      <option key={m.id} value={m.name}>{m.name} — {m.role}</option>
                    ))}
                  </select>
                </div>

                {/* Depende de */}
                {clientId && siblingTasks.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      <GitBranch size={11} className="inline mr-1" />
                      Depende de (opcional)
                    </label>
                    <select
                      value={dependsOnId}
                      onChange={e => setDependsOnId(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 appearance-none cursor-pointer"
                    >
                      <option value="">Sin dependencia</option>
                      {siblingTasks.map(t => (
                        <option key={t.id} value={t.id}>{t.title} ({t.service})</option>
                      ))}
                    </select>
                    {dependsOnId && (
                      <p className="text-[11px] text-amber-600 mt-1.5 flex items-center gap-1">
                        <GitBranch size={10} />
                        Si la tarea padre no está aprobada, esta tarea quedará bloqueada al guardar.
                      </p>
                    )}
                  </div>
                )}

                {/* Fechas */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Fecha Inicio *
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      required
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-700 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Fecha Fin *
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      required
                      min={startDate}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-700 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
                    />
                  </div>
                </div>

                {/* Estado + Prioridad + Horas */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Estado
                    </label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as TaskStatus)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 appearance-none cursor-pointer"
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Prioridad
                    </label>
                    <select
                      value={priority}
                      onChange={e => setPriority(e.target.value as TaskPriority)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 appearance-none cursor-pointer"
                    >
                      {PRIORITY_OPTIONS.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Hs. estimadas
                    </label>
                    <input
                      type="number"
                      value={hours}
                      onChange={e => setHours(e.target.value)}
                      min="1"
                      max="500"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-700 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
                    />
                  </div>
                </div>
              </>
            )}

            {/* ── TAB DESCRIPCIÓN ── */}
            {tab === 'descripcion' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Descripción de la tarea
                  </label>
                  <RichTextEditor
                    key={`desc-${editingTaskId ?? 'new'}-${isModalOpen}`}
                    initialValue={description}
                    onChange={setDescription}
                  />
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    Podés pegar capturas de pantalla directamente con Ctrl+V
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <Package size={11} />
                    Entregable de la tarea
                  </label>
                  <textarea
                    value={deliverable}
                    onChange={e => setDeliverable(e.target.value)}
                    rows={3}
                    placeholder="Describí qué se espera recibir como entregable final de esta tarea..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 resize-none"
                  />
                </div>
              </>
            )}

            {/* ── TAB FEEDBACK ── */}
            {tab === 'feedback' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Feedback / Observaciones
                  </label>
                  <textarea
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    rows={6}
                    placeholder="Anotá comentarios del cliente, correcciones solicitadas, observaciones internas..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Links de referencia
                  </label>

                  {links.length > 0 && (
                    <ul className="space-y-2 mb-3">
                      {links.map(link => (
                        <li key={link.id} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                          <Link2 size={13} className="text-brand flex-shrink-0" />
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[13px] text-brand hover:underline flex-1 truncate"
                          >
                            {link.label}
                          </a>
                          <button
                            type="button"
                            onClick={() => removeLink(link.id)}
                            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <Trash2 size={12} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                    <input
                      type="text"
                      value={newLabel}
                      onChange={e => setNewLabel(e.target.value)}
                      placeholder="Etiqueta (ej: Drive carpeta cliente)"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 bg-white"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newUrl}
                        onChange={e => setNewUrl(e.target.value)}
                        placeholder="https://..."
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLink() } }}
                        className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 bg-white"
                      />
                      <button
                        type="button"
                        onClick={addLink}
                        disabled={!newUrl.trim()}
                        className="flex items-center gap-1.5 px-3 py-2 bg-brand text-white text-[12px] font-semibold rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                      >
                        <Plus size={13} />
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0">
            {editingTask && (
              confirmDelete ? (
                <div className="flex items-center gap-2 flex-1">
                  <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
                  <span className="text-[12px] text-red-600 font-semibold">¿Eliminar tarea?</span>
                  <button
                    type="button"
                    onClick={() => { deleteAppTask(editingTask.id); closeModal() }}
                    className="px-3 py-1.5 bg-red-500 text-white text-[12px] font-bold rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Sí, eliminar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 size={13} />
                  Eliminar
                </button>
              )
            )}

            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2.5 text-[13px] font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white text-[13px] font-semibold rounded-xl hover:bg-brand-dark transition-colors shadow-sm"
              >
                <Plus size={14} />
                {editingTask ? 'Guardar cambios' : 'Crear tarea'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
