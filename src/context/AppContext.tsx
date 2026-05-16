'use client'

import {
  createContext, useContext, useState, useEffect,
  useCallback, type ReactNode,
} from 'react'
import type {
  AppClient, AppTask,
  TeamMember, KnowledgeLink, KnowledgeCategoryDef, ChatMessage, UserNotification,
} from '@/types'
import { STATUS_OPTIONS } from '@/types'

// ── TEAM MEMBERS ──────────────────────────────────────────────────
export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  { id: 'u1', name: 'Nazarena',      role: 'Superadmin',  email: 'nazarena@agencia.com', color: '#FF6B35', initials: 'NZ' },
  { id: 'u2', name: 'Ana García',    role: 'CM',          email: 'ana@agencia.com',      color: '#EC4899', initials: 'AG' },
  { id: 'u3', name: 'Diego Ramírez', role: 'Paid Media',  email: 'diego@agencia.com',    color: '#F59E0B', initials: 'DR' },
  { id: 'u4', name: 'María Torres',  role: 'CM',          email: 'maria@agencia.com',    color: '#10B981', initials: 'MT' },
  { id: 'u5', name: 'Carlos López',  role: 'Dev',         email: 'carlos@agencia.com',   color: '#3B82F6', initials: 'CL' },
]
// Backwards compat alias
export const TEAM_MEMBERS = INITIAL_TEAM_MEMBERS

// ── GLOBAL SERVICES ───────────────────────────────────────────────
export const DEFAULT_SERVICES: string[] = [
  'Redes Sociales', 'Pauta Digital', 'SEO/SEM', 'Desarrollo Web',
  'Email Marketing', 'Branding', 'Diseño Gráfico', 'Contenidos', 'Web Corporativa',
]

// ── KNOWLEDGE CATEGORIES ──────────────────────────────────────────
export const DEFAULT_KNOWLEDGE_CATEGORIES: KnowledgeCategoryDef[] = [
  { id: 'drive',      label: 'Google Drive',  color: '#10B981', bg: '#ECFDF5' },
  { id: 'sop',        label: 'SOP / Proceso', color: '#8B5CF6', bg: '#F5F3FF' },
  { id: 'link',       label: 'Links',         color: '#3B82F6', bg: '#EFF6FF' },
  { id: 'referencia', label: 'Referencias',   color: '#F59E0B', bg: '#FFFBEB' },
]

// ── CLIENTS ──────────────────────────────────────────────────────
export const INITIAL_CLIENTS: AppClient[] = [
  {
    id: 'c1', name: 'Marca Viva', color: '#6366F1', initials: 'MV',
    services: ['Redes Sociales', 'Pauta Digital', 'Contenidos'],
    industry: 'Moda & Lifestyle',
  },
  {
    id: 'c2', name: 'TechStore', color: '#EC4899', initials: 'TS',
    services: ['Desarrollo Web', 'SEO/SEM', 'Pauta Digital'],
    industry: 'E-commerce',
  },
  {
    id: 'c3', name: 'EcoModa', color: '#10B981', initials: 'EM',
    services: ['Redes Sociales', 'Branding', 'Diseño Gráfico'],
    industry: 'Moda Sustentable',
  },
  {
    id: 'c4', name: 'FoodBrand', color: '#F59E0B', initials: 'FB',
    services: ['Redes Sociales', 'Email Marketing', 'Contenidos'],
    industry: 'Gastronomía',
  },
  {
    id: 'c5', name: 'Estudio Legal', color: '#06B6D4', initials: 'EL',
    services: ['Branding', 'Diseño Gráfico', 'Web Corporativa'],
    industry: 'Legal & Consultoría',
  },
]

// ── INITIAL TASKS ─────────────────────────────────────────────────
const INITIAL_APP_TASKS: AppTask[] = [
  {
    id: 'at1', clientId: 'c1', clientName: 'Marca Viva', clientColor: '#6366F1',
    service: 'Redes Sociales', title: 'Pack stories semana 3 — Colección invierno',
    assignee: 'Ana García', status: 'in_progress', priority: 'high',
    startDate: '2026-05-10', dueDate: '2026-05-14', estimatedHours: 8,
    createdAt: '2026-05-01T09:00:00Z',
  },
  {
    id: 'at2', clientId: 'c1', clientName: 'Marca Viva', clientColor: '#6366F1',
    service: 'Pauta Digital', title: 'Informe mensual Meta Ads — Mayo',
    assignee: 'Diego Ramírez', status: 'pending', priority: 'medium',
    startDate: '2026-05-15', dueDate: '2026-05-17', estimatedHours: 4,
    createdAt: '2026-05-01T09:00:00Z',
  },
  {
    id: 'at3', clientId: 'c2', clientName: 'TechStore', clientColor: '#EC4899',
    service: 'SEO/SEM', title: 'Auditoría SEO — Optimización páginas categoría',
    assignee: 'Carlos López', status: 'in_review', priority: 'high',
    startDate: '2026-05-01', dueDate: '2026-05-20', estimatedHours: 16,
    createdAt: '2026-05-01T09:00:00Z',
  },
  {
    id: 'at4', clientId: 'c2', clientName: 'TechStore', clientColor: '#EC4899',
    service: 'Pauta Digital', title: 'Setup Campaña Google Search — Temporada Invierno',
    assignee: 'Diego Ramírez', status: 'in_progress', priority: 'high',
    startDate: '2026-05-05', dueDate: '2026-05-31', estimatedHours: 12,
    createdAt: '2026-05-01T09:00:00Z',
  },
  {
    id: 'at5', clientId: 'c3', clientName: 'EcoModa', clientColor: '#10B981',
    service: 'Redes Sociales', title: 'Calendario editorial junio — 30 piezas',
    assignee: 'María Torres', status: 'pending', priority: 'medium',
    startDate: '2026-05-20', dueDate: '2026-05-30', estimatedHours: 10,
    createdAt: '2026-05-01T09:00:00Z',
  },
  {
    id: 'at6', clientId: 'c3', clientName: 'EcoModa', clientColor: '#10B981',
    service: 'Branding', title: 'Propuesta actualización logo — 3 opciones',
    assignee: 'Ana García', status: 'waiting_client', priority: 'high',
    startDate: '2026-05-08', dueDate: '2026-05-15', estimatedHours: 12,
    createdAt: '2026-05-01T09:00:00Z',
  },
  {
    id: 'at7', clientId: 'c4', clientName: 'FoodBrand', clientColor: '#F59E0B',
    service: 'Email Marketing', title: 'Newsletter mayo — Menú de temporada',
    assignee: 'María Torres', status: 'completed', priority: 'medium',
    startDate: '2026-05-01', dueDate: '2026-05-07', estimatedHours: 3,
    createdAt: '2026-05-01T09:00:00Z',
  },
  {
    id: 'at8', clientId: 'c4', clientName: 'FoodBrand', clientColor: '#F59E0B',
    service: 'Redes Sociales', title: 'Reels semana 2 — Especiales de temporada',
    assignee: 'María Torres', status: 'in_progress', priority: 'high',
    startDate: '2026-05-12', dueDate: '2026-05-16', estimatedHours: 6,
    createdAt: '2026-05-01T09:00:00Z',
  },
  {
    id: 'at9', clientId: 'c5', clientName: 'Estudio Legal', clientColor: '#06B6D4',
    service: 'Branding', title: 'Identidad visual corporativa — Manual de marca',
    assignee: 'Ana García', status: 'in_review', priority: 'critical',
    startDate: '2026-04-20', dueDate: '2026-05-15', estimatedHours: 24,
    createdAt: '2026-05-01T09:00:00Z',
  },
]

// ── CREDENTIALS (mock auth — username → { userId, password }) ─────
export const CREDENTIALS: Record<string, { userId: string; password: string }> = {
  nazarena: { userId: 'u1', password: 'admin123' },
  ana:      { userId: 'u2', password: 'ana123'   },
  diego:    { userId: 'u3', password: 'diego123' },
  maria:    { userId: 'u4', password: 'maria123' },
  carlos:   { userId: 'u5', password: 'carlos123' },
}

// ── LOCALSTORAGE KEYS ─────────────────────────────────────────────
const LS_TASKS      = 'nazarena_app_tasks_v1'
const LS_SERVICES   = 'nazarena_services_v1'
const LS_USER       = 'nazarena_active_user_v1'
const LS_KNOWLEDGE  = 'nazarena_knowledge_v1'
const LS_CHAT       = 'nazarena_chat_v1'
const LS_CLIENTS    = 'nazarena_clients_v1'
const LS_TEAM       = 'nazarena_team_v1'
const LS_CATEGORIES = 'nazarena_categories_v1'
const LS_NOTIFS     = 'nazarena_notifications_v1'
const LS_AUTH       = 'nazarena_auth_v1'

function loadLS<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const saved = localStorage.getItem(key)
    return saved ? (JSON.parse(saved) as T) : fallback
  } catch {
    return fallback
  }
}

// ── CONTEXT TYPE ──────────────────────────────────────────────────
interface AppContextValue {
  // Clients
  clients: AppClient[]
  addClient: (client: AppClient) => void
  updateClient: (client: AppClient) => void
  deleteClient: (id: string) => void

  // Tasks
  appTasks: AppTask[]
  isModalOpen: boolean
  editingTaskId: string | null
  presetClientId: string | null
  presetServiceName: string | null
  openNewTask: (clientId?: string, serviceName?: string) => void
  openEditTask: (id: string) => void
  closeModal: () => void
  addAppTask: (task: AppTask) => void
  updateAppTask: (task: AppTask) => void
  deleteAppTask: (id: string) => void

  // Global Services
  globalServices: string[]
  addService: (name: string) => void
  deleteService: (name: string) => void

  // User Identity
  teamMembers: TeamMember[]
  activeUser: TeamMember
  setActiveUser: (member: TeamMember) => void
  addTeamMember: (member: TeamMember) => void
  updateTeamMember: (member: TeamMember) => void
  deleteTeamMember: (id: string) => void

  // Knowledge Hub
  knowledgeLinks: KnowledgeLink[]
  addKnowledgeLink: (link: KnowledgeLink) => void
  updateKnowledgeLink: (link: KnowledgeLink) => void
  deleteKnowledgeLink: (id: string) => void
  knowledgeCategories: KnowledgeCategoryDef[]
  addKnowledgeCategory: (cat: KnowledgeCategoryDef) => void
  updateKnowledgeCategory: (cat: KnowledgeCategoryDef) => void
  deleteKnowledgeCategory: (id: string) => void

  // Chat
  chatMessages: ChatMessage[]
  addChatMessage: (msg: ChatMessage) => void

  // Notifications (role-filtered for activeUser)
  notifications: UserNotification[]
  unreadCount: number
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void

  // Auth
  isAuthenticated: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

// ── PROVIDER ──────────────────────────────────────────────────────
export function AppProvider({ children }: { children: ReactNode }) {
  // All useState start with server-safe INITIAL_ values — no localStorage reads here.
  // This prevents server/client HTML mismatch (hydration error).
  const [clients,            setClients]            = useState<AppClient[]>(INITIAL_CLIENTS)
  const [appTasks,           setAppTasks]           = useState<AppTask[]>(INITIAL_APP_TASKS)
  const [globalServices,     setGlobalServices]     = useState<string[]>(DEFAULT_SERVICES)
  const [teamMembers,        setTeamMembers]        = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS)
  const [activeUser,         setActiveUserState]    = useState<TeamMember>(INITIAL_TEAM_MEMBERS[0])
  const [knowledgeLinks,     setKnowledgeLinks]     = useState<KnowledgeLink[]>([])
  const [chatMessages,       setChatMessages]       = useState<ChatMessage[]>([])
  const [knowledgeCategories, setKnowledgeCategories] = useState<KnowledgeCategoryDef[]>(DEFAULT_KNOWLEDGE_CATEGORIES)
  const [storedNotifs,       setStoredNotifs]       = useState<UserNotification[]>([])
  const [isModalOpen,        setIsModalOpen]        = useState(false)
  const [editingTaskId,      setEditingTaskId]      = useState<string | null>(null)
  const [presetClientId,     setPresetClientId]     = useState<string | null>(null)
  const [presetServiceName,  setPresetServiceName]  = useState<string | null>(null)
  const [isAuthenticated,    setIsAuthenticated]    = useState(false)
  const [isHydrated,         setIsHydrated]         = useState(false)

  // Load from localStorage once after mount (client only)
  useEffect(() => {
    setClients(loadLS(LS_CLIENTS, INITIAL_CLIENTS))
    setAppTasks(loadLS(LS_TASKS, INITIAL_APP_TASKS))
    setGlobalServices(loadLS(LS_SERVICES, DEFAULT_SERVICES))
    const savedTeam = loadLS<TeamMember[]>(LS_TEAM, INITIAL_TEAM_MEMBERS)
    setTeamMembers(savedTeam.map(m => m.email ? m : (INITIAL_TEAM_MEMBERS.find(im => im.id === m.id) ?? m)))
    const savedUser = loadLS<TeamMember>(LS_USER, INITIAL_TEAM_MEMBERS[0])
    setActiveUserState(savedUser.email ? savedUser : (INITIAL_TEAM_MEMBERS.find(m => m.id === savedUser.id) ?? INITIAL_TEAM_MEMBERS[0]))
    setKnowledgeLinks(loadLS(LS_KNOWLEDGE, []))
    setChatMessages(loadLS(LS_CHAT, []))
    setKnowledgeCategories(loadLS(LS_CATEGORIES, DEFAULT_KNOWLEDGE_CATEGORIES))
    setStoredNotifs(loadLS(LS_NOTIFS, []))
    setIsAuthenticated(loadLS<boolean>(LS_AUTH, false))
    setIsHydrated(true)
  }, [])

  // Persist to localStorage — only after hydration to avoid overwriting user data with INITIAL_
  useEffect(() => { if (isHydrated) localStorage.setItem(LS_CLIENTS,    JSON.stringify(clients))            }, [isHydrated, clients])
  useEffect(() => { if (isHydrated) localStorage.setItem(LS_TASKS,      JSON.stringify(appTasks))            }, [isHydrated, appTasks])
  useEffect(() => { if (isHydrated) localStorage.setItem(LS_SERVICES,   JSON.stringify(globalServices))      }, [isHydrated, globalServices])
  useEffect(() => { if (isHydrated) localStorage.setItem(LS_TEAM,       JSON.stringify(teamMembers))         }, [isHydrated, teamMembers])
  useEffect(() => { if (isHydrated) localStorage.setItem(LS_USER,       JSON.stringify(activeUser))          }, [isHydrated, activeUser])
  useEffect(() => { if (isHydrated) localStorage.setItem(LS_KNOWLEDGE,  JSON.stringify(knowledgeLinks))      }, [isHydrated, knowledgeLinks])
  useEffect(() => { if (isHydrated) localStorage.setItem(LS_CHAT,       JSON.stringify(chatMessages))        }, [isHydrated, chatMessages])
  useEffect(() => { if (isHydrated) localStorage.setItem(LS_CATEGORIES, JSON.stringify(knowledgeCategories)) }, [isHydrated, knowledgeCategories])
  useEffect(() => { if (isHydrated) localStorage.setItem(LS_NOTIFS,     JSON.stringify(storedNotifs))        }, [isHydrated, storedNotifs])
  useEffect(() => { if (isHydrated) localStorage.setItem(LS_AUTH,       JSON.stringify(isAuthenticated))     }, [isHydrated, isAuthenticated])

  // ── Modal ─────────────────────────────────────────────────────
  const openNewTask  = useCallback((clientId?: string, serviceName?: string) => {
    setEditingTaskId(null)
    setPresetClientId(clientId ?? null)
    setPresetServiceName(serviceName ?? null)
    setIsModalOpen(true)
  }, [])
  const openEditTask = useCallback((id: string) => {
    setEditingTaskId(id)
    setPresetClientId(null)
    setPresetServiceName(null)
    setIsModalOpen(true)
  }, [])
  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setEditingTaskId(null)
    setPresetClientId(null)
    setPresetServiceName(null)
  }, [])

  // ── Tasks ─────────────────────────────────────────────────────
  const addAppTask = useCallback((task: AppTask) => {
    setAppTasks(prev => {
      // Auto-block if dependency is not yet approved/completed
      let finalTask = task
      if (task.dependsOnId) {
        const parent = prev.find(t => t.id === task.dependsOnId)
        if (parent && parent.status !== 'approved' && parent.status !== 'completed') {
          finalTask = { ...task, status: 'blocked' }
        }
      }
      return [finalTask, ...prev]
    })
    const notif: UserNotification = {
      id: crypto.randomUUID(),
      type: 'task_created',
      title: 'Nueva tarea creada',
      message: `"${task.title.slice(0, 50)}" asignada a ${task.assignee} · ${task.clientName}`,
      taskId: task.id,
      assigneeName: task.assignee,
      read: false,
      createdAt: new Date().toISOString(),
    }
    setStoredNotifs(prev => [notif, ...prev.slice(0, 99)])
  }, [])

  const updateAppTask = useCallback((task: AppTask) => {
    setAppTasks(prev => {
      const old = prev.find(t => t.id === task.id)
      if (old && old.status !== task.status) {
        const statusLabel = STATUS_OPTIONS.find(s => s.value === task.status)?.label ?? task.status
        const notif: UserNotification = {
          id: crypto.randomUUID(),
          type: 'task_status_changed',
          title: 'Estado actualizado',
          message: `"${task.title.slice(0, 50)}" → ${statusLabel}`,
          taskId: task.id,
          assigneeName: task.assignee,
          read: false,
          createdAt: new Date().toISOString(),
        }
        setStoredNotifs(n => [notif, ...n.slice(0, 99)])
      }

      // Re-evaluate dependency: if this task has a parent that isn't done, force blocked
      let finalTask = task
      if (task.dependsOnId) {
        const parent = prev.find(t => t.id === task.dependsOnId)
        if (parent && parent.status !== 'approved' && parent.status !== 'completed') {
          finalTask = { ...task, status: 'blocked' }
        }
      }

      // Auto-unblock dependents when this task is approved or completed
      const parentDone = finalTask.status === 'approved' || finalTask.status === 'completed'
      return prev.map(t => {
        if (t.id === finalTask.id) return finalTask
        if (parentDone && t.dependsOnId === finalTask.id && t.status === 'blocked') {
          return { ...t, status: 'pending' as const }
        }
        return t
      })
    })
  }, [])

  const deleteAppTask = useCallback((id: string) => {
    setAppTasks(prev => prev.filter(t => t.id !== id))
  }, [])

  // ── Clients ───────────────────────────────────────────────────
  const addClient = useCallback((client: AppClient) => {
    setClients(prev => [...prev, client])
  }, [])
  const updateClient = useCallback((updated: AppClient) => {
    setClients(prev => prev.map(c => c.id === updated.id ? updated : c))
    setAppTasks(prev => prev.map(t =>
      t.clientId === updated.id
        ? { ...t, clientName: updated.name, clientColor: updated.color }
        : t
    ))
  }, [])
  const deleteClient = useCallback((id: string) => {
    setClients(prev => prev.filter(c => c.id !== id))
    setAppTasks(prev => prev.filter(t => t.clientId !== id))
    setKnowledgeLinks(prev => prev.filter(l => l.clientId !== id))
    setChatMessages(prev => prev.filter(m => m.channelId !== id))
  }, [])

  // ── Services ──────────────────────────────────────────────────
  const addService = useCallback((name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setGlobalServices(prev => prev.includes(trimmed) ? prev : [...prev, trimmed])
  }, [])
  const deleteService = useCallback((name: string) => {
    setGlobalServices(prev => prev.filter(s => s !== name))
    setAppTasks(prev => prev.map(t => t.service === name ? { ...t, service: '' } : t))
  }, [])

  // ── Team Members ──────────────────────────────────────────────
  const setActiveUser = useCallback((member: TeamMember) => setActiveUserState(member), [])
  const addTeamMember = useCallback((member: TeamMember) => {
    setTeamMembers(prev => [...prev, member])
  }, [])
  const updateTeamMember = useCallback((updated: TeamMember) => {
    setTeamMembers(prev => prev.map(m => m.id === updated.id ? updated : m))
    setActiveUserState(prev => prev.id === updated.id ? updated : prev)
  }, [])
  const deleteTeamMember = useCallback((id: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id))
    setActiveUserState(prev => prev.id === id ? INITIAL_TEAM_MEMBERS[0] : prev)
  }, [])

  // ── Knowledge ─────────────────────────────────────────────────
  const addKnowledgeLink    = useCallback((link: KnowledgeLink) => setKnowledgeLinks(prev => [link, ...prev]), [])
  const updateKnowledgeLink = useCallback((link: KnowledgeLink) => setKnowledgeLinks(prev => prev.map(l => l.id === link.id ? link : l)), [])
  const deleteKnowledgeLink = useCallback((id: string) => setKnowledgeLinks(prev => prev.filter(l => l.id !== id)), [])

  const addKnowledgeCategory = useCallback((cat: KnowledgeCategoryDef) => {
    setKnowledgeCategories(prev => prev.find(c => c.id === cat.id) ? prev : [...prev, cat])
  }, [])
  const updateKnowledgeCategory = useCallback((cat: KnowledgeCategoryDef) => {
    setKnowledgeCategories(prev => prev.map(c => c.id === cat.id ? cat : c))
  }, [])
  const deleteKnowledgeCategory = useCallback((id: string) => {
    setKnowledgeCategories(prev => prev.filter(c => c.id !== id))
  }, [])

  // ── Notifications ─────────────────────────────────────────────
  // Filter by role: Superadmin sees all, others see only their tasks
  const isSuperadmin = activeUser.role === 'Superadmin'
  const notifications = isSuperadmin
    ? storedNotifs
    : storedNotifs.filter(n => n.assigneeName === activeUser.name)
  const unreadCount = notifications.filter(n => !n.read).length

  const markNotificationRead = useCallback((id: string) => {
    setStoredNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])
  const markAllNotificationsRead = useCallback(() => {
    setStoredNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  // ── Auth ──────────────────────────────────────────────────────
  const login = useCallback((username: string, password: string): boolean => {
    const cred = CREDENTIALS[username.toLowerCase().trim()]
    if (!cred || cred.password !== password) return false
    const member = INITIAL_TEAM_MEMBERS.find(m => m.id === cred.userId) ?? INITIAL_TEAM_MEMBERS[0]
    setActiveUserState(member)
    setIsAuthenticated(true)
    return true
  }, [])

  const logout = useCallback(() => {
    setIsAuthenticated(false)
  }, [])

  // ── Chat ──────────────────────────────────────────────────────
  const addChatMessage = useCallback((msg: ChatMessage) => setChatMessages(prev => [...prev, msg]), [])

  return (
    <AppContext.Provider value={{
      clients, addClient, updateClient, deleteClient,
      appTasks, isModalOpen, editingTaskId, presetClientId, presetServiceName,
      openNewTask, openEditTask, closeModal, addAppTask, updateAppTask, deleteAppTask,
      globalServices, addService, deleteService,
      teamMembers, activeUser, setActiveUser, addTeamMember, updateTeamMember, deleteTeamMember,
      knowledgeLinks, addKnowledgeLink, updateKnowledgeLink, deleteKnowledgeLink,
      knowledgeCategories, addKnowledgeCategory, updateKnowledgeCategory, deleteKnowledgeCategory,
      chatMessages, addChatMessage,
      notifications, unreadCount, markNotificationRead, markAllNotificationsRead,
      isAuthenticated, login, logout,
    }}>
      {children}
    </AppContext.Provider>
  )
}

// ── HOOK ──────────────────────────────────────────────────────────
export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used inside <AppProvider>')
  return ctx
}
