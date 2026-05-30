'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/pricing', '/onboarding']

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const user = useAuthStore((s) => s.user)
  const initialize = useAuthStore((s) => s.initialize)
  const pathname = usePathname()
  const router = useRouter()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    initialize().then(() => {
      setIsInitialized(true)
    })
  }, [initialize])

  useEffect(() => {
    if (!isInitialized) return
    if (isPublicPath(pathname)) return

    if (!user) {
      router.replace('/login')
    }
  }, [user, pathname, router, isInitialized])

  // On public pages, always render
  if (isPublicPath(pathname)) {
    return <>{children}</>
  }

  // On protected pages, show loading until auth check completes
  if (!isInitialized || !user) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
