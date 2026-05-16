'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Send, MessageCircle, AtSign } from 'lucide-react'
import { MainLayout } from '@/components/layout/MainLayout'
import { TopBar } from '@/components/layout/TopBar'
import { useAppContext } from '@/context/AppContext'
import type { ChatMessage, TeamMember } from '@/types'
import { cn } from '@/lib/utils'

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return 'Hoy'
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

// Extract the in-progress @mention query from text
function getMentionQuery(text: string): string | null {
  const atIdx = text.lastIndexOf('@')
  if (atIdx === -1) return null
  const afterAt = text.slice(atIdx + 1)
  // If there's a space or newline after @, the mention is closed
  if (/[\s\n]/.test(afterAt)) return null
  return afterAt
}

// Render message text with @mentions highlighted
function MessageText({ text, members }: { text: string; members: TeamMember[] }) {
  // Split on @mentions
  const parts = text.split(/(@[\w\s]+?)(?=\s|$|@)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('@')) {
          const name = part.slice(1).trim()
          const member = members.find(m => m.name === name)
          if (member) {
            return (
              <span key={i} className="font-bold" style={{ color: member.color }}>
                {part}
              </span>
            )
          }
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

function MessageBubble({ msg, isOwn, members }: { msg: ChatMessage; isOwn: boolean; members: TeamMember[] }) {
  return (
    <div className={cn('flex items-end gap-2 max-w-[75%]', isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto')}>
      {!isOwn && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0 mb-0.5"
          style={{ background: msg.authorColor }}
        >
          {msg.authorInitials}
        </div>
      )}
      <div className={cn('space-y-0.5', isOwn ? 'items-end' : 'items-start')}>
        {!isOwn && (
          <p className="text-[10px] font-semibold text-slate-400 px-1">
            {msg.authorName}
            <span className="font-normal ml-1" style={{ color: msg.authorColor }}>
              {/* role badge shown in sidebar, not needed here */}
            </span>
          </p>
        )}
        <div
          className={cn(
            'px-3 py-2 rounded-2xl text-[13px] leading-relaxed',
            isOwn
              ? 'bg-brand text-white rounded-br-sm'
              : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm shadow-card',
          )}
        >
          <MessageText text={msg.text} members={members} />
        </div>
        <p className={cn('text-[10px] text-slate-400 px-1', isOwn && 'text-right')}>
          {formatTime(msg.createdAt)}
        </p>
      </div>
    </div>
  )
}

function groupByDate(messages: ChatMessage[]): { date: string; messages: ChatMessage[] }[] {
  const groups: { date: string; messages: ChatMessage[] }[] = []
  for (const msg of messages) {
    const dateLabel = formatDate(msg.createdAt)
    const last = groups[groups.length - 1]
    if (last && last.date === dateLabel) last.messages.push(msg)
    else groups.push({ date: dateLabel, messages: [msg] })
  }
  return groups
}

function ChatContent() {
  const { clients, chatMessages, addChatMessage, activeUser, teamMembers } = useAppContext()
  const [selectedChannelId, setSelectedChannelId] = useState<string>(clients[0]?.id ?? '')
  const [text, setText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef    = useRef<HTMLTextAreaElement>(null)

  const channelMessages = chatMessages.filter(m => m.channelId === selectedChannelId)
  const countByChannel  = clients.reduce<Record<string, number>>((acc, c) => {
    acc[c.id] = chatMessages.filter(m => m.channelId === c.id).length
    return acc
  }, {})

  // @mention autocomplete
  const mentionQuery = getMentionQuery(text)
  const mentionSuggestions = useMemo(() => {
    if (mentionQuery === null) return []
    const q = mentionQuery.toLowerCase()
    return teamMembers.filter(m =>
      m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q)
    )
  }, [mentionQuery, teamMembers])
  const showMentionPopup = mentionQuery !== null && mentionSuggestions.length > 0

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [channelMessages.length])

  function handleSend() {
    if (!text.trim() || !selectedChannelId) return
    addChatMessage({
      id:             crypto.randomUUID(),
      channelId:      selectedChannelId,
      authorId:       activeUser.id,
      authorName:     activeUser.name,
      authorColor:    activeUser.color,
      authorInitials: activeUser.initials,
      text:           text.trim(),
      createdAt:      new Date().toISOString(),
    })
    setText('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (showMentionPopup) return // let Enter select from popup instead
      handleSend()
    }
    if (e.key === 'Escape') setText(t => t) // dismiss popup without changing text
  }

  function insertMention(member: TeamMember) {
    const atIdx = text.lastIndexOf('@')
    const newText = text.slice(0, atIdx) + `@${member.name} `
    setText(newText)
    textareaRef.current?.focus()
  }

  const groups = groupByDate(channelMessages)

  return (
    <main className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Sidebar — channels */}
      <div className="w-60 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col">
        <div className="px-4 py-4 border-b border-slate-100">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Canales de cliente</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {clients.map(client => (
            <button
              key={client.id}
              onClick={() => setSelectedChannelId(client.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left',
                selectedChannelId === client.id ? 'bg-brand/8 text-brand' : 'text-slate-600 hover:bg-slate-50',
              )}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: client.color }}>
                {client.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-[13px] font-medium truncate', selectedChannelId === client.id && 'text-brand font-semibold')}>
                  {client.name}
                </p>
              </div>
              {countByChannel[client.id] > 0 && (
                <span
                  className="text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 flex-shrink-0"
                  style={{
                    background: selectedChannelId === client.id ? '#FF6B35' : client.color + '20',
                    color: selectedChannelId === client.id ? 'white' : client.color,
                  }}
                >
                  {countByChannel[client.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Active user indicator */}
        <div className="border-t border-slate-100 px-4 py-3 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: activeUser.color }}>
            {activeUser.initials}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-slate-700 truncate">{activeUser.name}</p>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              <p className="text-[10px] text-slate-400">{activeUser.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main panel */}
      <div className="flex-1 flex flex-col bg-canvas">
        {/* Channel header */}
        {(() => {
          const ch = clients.find(c => c.id === selectedChannelId)
          if (!ch) return null
          return (
            <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[11px] font-bold" style={{ background: ch.color }}>
                {ch.initials}
              </div>
              <div>
                <h2 className="text-[14px] font-bold text-slate-800">{ch.name}</h2>
                <p className="text-[11px] text-slate-400">{channelMessages.length} mensajes en este canal</p>
              </div>
            </div>
          )
        })()}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
          {channelMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <MessageCircle size={40} className="text-slate-300 mb-3" />
              <p className="text-[14px] font-semibold text-slate-500 mb-1">Sin mensajes todavía</p>
              <p className="text-[12px] text-slate-400">Sé el primero en escribir en este canal.</p>
            </div>
          ) : (
            groups.map(group => (
              <div key={group.date} className="space-y-2">
                <div className="flex items-center gap-3 py-2">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[11px] font-semibold text-slate-400">{group.date}</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                {group.messages.map(msg => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isOwn={msg.authorId === activeUser.id}
                    members={teamMembers}
                  />
                ))}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="bg-white border-t border-slate-200 px-4 py-3">
          {/* @mention popup */}
          {showMentionPopup && (
            <div className="mb-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-3 pt-2 pb-1">Etiquetar</p>
              {mentionSuggestions.map(member => (
                <button
                  key={member.id}
                  onClick={() => insertMention(member)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0" style={{ background: member.color }}>
                    {member.initials}
                  </div>
                  <div>
                    <span className="text-[12px] font-semibold text-slate-700">{member.name}</span>
                    <span className="text-[11px] text-slate-400 ml-1.5">{member.role}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 focus-within:border-brand/40 focus-within:ring-2 focus-within:ring-brand/10 transition-all">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Escribir en ${clients.find(c => c.id === selectedChannelId)?.name ?? 'canal'}… · @ para etiquetar`}
              rows={1}
              className="flex-1 bg-transparent text-[13px] text-slate-700 placeholder-slate-400 outline-none resize-none font-sans leading-relaxed"
              style={{ maxHeight: 120, overflowY: 'auto' }}
            />
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center flex-shrink-0 hover:bg-brand-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed mb-0.5"
            >
              <Send size={14} className="text-white" />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 px-1">
            Enter para enviar · Shift+Enter para nueva línea · @ para etiquetar un rol
          </p>
        </div>
      </div>
    </main>
  )
}

export default function ChatPage() {
  return (
    <MainLayout>
      <TopBar
        greeting="Chat Interno"
        subtitle="Comunicación del equipo · usá @ para etiquetar roles"
      />
      <ChatContent />
    </MainLayout>
  )
}
