// Mock data — Mayo 2026 (today = 15 May 2026)

export interface TeamMember {
  id: string
  name: string
  role: string
  avatar: string
  color: string
  taskCount: number
  capacityPercent: number
  online: boolean
}

export interface Client {
  id: string
  name: string
  color: string
  initials: string
}

export interface Project {
  id: string
  clientId: string
  clientName: string
  clientColor: string
  name: string
  status: string
  progress: number
  startDate: Date
  dueDate: Date
  managerName: string
  taskTotal: number
  taskDone: number
}

export interface Task {
  id: string
  projectId: string
  projectName: string
  clientId: string
  clientName: string
  clientColor: string
  title: string
  status: string
  priority: string
  assigneeId: string
  assigneeName: string
  assigneeAvatar: string
  assigneeColor: string
  startDate: Date
  dueDate: Date
  estimatedHours: number
  loggedHours: number
  blockerType?: string
  blockerDescription?: string
}

export interface AlertItem {
  id: string
  type: 'blocked' | 'waiting' | 'overdue'
  taskTitle: string
  clientName: string
  clientColor: string
  projectName: string
  reason: string
  assigneeName: string
  minutesAgo: number
}

export interface ActivityItem {
  id: string
  actorName: string
  actorAvatar: string
  actorColor: string
  action: string
  target: string
  targetType: 'task' | 'project' | 'comment'
  clientName: string
  minutesAgo: number
}

// ── TEAM ───────────────────────────────────────────────────────────
export const TEAM: TeamMember[] = [
  { id: '1', name: 'Ana García',     role: 'graphic_designer',    avatar: 'AG', color: '#EC4899', taskCount: 8,  capacityPercent: 85, online: true },
  { id: '2', name: 'Carlos López',   role: 'web_developer',       avatar: 'CL', color: '#3B82F6', taskCount: 5,  capacityPercent: 62, online: true },
  { id: '3', name: 'María Torres',   role: 'community_manager',   avatar: 'MT', color: '#10B981', taskCount: 12, capacityPercent: 96, online: false },
  { id: '4', name: 'Diego Ramírez',  role: 'trafficker',          avatar: 'DR', color: '#F59E0B', taskCount: 6,  capacityPercent: 70, online: true },
  { id: '5', name: 'Laura Sánchez',  role: 'project_manager',     avatar: 'LS', color: '#8B5CF6', taskCount: 3,  capacityPercent: 40, online: true },
  { id: '6', name: 'Pablo Vega',     role: 'web_developer',       avatar: 'PV', color: '#06B6D4', taskCount: 7,  capacityPercent: 78, online: false },
  { id: '7', name: 'Nazarena',       role: 'superadmin',          avatar: 'NZ', color: '#5046E5', taskCount: 2,  capacityPercent: 30, online: true },
]

// ── CLIENTS ────────────────────────────────────────────────────────
export const CLIENTS: Client[] = [
  { id: '1', name: 'Marca Viva',    color: '#6366F1', initials: 'MV' },
  { id: '2', name: 'TechStore',     color: '#EC4899', initials: 'TS' },
  { id: '3', name: 'EcoModa',       color: '#10B981', initials: 'EM' },
  { id: '4', name: 'FitLife',       color: '#F59E0B', initials: 'FL' },
  { id: '5', name: 'Resto Urbano',  color: '#06B6D4', initials: 'RU' },
]

// ── PROJECTS ───────────────────────────────────────────────────────
export const PROJECTS: Project[] = [
  {
    id: '1', clientId: '1', clientName: 'Marca Viva', clientColor: '#6366F1',
    name: 'Campaña Q2 Meta Ads', status: 'active', progress: 65,
    startDate: new Date(2026, 3, 1), dueDate: new Date(2026, 5, 30),
    managerName: 'Laura Sánchez', taskTotal: 18, taskDone: 12,
  },
  {
    id: '2', clientId: '2', clientName: 'TechStore', clientColor: '#EC4899',
    name: 'Desarrollo Web Ecommerce', status: 'active', progress: 30,
    startDate: new Date(2026, 3, 15), dueDate: new Date(2026, 6, 15),
    managerName: 'Carlos López', taskTotal: 34, taskDone: 10,
  },
  {
    id: '3', clientId: '3', clientName: 'EcoModa', clientColor: '#10B981',
    name: 'Rebranding + Social Media', status: 'active', progress: 80,
    startDate: new Date(2026, 2, 1), dueDate: new Date(2026, 4, 25),
    managerName: 'Laura Sánchez', taskTotal: 22, taskDone: 18,
  },
  {
    id: '4', clientId: '4', clientName: 'FitLife', clientColor: '#F59E0B',
    name: 'Meta Ads Mayo', status: 'active', progress: 50,
    startDate: new Date(2026, 4, 1), dueDate: new Date(2026, 4, 31),
    managerName: 'Diego Ramírez', taskTotal: 12, taskDone: 6,
  },
  {
    id: '5', clientId: '5', clientName: 'Resto Urbano', clientColor: '#06B6D4',
    name: 'SEO + Web', status: 'active', progress: 15,
    startDate: new Date(2026, 4, 10), dueDate: new Date(2026, 7, 10),
    managerName: 'Laura Sánchez', taskTotal: 28, taskDone: 4,
  },
]

// ── TASKS ──────────────────────────────────────────────────────────
export const TASKS: Task[] = [
  {
    id: '1', projectId: '1', projectName: 'Campaña Q2 Meta Ads',
    clientId: '1', clientName: 'Marca Viva', clientColor: '#6366F1',
    title: 'Diseñar banner campaña Q2 (1080x1080)', status: 'blocked', priority: 'critical',
    assigneeId: '1', assigneeName: 'Ana García', assigneeAvatar: 'AG', assigneeColor: '#EC4899',
    startDate: new Date(2026, 4, 10), dueDate: new Date(2026, 4, 12),
    estimatedHours: 6, loggedHours: 1.5,
    blockerType: 'missing_material', blockerDescription: 'Falta brief de creativos del cliente',
  },
  {
    id: '2', projectId: '1', projectName: 'Campaña Q2 Meta Ads',
    clientId: '1', clientName: 'Marca Viva', clientColor: '#6366F1',
    title: 'Setup y configuración de campaña Meta', status: 'in_progress', priority: 'high',
    assigneeId: '4', assigneeName: 'Diego Ramírez', assigneeAvatar: 'DR', assigneeColor: '#F59E0B',
    startDate: new Date(2026, 4, 13), dueDate: new Date(2026, 4, 15),
    estimatedHours: 4, loggedHours: 2,
  },
  {
    id: '3', projectId: '2', projectName: 'Desarrollo Web Ecommerce',
    clientId: '2', clientName: 'TechStore', clientColor: '#EC4899',
    title: 'Diseño Home Page — wireframes aprobados', status: 'waiting_client', priority: 'high',
    assigneeId: '1', assigneeName: 'Ana García', assigneeAvatar: 'AG', assigneeColor: '#EC4899',
    startDate: new Date(2026, 4, 8), dueDate: new Date(2026, 4, 14),
    estimatedHours: 12, loggedHours: 8,
    blockerType: 'waiting_client', blockerDescription: 'Esperando aprobación de wireframes al cliente',
  },
  {
    id: '4', projectId: '2', projectName: 'Desarrollo Web Ecommerce',
    clientId: '2', clientName: 'TechStore', clientColor: '#EC4899',
    title: 'Desarrollo módulo carrito de compras', status: 'in_progress', priority: 'high',
    assigneeId: '2', assigneeName: 'Carlos López', assigneeAvatar: 'CL', assigneeColor: '#3B82F6',
    startDate: new Date(2026, 4, 12), dueDate: new Date(2026, 4, 20),
    estimatedHours: 20, loggedHours: 6,
  },
  {
    id: '5', projectId: '3', projectName: 'Rebranding + Social Media',
    clientId: '3', clientName: 'EcoModa', clientColor: '#10B981',
    title: 'Calendario editorial mayo — 3era semana', status: 'in_review', priority: 'medium',
    assigneeId: '3', assigneeName: 'María Torres', assigneeAvatar: 'MT', assigneeColor: '#10B981',
    startDate: new Date(2026, 4, 13), dueDate: new Date(2026, 4, 16),
    estimatedHours: 3, loggedHours: 3,
  },
  {
    id: '6', projectId: '4', projectName: 'Meta Ads Mayo',
    clientId: '4', clientName: 'FitLife', clientColor: '#F59E0B',
    title: 'Copys para anuncios de conversión', status: 'blocked', priority: 'critical',
    assigneeId: '3', assigneeName: 'María Torres', assigneeAvatar: 'MT', assigneeColor: '#10B981',
    startDate: new Date(2026, 4, 14), dueDate: new Date(2026, 4, 15),
    estimatedHours: 5, loggedHours: 0,
    blockerType: 'missing_access', blockerDescription: 'Sin acceso a Google Analytics para revisar audiencias previas',
  },
  {
    id: '7', projectId: '5', projectName: 'SEO + Web',
    clientId: '5', clientName: 'Resto Urbano', clientColor: '#06B6D4',
    title: 'Auditoría técnica SEO inicial', status: 'in_progress', priority: 'high',
    assigneeId: '6', assigneeName: 'Pablo Vega', assigneeAvatar: 'PV', assigneeColor: '#06B6D4',
    startDate: new Date(2026, 4, 14), dueDate: new Date(2026, 4, 19),
    estimatedHours: 8, loggedHours: 2,
  },
  {
    id: '8', projectId: '3', projectName: 'Rebranding + Social Media',
    clientId: '3', clientName: 'EcoModa', clientColor: '#10B981',
    title: 'Pack de stories Instagram — Colección invierno', status: 'pending', priority: 'medium',
    assigneeId: '1', assigneeName: 'Ana García', assigneeAvatar: 'AG', assigneeColor: '#EC4899',
    startDate: new Date(2026, 4, 16), dueDate: new Date(2026, 4, 19),
    estimatedHours: 8, loggedHours: 0,
  },
  {
    id: '9', projectId: '1', projectName: 'Campaña Q2 Meta Ads',
    clientId: '1', clientName: 'Marca Viva', clientColor: '#6366F1',
    title: 'Análisis de resultados semana 1', status: 'completed', priority: 'medium',
    assigneeId: '4', assigneeName: 'Diego Ramírez', assigneeAvatar: 'DR', assigneeColor: '#F59E0B',
    startDate: new Date(2026, 4, 12), dueDate: new Date(2026, 4, 13),
    estimatedHours: 3, loggedHours: 2.5,
  },
  {
    id: '10', projectId: '2', projectName: 'Desarrollo Web Ecommerce',
    clientId: '2', clientName: 'TechStore', clientColor: '#EC4899',
    title: 'Integración pasarela de pago Mercado Pago', status: 'pending', priority: 'high',
    assigneeId: '2', assigneeName: 'Carlos López', assigneeAvatar: 'CL', assigneeColor: '#3B82F6',
    startDate: new Date(2026, 4, 21), dueDate: new Date(2026, 4, 28),
    estimatedHours: 16, loggedHours: 0,
  },
  {
    id: '11', projectId: '4', projectName: 'Meta Ads Mayo',
    clientId: '4', clientName: 'FitLife', clientColor: '#F59E0B',
    title: 'Diseño creativos semana 3', status: 'pending', priority: 'medium',
    assigneeId: '1', assigneeName: 'Ana García', assigneeAvatar: 'AG', assigneeColor: '#EC4899',
    startDate: new Date(2026, 4, 18), dueDate: new Date(2026, 4, 20),
    estimatedHours: 6, loggedHours: 0,
  },
  {
    id: '12', projectId: '5', projectName: 'SEO + Web',
    clientId: '5', clientName: 'Resto Urbano', clientColor: '#06B6D4',
    title: 'Definición arquitectura de información sitio', status: 'in_progress', priority: 'high',
    assigneeId: '2', assigneeName: 'Carlos López', assigneeAvatar: 'CL', assigneeColor: '#3B82F6',
    startDate: new Date(2026, 4, 15), dueDate: new Date(2026, 4, 22),
    estimatedHours: 10, loggedHours: 1,
  },
]

// ── ALERTS ─────────────────────────────────────────────────────────
export const ALERTS: AlertItem[] = [
  {
    id: 'a1', type: 'blocked',
    taskTitle: 'Diseñar banner campaña Q2',
    clientName: 'Marca Viva', clientColor: '#6366F1',
    projectName: 'Campaña Q2 Meta Ads',
    reason: 'Falta brief de creativos del cliente',
    assigneeName: 'Ana García', minutesAgo: 2880, // 2 días
  },
  {
    id: 'a2', type: 'overdue',
    taskTitle: 'Diseño Home Page — wireframes aprobados',
    clientName: 'TechStore', clientColor: '#EC4899',
    projectName: 'Desarrollo Web Ecommerce',
    reason: 'Vencida ayer — esperando respuesta cliente',
    assigneeName: 'Ana García', minutesAgo: 1440, // ayer
  },
  {
    id: 'a3', type: 'blocked',
    taskTitle: 'Copys para anuncios de conversión',
    clientName: 'FitLife', clientColor: '#F59E0B',
    projectName: 'Meta Ads Mayo',
    reason: 'Sin acceso a Google Analytics',
    assigneeName: 'María Torres', minutesAgo: 240,
  },
  {
    id: 'a4', type: 'waiting',
    taskTitle: 'Calendario editorial — 3era semana',
    clientName: 'EcoModa', clientColor: '#10B981',
    projectName: 'Rebranding + Social Media',
    reason: 'Esperando aprobación del cliente, vence hoy',
    assigneeName: 'María Torres', minutesAgo: 60,
  },
  {
    id: 'a5', type: 'waiting',
    taskTitle: 'Setup campaña Meta',
    clientName: 'Marca Viva', clientColor: '#6366F1',
    projectName: 'Campaña Q2 Meta Ads',
    reason: 'Accesos a Business Manager pendientes',
    assigneeName: 'Diego Ramírez', minutesAgo: 30,
  },
]

// ── ACTIVITY ───────────────────────────────────────────────────────
export const ACTIVITY: ActivityItem[] = [
  {
    id: 'ac1',
    actorName: 'Ana García', actorAvatar: 'AG', actorColor: '#EC4899',
    action: 'completó',
    target: 'Pack stories Instagram — semana 2',
    targetType: 'task',
    clientName: 'EcoModa',
    minutesAgo: 12,
  },
  {
    id: 'ac2',
    actorName: 'Carlos López', actorAvatar: 'CL', actorColor: '#3B82F6',
    action: 'inició',
    target: 'Módulo carrito de compras',
    targetType: 'task',
    clientName: 'TechStore',
    minutesAgo: 35,
  },
  {
    id: 'ac3',
    actorName: 'María Torres', actorAvatar: 'MT', actorColor: '#10B981',
    action: 'cambió estado a "En revisión" en',
    target: 'Calendario editorial mayo',
    targetType: 'task',
    clientName: 'EcoModa',
    minutesAgo: 68,
  },
  {
    id: 'ac4',
    actorName: 'Diego Ramírez', actorAvatar: 'DR', actorColor: '#F59E0B',
    action: 'comentó en',
    target: 'Análisis resultados semana 1',
    targetType: 'comment',
    clientName: 'Marca Viva',
    minutesAgo: 120,
  },
  {
    id: 'ac5',
    actorName: 'Pablo Vega', actorAvatar: 'PV', actorColor: '#06B6D4',
    action: 'inició time tracking en',
    target: 'Auditoría técnica SEO inicial',
    targetType: 'task',
    clientName: 'Resto Urbano',
    minutesAgo: 180,
  },
  {
    id: 'ac6',
    actorName: 'Laura Sánchez', actorAvatar: 'LS', actorColor: '#8B5CF6',
    action: 'creó el proyecto',
    target: 'SEO + Web',
    targetType: 'project',
    clientName: 'Resto Urbano',
    minutesAgo: 360,
  },
  {
    id: 'ac7',
    actorName: 'Ana García', actorAvatar: 'AG', actorColor: '#EC4899',
    action: 'marcó como bloqueada',
    target: 'Diseñar banner campaña Q2',
    targetType: 'task',
    clientName: 'Marca Viva',
    minutesAgo: 2880,
  },
]

// Helper: calendar task dots — keyed by "yyyy-MM-dd"
export const CALENDAR_TASK_COUNTS: Record<string, { count: number; hasBlocked: boolean; hasOverdue: boolean }> = {
  '2026-05-12': { count: 2, hasBlocked: false, hasOverdue: true },
  '2026-05-13': { count: 3, hasBlocked: false, hasOverdue: false },
  '2026-05-14': { count: 4, hasBlocked: true,  hasOverdue: true },
  '2026-05-15': { count: 5, hasBlocked: true,  hasOverdue: false },
  '2026-05-16': { count: 3, hasBlocked: false, hasOverdue: false },
  '2026-05-19': { count: 4, hasBlocked: false, hasOverdue: false },
  '2026-05-20': { count: 6, hasBlocked: false, hasOverdue: false },
  '2026-05-21': { count: 2, hasBlocked: false, hasOverdue: false },
  '2026-05-22': { count: 3, hasBlocked: false, hasOverdue: false },
  '2026-05-23': { count: 1, hasBlocked: false, hasOverdue: false },
  '2026-05-26': { count: 5, hasBlocked: false, hasOverdue: false },
  '2026-05-27': { count: 4, hasBlocked: false, hasOverdue: false },
  '2026-05-28': { count: 7, hasBlocked: false, hasOverdue: false },
  '2026-05-29': { count: 3, hasBlocked: false, hasOverdue: false },
  '2026-05-30': { count: 2, hasBlocked: false, hasOverdue: false },
}
