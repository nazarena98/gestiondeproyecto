'use client'

import { useState } from 'react'
import { Plus, Trash2, ExternalLink, Link2, X, Pencil, Check, Settings } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { TopBar } from '@/components/layout/TopBar'
import { useAppContext } from '@/context/AppContext'
import type { KnowledgeLink, KnowledgeCategoryDef } from '@/types'
import { cn } from '@/lib/utils'

function normalizeUrl(url: string): string {
  if (!url) return ''
  return url.startsWith('http') ? url : `https://${url}`
}

function getCatConfig(categories: KnowledgeCategoryDef[], id: string): KnowledgeCategoryDef {
  return categories.find(c => c.id === id) ?? { id, label: id, color: '#94A3B8', bg: '#F8FAFC' }
}

const CATEGORY_PRESET_COLORS = [
  { color: '#10B981', bg: '#ECFDF5' },
  { color: '#8B5CF6', bg: '#F5F3FF' },
  { color: '#3B82F6', bg: '#EFF6FF' },
  { color: '#F59E0B', bg: '#FFFBEB' },
  { color: '#EF4444', bg: '#FEF2F2' },
  { color: '#06B6D4', bg: '#ECFEFF' },
  { color: '#EC4899', bg: '#FDF2F8' },
  { color: '#F97316', bg: '#FFF7ED' },
]

function LinkCard({
  link, categories, onDelete, onUpdate,
}: {
  link: KnowledgeLink
  categories: KnowledgeCategoryDef[]
  onDelete: () => void
  onUpdate: (l: KnowledgeLink) => void
}) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle]     = useState(link.title)
  const [url, setUrl]         = useState(link.url)
  const [desc, setDesc]       = useState(link.description ?? '')
  const [cat,  setCat]        = useState(link.category)

  const cfg = getCatConfig(categories, link.category)

  function saveEdit() {
    if (!title.trim() || !url.trim()) return
    onUpdate({ ...link, title: title.trim(), url: url.trim(), description: desc.trim() || undefined, category: cat })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="p-3 rounded-xl border border-brand/30 bg-brand/5 space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título"
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-[12px] text-slate-700 focus:outline-none focus:border-brand bg-white"
          />
          <select
            value={cat}
            onChange={e => setCat(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-[12px] text-slate-700 bg-white focus:outline-none focus:border-brand"
          >
            {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="URL"
          className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-[12px] text-slate-700 focus:outline-none focus:border-brand bg-white"
        />
        <input
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="Descripción (opcional)"
          className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-[12px] text-slate-700 focus:outline-none focus:border-brand bg-white"
        />
        <div className="flex items-center gap-2">
          <button onClick={saveEdit} className="flex items-center gap-1 text-[11px] font-semibold text-white bg-brand px-3 py-1.5 rounded-lg hover:bg-brand-dark transition-colors">
            <Check size={11} /> Guardar
          </button>
          <button onClick={() => setEditing(false)} className="text-[11px] font-medium text-slate-500 hover:text-slate-700 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 text-[11px] font-bold"
        style={{ background: cfg.bg, color: cfg.color }}
      >
        {cfg.label.slice(0, 1)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-semibold text-slate-800 truncate">{link.title}</p>
          <a
            href={normalizeUrl(link.url)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-brand hover:text-brand-dark transition-colors flex-shrink-0"
          >
            <ExternalLink size={12} />
          </a>
        </div>
        {link.description && (
          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{link.description}</p>
        )}
        <p className="text-[10px] text-slate-300 mt-0.5 truncate">{link.url}</p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}

function AddLinkForm({
  clientId, clientName, categories, onAdd, onClose,
}: {
  clientId: string; clientName: string
  categories: KnowledgeCategoryDef[]
  onAdd: (link: KnowledgeLink) => void; onClose: () => void
}) {
  const [title,    setTitle]    = useState('')
  const [url,      setUrl]      = useState('')
  const [category, setCategory] = useState<string>(categories[0]?.id ?? 'link')
  const [desc,     setDesc]     = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !url.trim()) return
    onAdd({
      id: crypto.randomUUID(),
      clientId, clientName,
      title: title.trim(), url: url.trim(), category,
      description: desc.trim() || undefined,
      createdAt: new Date().toISOString(),
    })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 mt-2">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Título *</label>
          <input autoFocus required value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Ej: Drive Marca Viva 2026"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand bg-white" />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Categoría</label>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-700 bg-white focus:outline-none focus:border-brand appearance-none cursor-pointer">
            {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
      </div>
      <input required value={url} onChange={e => setUrl(e.target.value)}
        placeholder="drive.google.com/... o https://..."
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand bg-white" />
      <input value={desc} onChange={e => setDesc(e.target.value)}
        placeholder="Descripción (opcional)"
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand bg-white" />
      <div className="flex items-center justify-end gap-2 pt-1">
        <button type="button" onClick={onClose} className="text-[12px] font-medium text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={!title.trim() || !url.trim()}
          className="flex items-center gap-1.5 text-[12px] font-semibold bg-brand text-white px-4 py-1.5 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-40">
          <Plus size={13} /> Guardar
        </button>
      </div>
    </form>
  )
}

function ManageCategoriesPanel({
  categories, onAdd, onUpdate, onDelete, onClose,
}: {
  categories: KnowledgeCategoryDef[]
  onAdd: (c: KnowledgeCategoryDef) => void
  onUpdate: (c: KnowledgeCategoryDef) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  const [label, setLabel]       = useState('')
  const [colorIdx, setColorIdx] = useState(0)
  const [editingId, setEditingId]     = useState<string | null>(null)
  const [editLabel, setEditLabel]     = useState('')
  const [editColorIdx, setEditColorIdx] = useState(0)

  function startEdit(cat: KnowledgeCategoryDef) {
    setEditingId(cat.id)
    setEditLabel(cat.label)
    const idx = CATEGORY_PRESET_COLORS.findIndex(p => p.color === cat.color)
    setEditColorIdx(idx >= 0 ? idx : 0)
  }

  function saveEdit(cat: KnowledgeCategoryDef) {
    if (!editLabel.trim()) return
    const preset = CATEGORY_PRESET_COLORS[editColorIdx]
    onUpdate({ ...cat, label: editLabel.trim(), color: preset.color, bg: preset.bg })
    setEditingId(null)
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim()) return
    const preset = CATEGORY_PRESET_COLORS[colorIdx]
    onAdd({
      id: label.trim().toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(),
      label: label.trim(),
      color: preset.color,
      bg: preset.bg,
    })
    setLabel('')
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[13px] font-bold text-slate-700">Gestionar categorías</h4>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X size={15} />
        </button>
      </div>

      <div className="space-y-1.5">
        {categories.map(cat => (
          <div key={cat.id}>
            {editingId === cat.id ? (
              <div className="flex flex-col gap-2 py-2 px-2 rounded-lg bg-slate-50 border border-slate-200">
                <input
                  autoFocus
                  value={editLabel}
                  onChange={e => setEditLabel(e.target.value)}
                  className="border border-slate-200 rounded-lg px-2.5 py-1 text-[12px] text-slate-700 focus:outline-none focus:border-brand bg-white"
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  {CATEGORY_PRESET_COLORS.map((p, i) => (
                    <button key={i} type="button" onClick={() => setEditColorIdx(i)}
                      className={cn('w-5 h-5 rounded-full transition-all', editColorIdx === i && 'ring-2 ring-offset-1 ring-slate-400 scale-110')}
                      style={{ background: p.color }} />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => saveEdit(cat)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-white bg-brand px-3 py-1 rounded-lg hover:bg-brand-dark transition-colors">
                    <Check size={11} /> Guardar
                  </button>
                  <button onClick={() => setEditingId(null)}
                    className="text-[11px] font-medium text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-slate-50 group">
                <div className="w-5 h-5 rounded flex-shrink-0" style={{ background: cat.bg, border: `1.5px solid ${cat.color}` }} />
                <span className="flex-1 text-[12px] font-semibold text-slate-700">{cat.label}</span>
                <button onClick={() => startEdit(cat)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-brand">
                  <Pencil size={12} />
                </button>
                <button onClick={() => onDelete(cat.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500">
                  <X size={13} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="border-t border-slate-100 pt-3 space-y-2">
        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Nueva categoría..."
          className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-[12px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand" />
        <div className="flex items-center gap-1.5 flex-wrap">
          {CATEGORY_PRESET_COLORS.map((p, i) => (
            <button key={i} type="button" onClick={() => setColorIdx(i)}
              className={cn('w-5 h-5 rounded-full transition-all', colorIdx === i && 'ring-2 ring-offset-1 ring-slate-400 scale-110')}
              style={{ background: p.color }} />
          ))}
        </div>
        <button type="submit" disabled={!label.trim()}
          className="w-full text-[12px] font-semibold bg-brand text-white py-1.5 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-40">
          + Agregar categoría
        </button>
      </form>
    </div>
  )
}

function ConocimientoContent() {
  const {
    clients, knowledgeLinks, addKnowledgeLink, updateKnowledgeLink, deleteKnowledgeLink,
    knowledgeCategories, addKnowledgeCategory, updateKnowledgeCategory, deleteKnowledgeCategory,
  } = useAppContext()
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id ?? '')
  const [showForm,         setShowForm]         = useState(false)
  const [showCategories,   setShowCategories]   = useState(false)
  const [catFilter,        setCatFilter]        = useState<string>('all')

  const selectedClient = clients.find(c => c.id === selectedClientId)
  const clientLinks    = knowledgeLinks.filter(l => l.clientId === selectedClientId)
  const filtered       = catFilter === 'all' ? clientLinks : clientLinks.filter(l => l.category === catFilter)

  const countByClient = clients.reduce<Record<string, number>>((acc, c) => {
    acc[c.id] = knowledgeLinks.filter(l => l.clientId === c.id).length
    return acc
  }, {})

  // Group filtered links by category
  const byCategory = knowledgeCategories.reduce<Record<string, KnowledgeLink[]>>((acc, cat) => {
    acc[cat.id] = filtered.filter(l => l.category === cat.id)
    return acc
  }, {})
  const uncategorized = filtered.filter(l => !knowledgeCategories.find(c => c.id === l.category))

  return (
    <main className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Left panel — client list */}
      <div className="w-60 flex-shrink-0 border-r border-slate-200 bg-white overflow-y-auto">
        <div className="px-4 py-4 border-b border-slate-100">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Clientes</p>
        </div>
        <div className="py-2">
          {clients.map(client => (
            <button
              key={client.id}
              onClick={() => { setSelectedClientId(client.id); setShowForm(false); setCatFilter('all') }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left',
                selectedClientId === client.id ? 'bg-brand/8 text-brand' : 'text-slate-600 hover:bg-slate-50',
              )}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: client.color }}>
                {client.initials}
              </div>
              <span className={cn('flex-1 text-[13px] font-medium truncate', selectedClientId === client.id && 'text-brand font-semibold')}>
                {client.name}
              </span>
              {countByClient[client.id] > 0 && (
                <span className="text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1"
                  style={{ background: selectedClientId === client.id ? '#FF6B35' : client.color + '20', color: selectedClientId === client.id ? 'white' : client.color }}>
                  {countByClient[client.id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 overflow-y-auto bg-canvas p-6 space-y-4">
        {selectedClient ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-[13px]" style={{ background: selectedClient.color }}>
                  {selectedClient.initials}
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-slate-800">{selectedClient.name}</h2>
                  <p className="text-[12px] text-slate-400">{clientLinks.length} {clientLinks.length === 1 ? 'recurso' : 'recursos'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCategories(v => !v)}
                  className={cn(
                    'flex items-center gap-1.5 text-[12px] font-semibold px-3 py-2 rounded-xl border transition-colors',
                    showCategories ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300',
                  )}
                >
                  <Settings size={13} />
                  Categorías
                </button>
                <button
                  onClick={() => setShowForm(v => !v)}
                  className="flex items-center gap-2 bg-brand text-white text-[13px] font-semibold px-4 py-2 rounded-xl hover:bg-brand-dark transition-colors shadow-sm"
                >
                  <Plus size={15} />
                  Agregar link
                </button>
              </div>
            </div>

            {/* Category manager */}
            {showCategories && (
              <ManageCategoriesPanel
                categories={knowledgeCategories}
                onAdd={addKnowledgeCategory}
                onUpdate={updateKnowledgeCategory}
                onDelete={deleteKnowledgeCategory}
                onClose={() => setShowCategories(false)}
              />
            )}

            {/* Add form */}
            {showForm && (
              <div className="bg-white rounded-2xl shadow-card p-4">
                <AddLinkForm
                  clientId={selectedClientId}
                  clientName={selectedClient.name}
                  categories={knowledgeCategories}
                  onAdd={link => { addKnowledgeLink(link); setShowForm(false) }}
                  onClose={() => setShowForm(false)}
                />
              </div>
            )}

            {/* Category filter pills */}
            {clientLinks.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setCatFilter('all')}
                  className={cn('text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all',
                    catFilter === 'all' ? 'bg-brand text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50')}
                >
                  Todas ({clientLinks.length})
                </button>
                {knowledgeCategories.map(cat => {
                  const count = clientLinks.filter(l => l.category === cat.id).length
                  if (count === 0) return null
                  return (
                    <button key={cat.id} onClick={() => setCatFilter(cat.id)}
                      className={cn('text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all',
                        catFilter === cat.id ? 'text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50')}
                      style={catFilter === cat.id ? { background: cat.color } : undefined}
                    >
                      {cat.label} ({count})
                    </button>
                  )
                })}
              </div>
            )}

            {/* Links by category */}
            {filtered.length === 0 && !showForm ? (
              <div className="bg-white rounded-2xl shadow-card px-6 py-12 text-center">
                <Link2 size={32} className="text-slate-300 mx-auto mb-3" />
                <p className="text-[14px] font-semibold text-slate-500 mb-1">Sin recursos todavía</p>
                <p className="text-[12px] text-slate-400 mb-4">Agregá links a Drive, SOPs, referencias y más.</p>
                <button onClick={() => setShowForm(true)} className="bg-brand text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-dark transition-colors">
                  + Agregar primer link
                </button>
              </div>
            ) : (
              <>
                {knowledgeCategories.map(cat => {
                  const links = byCategory[cat.id] ?? []
                  if (links.length === 0) return null
                  return (
                    <div key={cat.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
                      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                          style={{ background: cat.bg, color: cat.color }}>
                          {cat.label.slice(0, 1)}
                        </div>
                        <span className="text-[13px] font-bold text-slate-700">{cat.label}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: cat.bg, color: cat.color }}>
                          {links.length}
                        </span>
                      </div>
                      <div className="divide-y divide-slate-50 px-2 py-1">
                        {links.map(link => (
                          <LinkCard
                            key={link.id}
                            link={link}
                            categories={knowledgeCategories}
                            onDelete={() => deleteKnowledgeLink(link.id)}
                            onUpdate={updateKnowledgeLink}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
                {uncategorized.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                    <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
                      <span className="text-[13px] font-bold text-slate-500">Sin categoría</span>
                    </div>
                    <div className="divide-y divide-slate-50 px-2 py-1">
                      {uncategorized.map(link => (
                        <LinkCard key={link.id} link={link} categories={knowledgeCategories}
                          onDelete={() => deleteKnowledgeLink(link.id)} onUpdate={updateKnowledgeLink} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-400">Seleccioná un cliente para ver sus recursos.</p>
          </div>
        )}
      </div>
    </main>
  )
}

export default function ConocimientoPage() {
  return (
    <MainLayout>
      <TopBar
        greeting="Hub de Conocimiento"
        subtitle="Links, SOPs, Drive y referencias — filtrá por categoría o agregá las tuyas"
      />
      <ConocimientoContent />
    </MainLayout>
  )
}
