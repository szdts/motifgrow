'use client'

import { useUIStore } from '@/stores/ui-store'
import { useBacklogStore } from '@/stores/backlog-store'
import { useOKRStore } from '@/stores/okr-store'
import { useDimensionStore } from '@/stores/dimension-store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DimensionIcon } from '@/components/ui/dimension-icon'
import { useState, useEffect } from 'react'
import { Plus, ChevronLeft, ChevronRight, PanelLeftClose } from 'lucide-react'

function MiniCalendar() {
  const today = new Date()
  const currentDate = useUIStore((s) => s.currentDate)
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  useEffect(() => {
    setViewYear(currentDate.getFullYear())
    setViewMonth(currentDate.getMonth())
  }, [currentDate])

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const dayLabels = ['日', '一', '二', '三', '四', '五', '六']
  const blanks = Array.from({ length: firstDay }, (_, i) => i)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1)
      setViewMonth(11)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1)
      setViewMonth(0)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const handleDayClick = (day: number) => {
    useUIStore.getState().setCurrentDate(new Date(viewYear, viewMonth, day))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">
          {viewYear}年{viewMonth + 1}月
        </span>
        <div className="flex gap-0.5">
          <button onClick={handlePrevMonth} className="w-6 h-6 flex items-center justify-center rounded-md text-[rgba(0,0,0,0.3)] hover:bg-black/[0.04] transition-colors">
            <ChevronLeft size={14} strokeWidth={1.5} />
          </button>
          <button onClick={handleNextMonth} className="w-6 h-6 flex items-center justify-center rounded-md text-[rgba(0,0,0,0.3)] hover:bg-black/[0.04] transition-colors">
            <ChevronRight size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-0.5 text-center">
        {dayLabels.map((d) => (
          <div key={d} className="text-[10px] font-medium text-[rgba(0,0,0,0.3)] py-1">{d}</div>
        ))}
        {blanks.map((i) => <div key={`b-${i}`} />)}
        {days.map((d) => {
          const isSelected = d === currentDate.getDate() && viewMonth === currentDate.getMonth() && viewYear === currentDate.getFullYear()
          const isToday = d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()
          return (
            <button
              key={d}
              onClick={() => handleDayClick(d)}
              className={`text-[11px] w-7 h-7 mx-auto flex items-center justify-center rounded-full transition-all duration-150 ${
                isSelected
                  ? 'bg-[#0071e3] text-white font-semibold shadow-[0_1px_4px_rgba(0,113,227,0.3)]'
                  : isToday
                    ? 'text-[#0071e3] font-semibold hover:bg-black/[0.04]'
                    : 'text-[#1d1d1f] hover:bg-black/[0.04]'
              }`}
            >
              {d}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function QuotaBars() {
  const objectives = useOKRStore((s) => s.objectives)
  const dimensions = useDimensionStore((s) => s.dimensions)

  const quotas = objectives.flatMap((obj) => {
    const dim = dimensions.find((d) => d.id === obj.dimensionId)
    if (!dim) return []
    return obj.keyResults.slice(0, 1).map((kr) => ({
      icon: dim.icon,
      name: kr.title.length > 8 ? kr.title.slice(0, 8) + '\u2026' : kr.title,
      current: kr.currentValue,
      target: kr.targetValue,
      unit: kr.unit,
      color: dim.color,
      pct: Math.min((kr.currentValue / kr.targetValue) * 100, 100),
    }))
  })

  return (
    <div>
      <div className="text-[11px] font-semibold tracking-[0.02em] uppercase text-[rgba(0,0,0,0.3)] mb-3">
        本周配额
      </div>
      <div className="space-y-3">
        {quotas.map((q) => (
          <div key={q.name}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#1d1d1f] tracking-[-0.01em]">
                <DimensionIcon name={q.icon} size={13} strokeWidth={1.5} />
                {q.name}
              </span>
              <span className="text-[11px] tabular-nums text-[rgba(0,0,0,0.36)]">
                {q.current}/{q.target}{q.unit}
              </span>
            </div>
            <div className="h-[5px] rounded-full bg-black/[0.04] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${q.pct}%`, backgroundColor: q.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BacklogQuickList() {
  const items = useBacklogStore((s) => s.items)
  const dimensions = useDimensionStore((s) => s.dimensions)
  const activeDimIds = useDimensionStore((s) => s.activeDimensionIds)

  const filtered = items
    .filter((i) => i.status !== 'completed' && i.status !== 'dropped')
    .filter((i) => activeDimIds.length === 0 || activeDimIds.includes(i.dimensionId))
    .slice(0, 4)

  const focusLabels = { deep: '深度', shallow: '浅度', relaxing: '放松' } as const

  return (
    <div>
      <div className="text-[11px] font-semibold tracking-[0.02em] uppercase text-[rgba(0,0,0,0.3)] mb-3">
        待消费
      </div>
      <div className="space-y-1">
        {filtered.map((item) => {
          const dim = dimensions.find((d) => d.id === item.dimensionId)
          const remaining = item.totalDurationMinutes - item.consumedDurationMinutes
          const hours = (remaining / 60).toFixed(1)
          return (
            <div
              key={item.id}
              className="group flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 hover:bg-black/[0.03] cursor-pointer transition-all duration-200"
            >
              <div
                className="w-[3px] h-5 rounded-full shrink-0 transition-all duration-200 group-hover:h-6"
                style={{ backgroundColor: dim?.color ?? '#86868b' }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-[#1d1d1f] tracking-[-0.01em] truncate">
                  {item.title}
                </div>
                <div className="text-[11px] text-[rgba(0,0,0,0.36)] mt-0.5">
                  {focusLabels[item.focusLevel]} · {hours}h
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <button className="mt-2 w-full flex items-center justify-center gap-1 rounded-[10px] border border-dashed border-black/[0.08] py-2 text-[12px] text-[rgba(0,0,0,0.3)] hover:text-[rgba(0,0,0,0.5)] hover:border-black/[0.15] hover:bg-black/[0.015] transition-all duration-200">
        <Plus size={13} strokeWidth={1.5} />
        添加内容
      </button>
    </div>
  )
}

export function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  return (
    <aside
      className="shrink-0 border-r border-black/[0.06] bg-white/60 transition-all duration-200 overflow-hidden"
      style={{
        backdropFilter: 'blur(10px)',
        width: sidebarOpen ? '260px' : '0px',
        minWidth: sidebarOpen ? '260px' : '0px',
        borderRightWidth: sidebarOpen ? '1px' : '0px',
      }}
    >
      <div className="w-[260px]">
        <ScrollArea className="h-full">
          <div className="p-5 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-[0.02em] uppercase text-[rgba(0,0,0,0.3)]">侧栏</span>
              <button
                onClick={toggleSidebar}
                className="w-6 h-6 flex items-center justify-center rounded-md text-[rgba(0,0,0,0.3)] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
              >
                <PanelLeftClose size={14} strokeWidth={1.5} />
              </button>
            </div>
            <MiniCalendar />
            <div className="h-px bg-black/[0.06]" />
            <QuotaBars />
            <div className="h-px bg-black/[0.06]" />
            <BacklogQuickList />
          </div>
        </ScrollArea>
      </div>
    </aside>
  )
}
