'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password']

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const user = useAuthStore((s) => s.user)
  const pathname = usePathname()
  const router = useRouter()
  const [isChecked, setIsChecked] = useState(false)

  useEffect(() => {
    if (isPublicPath(pathname)) {
      setIsChecked(true)
      return
    }

    if (!user) {
      router.replace('/login')
      return
    }

    setIsChecked(true)
  }, [user, pathname, router])

  // On public pages, always render
  if (isPublicPath(pathname)) {
    return <>{children}</>
  }

  // On protected pages, show loading until auth check completes
  if (!isChecked || !user) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
