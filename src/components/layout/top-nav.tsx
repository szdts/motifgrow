'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const navItems = [
  { href: '/', label: '日历', icon: '📅' },
  { href: '/library', label: '媒体库', icon: '📚' },
  { href: '/goals', label: '目标', icon: '🎯' },
  { href: '/review', label: '回顾', icon: '📊' },
]

export function TopNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 h-12 border-b border-divider bg-surface-elevated/80 backdrop-blur-xl">
      <div className="flex h-full items-center px-4">
        <span className="text-lg font-semibold tracking-tight text-text-primary mr-8">
          Motifgrow
        </span>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-black/5 font-medium text-text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-black/[0.03]'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/settings"
            className="text-text-secondary hover:text-text-primary transition-colors text-sm"
          >
            ⚙️
          </Link>
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-dim-growth text-white text-xs">
              W
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
