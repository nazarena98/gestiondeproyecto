import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import { TaskProvider } from '@/context/TaskContext'
import { AppProvider } from '@/context/AppContext'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PPM Agencia — Gestión de Proyectos',
  description: 'Sistema de gestión de portafolio de proyectos para agencia digital',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={montserrat.variable}>
      <body className={montserrat.className}>
        <TaskProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </TaskProvider>
      </body>
    </html>
  )
}
