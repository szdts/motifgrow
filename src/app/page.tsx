'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { DimensionTabs } from '@/components/layout/dimension-tabs'
import { useUIStore } from '@/stores/ui-store'

const HOURS = Array.from({ length: 17 }, (_, i) => i + 7) // 07:00 - 23:00

function CalendarNav() {
  const { calendarView, setCalendarView, goToToday, goForward, goBackward, currentDate } = useUIStore()

  const formatDateRange = () => {
    const d = currentDate
    if (calendarView === 'month') {
      return `${d.getFullYear()}年${d.getMonth() + 1}月`
    }
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    return `${weekStart.getMonth() + 1}月${weekStart.getDate()}日 - ${weekEnd.getMonth() + 1}月${weekEnd.getDate()}日`
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={goToToday}
          className="rounded-lg border border-divider px-3 py-1 text-sm text-text-primary hover:bg-black/[0.03] transition-colors"
        >
          今天
        </button>
        <div className="flex items-center gap-1">
          <button onClick={goBackward} className="rounded-md p-1 hover:bg-black/5 transition-colors text-text-secondary">
            ◀
          </button>
          <button onClick={goForward} className="rounded-md p-1 hover:bg-black/5 transition-colors text-text-secondary">
            ▶
          </button>
        </div>
        <span className="text-sm font-medium">{formatDateRange()}</span>
      </div>

      <div className="flex items-center rounded-lg border border-divider p-0.5">
        {(['day', 'week', 'month'] as const).map((view) => (
          <button
            key={view}
            onClick={() => setCalendarView(view)}
            className={`rounded-md px-3 py-1 text-xs transition-colors ${
              calendarView === view
                ? 'bg-black/5 font-medium text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {{ day: '日', week: '周', month: '月' }[view]}
          </button>
        ))}
      </div>
    </div>
  )
}

function WeekHeader() {
  const currentDate = useUIStore((s) => s.currentDate)
  const today = new Date()
  const weekStart = new Date(currentDate)
  weekStart.setDate(currentDate.getDate() - currentDate.getDay())

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  const dayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

  return (
    <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-divider">
      <div />
      {days.map((d, i) => {
        const isToday =
          d.getDate() === today.getDate() &&
          d.getMonth() === today.getMonth() &&
          d.getFullYear() === today.getFullYear()
        return (
          <div
            key={i}
            className={`flex flex-col items-center py-2 text-xs ${
              isToday ? 'text-dim-growth font-medium' : 'text-text-secondary'
            }`}
          >
            <span>{dayLabels[i]}</span>
            <span className={`mt-0.5 text-lg font-medium ${
              isToday ? 'bg-dim-growth text-white rounded-full w-8 h-8 flex items-center justify-center' : 'text-text-primary'
            }`}>
              {d.getDate()}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function WeekGrid() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="grid grid-cols-[60px_repeat(7,1fr)]">
        {HOURS.map((hour) => (
          <div key={hour} className="contents">
            <div className="h-14 pr-2 pt-0 text-right text-xs text-text-tertiary">
              {String(hour).padStart(2, '0')}:00
            </div>
            {Array.from({ length: 7 }, (_, dayIndex) => (
              <div
                key={dayIndex}
                className="h-14 border-b border-l border-divider/50 hover:bg-black/[0.015] transition-colors cursor-pointer"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CalendarPage() {
  return (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 space-y-3">
          <DimensionTabs />
          <CalendarNav />
        </div>
        <WeekHeader />
        <WeekGrid />
      </main>
    </>
  )
}
