'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppContext } from '@/context/AppContext'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppContext()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login')
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  return <>{children}</>
}
