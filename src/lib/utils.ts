import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const ROLE_LABELS: Record<string, string> = {
  superadmin:          'Superadmin',
  project_manager:     'Project Manager',
  graphic_designer:    'Diseñadora Gráfica',
  community_manager:   'Community Manager',
  trafficker:          'Trafficker',
  web_developer:       'Desarrollador Web',
  administrative:      'Administrativo',
}

export const STATUS_CONFIG: Record<string, {
  label: string
  color: string
  bg: string
  border: string
  cssClass: string
}> = {
  pending:        { label: 'Pendiente',          color: '#94A3B8', bg: '#F8FAFC', border: '#E2E8F0', cssClass: 'badge-pending' },
  in_progress:    { label: 'En progreso',         color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', cssClass: 'badge-in-progress' },
  waiting_client: { label: 'Esperando cliente',   color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', cssClass: 'badge-waiting' },
  blocked:        { label: 'Bloqueada',            color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', cssClass: 'badge-blocked' },
  in_review:      { label: 'En revisión',          color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE', cssClass: 'badge-in-review' },
  completed:      { label: 'Completada',           color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', cssClass: 'badge-completed' },
  cancelled:      { label: 'Cancelada',            color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB', cssClass: 'badge-cancelled' },
}

export const BLOCKER_LABELS: Record<string, string> = {
  missing_material:    'Falta de material',
  missing_access:      'Falta de accesos',
  waiting_client:      'Esperando al cliente',
  external_dependency: 'Dependencia externa',
  other:               'Otro motivo',
}

export const PRIORITY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  critical: { label: 'Crítica',  color: '#EF4444', dot: 'priority-critical' },
  high:     { label: 'Alta',     color: '#F97316', dot: 'priority-high' },
  medium:   { label: 'Media',    color: '#F59E0B', dot: 'priority-medium' },
  low:      { label: 'Baja',     color: '#94A3B8', dot: 'priority-low' },
}

export function formatHours(h: number): string {
  if (h < 1) return `${Math.round(h * 60)}min`
  return `${h}h`
}

export function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}
