'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, BookOpen, Target, BarChart3, Settings } from 'lucide-react'

const navItems = [
  { href: '/', label: '日历', icon: Calendar },
  { href: '/library', label: '媒体库', icon: BookOpen },
  { href: '/goals', label: '目标', icon: Target },
  { href: '/review', label: '回顾', icon: BarChart3 },
]

export function TopNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.06]" style={{ backgroundColor: 'rgba(255,255,255,0.72)', backdropFilter: 'saturate(180%) blur(20px)', WebkitBackdropFilter: 'saturate(180%) blur(20px)' }}>
      <div className="flex h-11 items-center px-5">
        <span className="text-[17px] font-semibold tracking-[-0.02em] text-[#1d1d1f] mr-8 select-none">
          Motifgrow
        </span>

        <nav className="flex items-center gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium tracking-[-0.01em] transition-all duration-200 ${
                  isActive
                    ? 'bg-black/[0.06] text-[#1d1d1f]'
                    : 'text-[rgba(0,0,0,0.48)] hover:text-[#1d1d1f] hover:bg-black/[0.03]'
                }`}
              >
                <Icon size={15} strokeWidth={isActive ? 2 : 1.5} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/settings"
            className="flex items-center justify-center w-8 h-8 rounded-full text-[rgba(0,0,0,0.36)] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-all duration-200"
          >
            <Settings size={16} strokeWidth={1.5} />
          </Link>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0071e3] to-[#40a0ff] flex items-center justify-center">
            <span className="text-[11px] font-semibold text-white leading-none">W</span>
          </div>
        </div>
      </div>
    </header>
  )
}
