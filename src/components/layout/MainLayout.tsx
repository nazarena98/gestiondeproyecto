import { ToastContainer } from '@/components/notifications/ToastContainer'
import { TaskModal } from '@/components/modal/TaskModal'
import { Sidebar } from './Sidebar'
import { AuthGuard } from './AuthGuard'

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-canvas">
        <Sidebar />
        <div className="ml-64 min-h-screen flex flex-col">
          {children}
        </div>
        <ToastContainer />
        <TaskModal />
      </div>
    </AuthGuard>
  )
}
