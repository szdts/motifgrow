'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Calendar, BookOpen, Target, BarChart3, Settings, Search, X, LogOut, Crown } from 'lucide-react'
import { useBacklogStore } from '@/stores/backlog-store'
import { useOKRStore } from '@/stores/okr-store'
import { useCalendarStore } from '@/stores/calendar-store'
import { useAuthStore } from '@/stores/auth-store'

const navItems = [
  { href: '/', label: '日历', icon: Calendar },
  { href: '/library', label: '媒体库', icon: BookOpen },
  { href: '/goals', label: '目标', icon: Target },
  { href: '/review', label: '回顾', icon: BarChart3 },
]

interface SearchResult {
  title: string
  type: string
  color: string
  href: string
}

function SearchButton() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const backlogItems = useBacklogStore((s) => s.items)
  const objectives = useOKRStore((s) => s.objectives)
  const events = useCalendarStore((s) => s.events)

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    const matches: SearchResult[] = []

    for (const item of backlogItems) {
      if (item.title.toLowerCase().includes(q)) {
        matches.push({ title: item.title, type: '媒体', color: '#bf4800', href: '/library' })
      }
    }
    for (const obj of objectives) {
      if (obj.title.toLowerCase().includes(q)) {
        matches.push({ title: obj.title, type: '目标', color: '#0071e3', href: '/goals' })
      }
      for (const kr of obj.keyResults) {
        if (kr.title.toLowerCase().includes(q)) {
          matches.push({ title: kr.title, type: 'KR', color: '#248a3d', href: '/goals' })
        }
      }
    }
    for (const evt of events) {
      if (evt.title.toLowerCase().includes(q)) {
        matches.push({ title: evt.title, type: '日程', color: '#86868b', href: '/' })
      }
    }
    return matches.slice(0, 5)
  }, [query, backlogItems, objectives, events])

  const handleOpen = () => {
    setOpen(true)
    // Focus input after render
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleClose = useCallback(() => {
    setOpen(false)
    setQuery('')
  }, [])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, handleClose])

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleClose()
      }
    }
    window.addEventListener('mousedown', handleClickOutside)
    return () => window.removeEventListener('mousedown', handleClickOutside)
  }, [open, handleClose])

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className="flex items-center justify-center w-8 h-8 rounded-full text-[rgba(0,0,0,0.36)] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-all duration-200"
      >
        <Search size={15} strokeWidth={1.5} />
      </button>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-1.5 rounded-lg bg-black/[0.04] px-2.5 py-1.5 transition-all duration-200">
        <Search size={14} strokeWidth={1.5} className="text-[rgba(0,0,0,0.36)] shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索媒体、目标、日程..."
          className="bg-transparent text-[13px] text-[#1d1d1f] placeholder:text-[rgba(0,0,0,0.3)] outline-none w-[200px] tracking-[-0.01em]"
        />
        <button
          onClick={handleClose}
          className="flex items-center justify-center w-5 h-5 rounded-full text-[rgba(0,0,0,0.3)] hover:text-[#1d1d1f] hover:bg-black/[0.06] transition-colors shrink-0"
        >
          <X size={12} strokeWidth={1.5} />
        </button>
      </div>

      {/* Results dropdown */}
      {query.trim() && (
        <div className="absolute top-full mt-1.5 right-0 w-[280px] rounded-xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-black/[0.06] overflow-hidden z-50">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <div className="text-[13px] text-[rgba(0,0,0,0.36)]">无匹配结果</div>
            </div>
          ) : (
            <div className="py-1.5">
              {results.map((result, i) => (
                <button
                  key={`${result.type}-${i}`}
                  onClick={() => { router.push(result.href); handleClose() }}
                  className="w-full flex items-center gap-3 px-3.5 py-2 hover:bg-black/[0.03] transition-colors text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium text-[#1d1d1f] truncate tracking-[-0.01em]">
                      {result.title}
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0"
                    style={{
                      color: result.color,
                      backgroundColor: `color-mix(in srgb, ${result.color} 10%, transparent)`,
                    }}
                  >
                    {result.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function UserMenu() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const handleClose = useCallback(() => setOpen(false), [])

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        handleClose()
      }
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [open, handleClose])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, handleClose])

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-full bg-[#0071e3] px-3.5 py-1 text-[12px] font-medium text-white hover:bg-[#0077ED] transition-colors"
      >
        登录
      </Link>
    )
  }

  const initial = (user.name || user.email)[0].toUpperCase()

  const handleLogout = () => {
    logout()
    handleClose()
    router.push('/login')
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0071e3] to-[#40a0ff] flex items-center justify-center cursor-pointer transition-all duration-200 hover:shadow-[0_0_0_2px_rgba(0,113,227,0.3)] overflow-hidden"
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-[11px] font-semibold text-white leading-none select-none">
            {initial}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full mt-1.5 right-0 w-[200px] rounded-xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-black/[0.06] overflow-hidden z-50">
          {/* User info */}
          <div className="px-3.5 pt-3 pb-2">
            <div className="text-[13px] font-medium text-[#1d1d1f] truncate">{user.name}</div>
            <div className="text-[11px] text-[#86868b] truncate">{user.email}</div>
          </div>
          <div className="mx-3 h-px bg-black/[0.06]" />
          {/* Menu items */}
          <div className="py-1">
            <button
              onClick={() => { router.push('/settings'); handleClose() }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#1d1d1f] hover:bg-black/[0.03] transition-colors text-left"
            >
              <Settings size={14} strokeWidth={1.5} className="text-[rgba(0,0,0,0.36)]" />
              账号设置
            </button>
            {user.plan === 'free' && (
              <button
                onClick={() => { router.push('/pricing'); handleClose() }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#1d1d1f] hover:bg-black/[0.03] transition-colors text-left"
              >
                <Crown size={14} strokeWidth={1.5} className="text-[#bf8f00]" />
                升级 Pro
              </button>
            )}
          </div>
          <div className="mx-3 h-px bg-black/[0.06]" />
          <div className="py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#ff3b30] hover:bg-black/[0.03] transition-colors text-left"
            >
              <LogOut size={14} strokeWidth={1.5} />
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

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
          <SearchButton />
          <Link
            href="/settings"
            className="flex items-center justify-center w-8 h-8 rounded-full text-[rgba(0,0,0,0.36)] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-all duration-200"
          >
            <Settings size={16} strokeWidth={1.5} />
          </Link>
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
