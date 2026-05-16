'use client'

import {
  createContext, useContext, useState, useCallback,
  useRef, type ReactNode,
} from 'react'
import { addDays, differenceInDays } from 'date-fns'
import type { GanttTask, AppNotification, ToastMessage, TaskStatus } from '@/types'

// ── INITIAL DATA — Cadenas de dependencias para el demo ──────────
const INITIAL_TASKS: GanttTask[] = [
  // ═══ TechStore — Desarrollo Web ═══
  {
    id: 'gt1', clientId: 'c2', clientName: 'TechStore', clientColor: '#EC4899',
    projectId: 'p2', projectName: 'Desarrollo Web Ecommerce',
    title: 'Wireframes y arquitectura UX', status: 'approved', priority: 'high',
    assigneeId: '1', assigneeName: 'Ana García', assigneeAvatar: 'AG', assigneeColor: '#EC4899',
    startDate: new Date(2026, 3, 15), dueDate: new Date(2026, 3, 28),
    estimatedHours: 16, loggedHours: 18, actualEndDate: new Date(2026, 3, 28),
  },
  {
    id: 'gt2', clientId: 'c2', clientName: 'TechStore', clientColor: '#EC4899',
    projectId: 'p2', projectName: 'Desarrollo Web Ecommerce',
    title: 'Diseño visual UI — Home y Categorías', status: 'in_review', priority: 'high',
    assigneeId: '1', assigneeName: 'Ana García', assigneeAvatar: 'AG', assigneeColor: '#EC4899',
    dependsOnId: 'gt1',
    startDate: new Date(2026, 3, 29), dueDate: new Date(2026, 4, 12),
    estimatedHours: 24, loggedHours: 20,
  },
  {
    id: 'gt3', clientId: 'c2', clientName: 'TechStore', clientColor: '#EC4899',
    projectId: 'p2', projectName: 'Desarrollo Web Ecommerce',
    title: 'Maquetación Frontend (Next.js + Tailwind)', status: 'pending', priority: 'high',
    assigneeId: '6', assigneeName: 'Pablo Vega', assigneeAvatar: 'PV', assigneeColor: '#06B6D4',
    dependsOnId: 'gt2',
    startDate: new Date(2026, 4, 13), dueDate: new Date(2026, 4, 28),
    estimatedHours: 40, loggedHours: 0,
  },
  {
    id: 'gt4', clientId: 'c2', clientName: 'TechStore', clientColor: '#EC4899',
    projectId: 'p2', projectName: 'Desarrollo Web Ecommerce',
    title: 'Integración API, base de datos y pagos', status: 'pending', priority: 'high',
    assigneeId: '2', assigneeName: 'Carlos López', assigneeAvatar: 'CL', assigneeColor: '#3B82F6',
    dependsOnId: 'gt3',
    startDate: new Date(2026, 4, 29), dueDate: new Date(2026, 5, 18),
    estimatedHours: 60, loggedHours: 0,
  },
  {
    id: 'gt5', clientId: 'c2', clientName: 'TechStore', clientColor: '#EC4899',
    projectId: 'p2', projectName: 'Desarrollo Web Ecommerce',
    title: 'Testing, QA y deploy a producción', status: 'pending', priority: 'medium',
    assigneeId: '2', assigneeName: 'Carlos López', assigneeAvatar: 'CL', assigneeColor: '#3B82F6',
    dependsOnId: 'gt4',
    startDate: new Date(2026, 5, 19), dueDate: new Date(2026, 5, 26),
    estimatedHours: 20, loggedHours: 0,
  },
  // ═══ Marca Viva — Campaña Q2 ═══
  {
    id: 'gt6', clientId: 'c1', clientName: 'Marca Viva', clientColor: '#6366F1',
    projectId: 'p1', projectName: 'Campaña Q2 Meta Ads',
    title: 'Brief creativo y definición de audiencias', status: 'waiting_client', priority: 'critical',
    assigneeId: '3', assigneeName: 'María Torres', assigneeAvatar: 'MT', assigneeColor: '#10B981',
    startDate: new Date(2026, 4, 5), dueDate: new Date(2026, 4, 10),
    estimatedHours: 8, loggedHours: 4,
    blockerType: 'waiting_client', blockerDescription: 'Esperando brief final del cliente',
  },
  {
    id: 'gt7', clientId: 'c1', clientName: 'Marca Viva', clientColor: '#6366F1',
    projectId: 'p1', projectName: 'Campaña Q2 Meta Ads',
    title: 'Diseño de creativos y banners (6 piezas)', status: 'blocked', priority: 'critical',
    assigneeId: '1', assigneeName: 'Ana García', assigneeAvatar: 'AG', assigneeColor: '#EC4899',
    dependsOnId: 'gt6',
    startDate: new Date(2026, 4, 11), dueDate: new Date(2026, 4, 15),
    estimatedHours: 12, loggedHours: 0,
    blockerType: 'waiting_client', blockerDescription: 'Depende de brief aprobado por el cliente',
  },
  {
    id: 'gt8', clientId: 'c1', clientName: 'Marca Viva', clientColor: '#6366F1',
    projectId: 'p1', projectName: 'Campaña Q2 Meta Ads',
    title: 'Setup campaña en Meta Ads Manager', status: 'pending', priority: 'high',
    assigneeId: '4', assigneeName: 'Diego Ramírez', assigneeAvatar: 'DR', assigneeColor: '#F59E0B',
    dependsOnId: 'gt7',
    startDate: new Date(2026, 4, 16), dueDate: new Date(2026, 4, 19),
    estimatedHours: 6, loggedHours: 0,
  },
  {
    id: 'gt9', clientId: 'c1', clientName: 'Marca Viva', clientColor: '#6366F1',
    projectId: 'p1', projectName: 'Campaña Q2 Meta Ads',
    title: 'Activación, monitoreo y optimización de pauta', status: 'pending', priority: 'high',
    assigneeId: '4', assigneeName: 'Diego Ramírez', assigneeAvatar: 'DR', assigneeColor: '#F59E0B',
    dependsOnId: 'gt8',
    startDate: new Date(2026, 4, 20), dueDate: new Date(2026, 4, 31),
    estimatedHours: 4, loggedHours: 0,
  },
  // ═══ EcoModa — Social Media ═══
  {
    id: 'gt10', clientId: 'c3', clientName: 'EcoModa', clientColor: '#10B981',
    projectId: 'p3', projectName: 'Rebranding + Social Media',
    title: 'Calendario editorial Mayo — aprobación cliente', status: 'in_review', priority: 'medium',
    assigneeId: '3', assigneeName: 'María Torres', assigneeAvatar: 'MT', assigneeColor: '#10B981',
    startDate: new Date(2026, 4, 1), dueDate: new Date(2026, 4, 15),
    estimatedHours: 6, loggedHours: 6,
  },
  {
    id: 'gt11', clientId: 'c3', clientName: 'EcoModa', clientColor: '#10B981',
    projectId: 'p3', projectName: 'Rebranding + Social Media',
    title: 'Pack stories semana 3 — Colección invierno', status: 'pending', priority: 'medium',
    assigneeId: '1', assigneeName: 'Ana García', assigneeAvatar: 'AG', assigneeColor: '#EC4899',
    dependsOnId: 'gt10',
    startDate: new Date(2026, 4, 16), dueDate: new Date(2026, 4, 22),
    estimatedHours: 8, loggedHours: 0,
  },
]

const INITIAL_NOTIFS: AppNotification[] = [
  {
    id: 'n0', type: 'task_blocked', read: false, createdAt: new Date(Date.now() - 7200000),
    title: 'Tarea bloqueada 🔴',
    message: '"Diseño de creativos y banners" está bloqueada. Depende del brief de Marca Viva.',
    taskId: 'gt7', taskName: 'Diseño de creativos y banners',
  },
  {
    id: 'n1', type: 'task_approved', read: true, createdAt: new Date(Date.now() - 86400000),
    title: 'Wireframes aprobados ✓',
    message: '"Wireframes y arquitectura UX" fue aprobada. Diseño UI puede comenzar.',
    taskId: 'gt1', taskName: 'Wireframes y arquitectura UX',
  },
]

// ── CONTEXT TYPES ────────────────────────────────────────────────
interface TaskContextValue {
  tasks: GanttTask[]
  notifications: AppNotification[]
  toasts: ToastMessage[]
  unreadCount: number
  updateTaskStatus:  (taskId: string, newStatus: TaskStatus) => void
  updateTaskDates:   (taskId: string, start: Date, due: Date) => void
  addGanttTask:      (task: GanttTask) => void
  markNotificationRead: (id: string) => void
  markAllRead: () => void
  dismissToast: (id: string) => void
}

const TaskContext = createContext<TaskContextValue | null>(null)

// ── PROVIDER ─────────────────────────────────────────────────────
export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks,         setTasks]         = useState<GanttTask[]>(INITIAL_TASKS)
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFS)
  const [toasts,        setToasts]        = useState<ToastMessage[]>([])
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  // ── Toast management ──
  const addToast = useCallback((def: Omit<ToastMessage, 'id' | 'exiting'>) => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { ...def, id, exiting: false }])
    const t = setTimeout(() => {
      setToasts(prev => prev.map(x => x.id === id ? { ...x, exiting: true } : x))
      setTimeout(() => { setToasts(prev => prev.filter(x => x.id !== id)); timers.current.delete(id) }, 350)
    }, def.duration)
    timers.current.set(id, t)
  }, [])

  const dismissToast = useCallback((id: string) => {
    const t = timers.current.get(id)
    if (t) { clearTimeout(t); timers.current.delete(id) }
    setToasts(prev => prev.map(x => x.id === id ? { ...x, exiting: true } : x))
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 350)
  }, [])

  // ── CORE: updateTaskStatus + Efecto Dominó ────────────────────
  const updateTaskStatus = useCallback((taskId: string, newStatus: TaskStatus) => {
    // Read current state at call time (tasks is from closure, updated per render)
    const task = tasks.find(t => t.id === taskId)
    if (!task || task.status === newStatus) return

    const isResolving = newStatus === 'approved' || newStatus === 'completed'
    const resolvedAt  = isResolving ? new Date() : task.actualEndDate

    // ── Pure calculation of new tasks (no side-effects inside) ──
    let newTasks: GanttTask[] = tasks.map(t =>
      t.id === taskId ? { ...t, status: newStatus, actualEndDate: resolvedAt } : t
    )

    const notifsToAdd: AppNotification[] = []
    const toastsToAdd: Omit<ToastMessage, 'id' | 'exiting'>[] = []

    // ── EFECTO DOMINÓ: propagate to direct dependents ───────────
    if (isResolving) {
      const directDeps = tasks.filter(t => t.dependsOnId === taskId)

      newTasks = newTasks.map(t => {
        const dep = directDeps.find(d => d.id === t.id)
        if (!dep) return t

        const duration = Math.max(1, differenceInDays(dep.dueDate, dep.startDate))
        const newStart = addDays(resolvedAt ?? new Date(), 1)
        const newDue   = addDays(newStart, duration)
        const unblocked: TaskStatus = (dep.status === 'blocked' || dep.status === 'pending') ? 'pending' : dep.status

        const updatedDep = { ...dep, status: unblocked, startDate: newStart, dueDate: newDue }

        notifsToAdd.push({
          id: crypto.randomUUID(), read: false, createdAt: new Date(),
          type: 'dependency_unlocked',
          title: '¡Dependencia resuelta! 🔓',
          message: `"${task.title}" aprobada → "${updatedDep.title}" desbloqueada. Asignado: ${updatedDep.assigneeName}`,
          taskId: dep.id, taskName: dep.title, targetRole: dep.assigneeName,
        })
        toastsToAdd.push({
          type: 'success',
          title: `✓ ${updatedDep.assigneeName}: ¡Ya podés empezar!`,
          message: `"${updatedDep.title}" — ${newStart.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} → ${newDue.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}`,
          duration: 7000,
        })

        return updatedDep
      })
    }

    // ── Status-specific feedback ─────────────────────────────────
    if (newStatus === 'approved') {
      notifsToAdd.push({ id: crypto.randomUUID(), read: false, createdAt: new Date(), type: 'task_approved', title: 'Tarea aprobada ✓', message: `"${task.title}" fue aprobada correctamente.`, taskId, taskName: task.title })
      toastsToAdd.push({ type: 'success', title: '✓ Aprobada', message: `"${task.title}"`, duration: 4000 })
    } else if (newStatus === 'correction') {
      notifsToAdd.push({ id: crypto.randomUUID(), read: false, createdAt: new Date(), type: 'task_correction', title: 'Requiere corrección ⚠', message: `"${task.title}" — ${task.assigneeName} debe revisar los cambios.`, taskId, taskName: task.title, targetRole: task.assigneeName })
      toastsToAdd.push({ type: 'warning', title: '⚠ Con corrección', message: `"${task.title}" — ${task.assigneeName}`, duration: 5000 })
    } else if (newStatus === 'blocked') {
      notifsToAdd.push({ id: crypto.randomUUID(), read: false, createdAt: new Date(), type: 'task_blocked', title: 'Tarea bloqueada 🔴', message: `"${task.title}" fue marcada como bloqueada.`, taskId, taskName: task.title })
      toastsToAdd.push({ type: 'error', title: '🔴 Bloqueada', message: `"${task.title}"`, duration: 5000 })
    } else if (newStatus === 'in_progress') {
      toastsToAdd.push({ type: 'info', title: '▶ En proceso', message: `"${task.title}"`, duration: 3000 })
    } else if (newStatus === 'in_review') {
      toastsToAdd.push({ type: 'info', title: '👁 En revisión', message: `"${task.title}"`, duration: 4000 })
    }

    // ── Apply ALL state updates (React 18 batches automatically) ─
    setTasks(newTasks)
    if (notifsToAdd.length > 0) {
      setNotifications(prev => [...notifsToAdd, ...prev])
    }
    toastsToAdd.forEach(def => addToast(def))

  }, [tasks, addToast])

  // ── Update task dates manually ────────────────────────────────
  const updateTaskDates = useCallback((taskId: string, start: Date, due: Date) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, startDate: start, dueDate: due } : t))
    addToast({ type: 'info', title: 'Fechas actualizadas', message: 'El Gantt se recalculó automáticamente.', duration: 3000 })
    setNotifications(prev => [{
      id: crypto.randomUUID(), read: false, createdAt: new Date(),
      type: 'date_changed', title: 'Fechas modificadas',
      message: 'Las fechas de una tarea fueron actualizadas manualmente. El Gantt se actualizó.',
      taskId,
    }, ...prev])
  }, [addToast])

  const addGanttTask = useCallback((task: GanttTask) => {
    setTasks(prev => [...prev, task])
    addToast({ type: 'success', title: '✓ Tarea creada', message: `"${task.title}" aparece en el Gantt.`, duration: 4000 })
  }, [addToast])

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <TaskContext.Provider value={{
      tasks, notifications, toasts, unreadCount,
      updateTaskStatus, updateTaskDates, addGanttTask,
      markNotificationRead, markAllRead, dismissToast,
    }}>
      {children}
    </TaskContext.Provider>
  )
}

// ── HOOK ──────────────────────────────────────────────────────────
export function useTaskContext() {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error('useTaskContext must be used inside <TaskProvider>')
  return ctx
}
