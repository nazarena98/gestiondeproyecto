export interface AppClient {
  id: string
  name: string
  color: string
  initials: string
  services: string[]
  industry: string
}

export interface TaskLink {
  id: string
  url: string
  label: string
}

export interface AppTask {
  id: string
  clientId: string
  clientName: string
  clientColor: string
  service: string
  category?: string
  title: string
  assignee: string
  status: TaskStatus
  priority: TaskPriority
  startDate: string
  dueDate: string
  estimatedHours: number
  createdAt: string
  description?: string
  deliverable?: string
  feedback?: string
  links?: TaskLink[]
  dependsOnId?: string   // id of the task this one depends on
}

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'waiting_client'
  | 'blocked'
  | 'in_review'
  | 'approved'
  | 'correction'
  | 'completed'
  | 'cancelled'

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low'

export interface GanttTask {
  id: string
  clientId: string
  clientName: string
  clientColor: string
  projectId: string
  projectName: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string
  assigneeName: string
  assigneeAvatar: string
  assigneeColor: string
  startDate: Date
  dueDate: Date
  estimatedHours: number
  loggedHours: number
  dependsOnId?: string
  blockerType?: string
  blockerDescription?: string
  actualEndDate?: Date
}

export interface AppNotification {
  id: string
  type:
    | 'task_approved'
    | 'task_blocked'
    | 'task_correction'
    | 'dependency_unlocked'
    | 'date_changed'
    | 'system'
  title: string
  message: string
  taskId?: string
  taskName?: string
  targetRole?: string
  read: boolean
  createdAt: Date
}

export interface ToastMessage {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  duration: number
  exiting?: boolean
}

export const STATUS_OPTIONS: {
  value: TaskStatus
  label: string
  color: string
  bg: string
  border: string
  description: string
}[] = [
  { value: 'pending',        label: 'Pendiente',         color: '#94A3B8', bg: '#F8FAFC', border: '#E2E8F0', description: 'Sin iniciar' },
  { value: 'in_progress',    label: 'En Proceso',        color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', description: 'En trabajo actualmente' },
  { value: 'waiting_client', label: 'Esperando Cliente', color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', description: 'Requiere acción del cliente' },
  { value: 'in_review',      label: 'En Revisión',       color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE', description: 'Esperando aprobación interna' },
  { value: 'approved',       label: 'Aprobada ✓',        color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', description: 'Aprobada — desbloquea dependientes' },
  { value: 'correction',     label: 'Con Corrección',    color: '#F97316', bg: '#FFF7ED', border: '#FED7AA', description: 'Requiere ajustes' },
  { value: 'blocked',        label: 'Bloqueada',         color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', description: 'Bloqueada por un impedimento' },
  { value: 'completed',      label: 'Completada',        color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', description: 'Finalizada y cerrada' },
  { value: 'cancelled',      label: 'Cancelada',         color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB', description: 'Cancelada' },
]

export const STATUS_BAR_COLORS: Record<TaskStatus, string> = {
  pending:        '#CBD5E1',
  in_progress:    '#60A5FA',
  waiting_client: '#FBBF24',
  blocked:        '#F87171',
  in_review:      '#A78BFA',
  approved:       '#34D399',
  correction:     '#FB923C',
  completed:      '#10B981',
  cancelled:      '#94A3B8',
}

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  critical: '#EF4444',
  high:     '#F97316',
  medium:   '#F59E0B',
  low:      '#94A3B8',
}

export interface TeamMember {
  id: string
  name: string
  role: string
  email: string
  color: string
  initials: string
}

export type KnowledgeCategory = string

export interface KnowledgeCategoryDef {
  id: string
  label: string
  color: string
  bg: string
}

export interface KnowledgeLink {
  id: string
  clientId: string
  clientName: string
  title: string
  url: string
  category: KnowledgeCategory
  description?: string
  createdAt: string
}

export interface ChatMessage {
  id: string
  channelId: string
  authorId: string
  authorName: string
  authorColor: string
  authorInitials: string
  text: string
  createdAt: string
}

export type UserNotificationType = 'task_created' | 'task_status_changed' | 'task_due_soon' | 'task_assigned'

export interface UserNotification {
  id: string
  type: UserNotificationType
  title: string
  message: string
  taskId?: string
  assigneeName: string  // used for role-based filtering
  read: boolean
  createdAt: string
}
