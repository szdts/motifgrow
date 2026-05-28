'use client'

import { useMemo, useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { DimensionTabs } from '@/components/layout/dimension-tabs'
import { useUIStore } from '@/stores/ui-store'
import { useCalendarStore } from '@/stores/calendar-store'
import { useDimensionStore } from '@/stores/dimension-store'
import { ChevronLeft, ChevronRight, Check, X, Clock } from 'lucide-react'
import type { CalendarEvent } from '@/types'

const HOURS = Array.from({ length: 17 }, (_, i) => i + 7) // 07:00 - 23:00
const HOUR_HEIGHT = 56

function CalendarNav() {
  const { calendarView, setCalendarView, goToToday, goForward, goBackward, currentDate } = useUIStore()

  const formatDateRange = () => {
    const d = currentDate
    if (calendarView === 'month') {
      return `${d.getFullYear()}年${d.getMonth() + 1}月`
    }
    if (calendarView === 'day') {
      return `${d.getMonth() + 1}月${d.getDate()}日`
    }
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    return `${weekStart.getFullYear()}年${weekStart.getMonth() + 1}月${weekStart.getDate()}日 — ${weekEnd.getMonth() + 1}月${weekEnd.getDate()}日`
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={goToToday}
          className="rounded-full border border-black/[0.08] px-3.5 py-1 text-[13px] font-medium text-[#1d1d1f] hover:bg-black/[0.03] active:bg-black/[0.06] transition-all duration-150 tracking-[-0.01em]"
        >
          今天
        </button>
        <div className="flex items-center">
          <button onClick={goBackward} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/[0.04] transition-colors text-[rgba(0,0,0,0.36)]">
            <ChevronLeft size={16} strokeWidth={1.5} />
          </button>
          <button onClick={goForward} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/[0.04] transition-colors text-[rgba(0,0,0,0.36)]">
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>
        </div>
        <span className="text-[15px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{formatDateRange()}</span>
      </div>

      <div className="flex items-center rounded-full bg-black/[0.04] p-0.5">
        {(['day', 'week', 'month'] as const).map((view) => (
          <button
            key={view}
            onClick={() => setCalendarView(view)}
            className={`rounded-full px-3 py-1 text-[12px] font-medium tracking-[-0.01em] transition-all duration-200 ${
              calendarView === view
                ? 'bg-white text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
                : 'text-[rgba(0,0,0,0.4)] hover:text-[#1d1d1f]'
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
    <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-black/[0.06]">
      <div />
      {days.map((d, i) => {
        const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
        return (
          <div key={i} className="flex flex-col items-center py-2.5">
            <span className={`text-[11px] tracking-[0.01em] ${isToday ? 'text-[#0071e3] font-semibold' : 'text-[rgba(0,0,0,0.36)]'}`}>
              {dayLabels[i]}
            </span>
            <span className={`mt-1 text-[18px] font-medium tracking-[-0.02em] w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
              isToday ? 'bg-[#0071e3] text-white shadow-[0_1px_4px_rgba(0,113,227,0.3)]' : 'text-[#1d1d1f]'
            }`}>
              {d.getDate()}
            </span>
          </div>
        )
      })}
    </div>
  )
}

interface EventBlockProps {
  event: CalendarEvent
  color: string
}

function EventBlock({ event, color }: EventBlockProps) {
  const startHour = event.startAt.getHours() + event.startAt.getMinutes() / 60
  const durationHours = (event.endAt.getTime() - event.startAt.getTime()) / 3600000

  const top = (startHour - 7) * HOUR_HEIGHT
  const height = Math.max(durationHours * HOUR_HEIGHT - 2, 26)

  const confirmSuggestion = useCalendarStore((s) => s.confirmSuggestion)
  const dismissSuggestion = useCalendarStore((s) => s.dismissSuggestion)

  const formatTime = (d: Date) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

  const isConfirmed = event.eventType === 'confirmed'
  const isSuggestion = event.eventType === 'suggestion'

  if (isSuggestion) {
    return (
      <div
        className="absolute left-0.5 right-0.5 rounded-lg px-2 py-1.5 text-[11px] font-medium overflow-hidden cursor-pointer group transition-all duration-200 hover:shadow-sm"
        style={{
          top: `${top}px`,
          height: `${height}px`,
          border: `1.5px dashed color-mix(in srgb, ${color} 40%, transparent)`,
          color: `color-mix(in srgb, ${color} 60%, transparent)`,
          backgroundColor: 'transparent',
        }}
      >
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="truncate leading-tight">{event.title}</div>
            {height >= 40 && (
              <div className="text-[10px] mt-0.5 opacity-70">
                {formatTime(event.startAt)} - {formatTime(event.endAt)}
              </div>
            )}
          </div>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); confirmSuggestion(event.id) }}
              className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-black/[0.06] transition-colors"
            >
              <Check size={12} style={{ color }} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); dismissSuggestion(event.id) }}
              className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-black/[0.06] transition-colors"
            >
              <X size={12} className="text-black/[0.36]" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (event.eventType === 'imported') {
    return (
      <div
        className="absolute left-0.5 right-0.5 rounded-lg px-2 py-1.5 text-[11px] font-medium overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-sm"
        style={{
          top: `${top}px`,
          height: `${height}px`,
          backgroundColor: '#f5f5f7',
          color: 'rgba(0,0,0,0.4)',
        }}
      >
        <div className="truncate leading-tight">{event.title}</div>
        {height >= 40 && (
          <div className="text-[10px] mt-0.5 opacity-70">
            {formatTime(event.startAt)} - {formatTime(event.endAt)}
          </div>
        )}
      </div>
    )
  }

  // Confirmed event
  return (
    <div
      className="absolute left-0.5 right-0.5 rounded-lg px-2 py-1.5 text-[11px] font-medium overflow-hidden cursor-pointer transition-all duration-200 hover:brightness-95"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
        borderLeft: `3px solid ${color}`,
        color,
      }}
    >
      <div className="truncate leading-tight">{'✓ '}{event.title}</div>
      {height >= 40 && (
        <div className="text-[10px] mt-0.5 opacity-60">
          {formatTime(event.startAt)} - {formatTime(event.endAt)}
        </div>
      )}
    </div>
  )
}

function CurrentTimeLine() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const hour = now.getHours()
  const min = now.getMinutes()

  if (hour < 7 || hour >= 24) return null

  const top = (hour - 7) * HOUR_HEIGHT + (min / 60) * HOUR_HEIGHT

  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top: `${top}px` }}
    >
      <div className="relative flex items-center">
        <div className="w-2 h-2 rounded-full bg-[#ff3b30] -ml-1" />
        <div className="flex-1 h-[1.5px] bg-[#ff3b30]" />
      </div>
    </div>
  )
}

function SuggestionPrompt() {
  const events = useCalendarStore((s) => s.events)
  const dimensions = useDimensionStore((s) => s.dimensions)
  const confirmSuggestion = useCalendarStore((s) => s.confirmSuggestion)
  const dismissSuggestion = useCalendarStore((s) => s.dismissSuggestion)

  const suggestion = events.find((e) => e.eventType === 'suggestion')
  if (!suggestion) return null

  const dim = dimensions.find((d) => d.id === suggestion.dimensionId)
  const color = dim?.color ?? '#86868b'

  const formatTime = (d: Date) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

  return (
    <div className="mx-5 mb-3">
      <div
        className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-[rgba(0,0,0,0.04)_0_1px_3px,rgba(0,0,0,0.08)_0_1px_2px]"
        style={{ borderLeft: `3px solid ${color}` }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-black/[0.36]" />
            <span className="text-[11px] text-black/[0.36] tracking-[-0.01em]">
              C 层建议
            </span>
          </div>
          <div className="text-[14px] font-medium text-[#1d1d1f] tracking-[-0.01em] truncate">
            {suggestion.title}
          </div>
          <div className="text-[12px] text-[rgba(0,0,0,0.48)] mt-0.5">
            {formatTime(suggestion.startAt)} - {formatTime(suggestion.endAt)}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => confirmSuggestion(suggestion.id)}
            className="rounded-full bg-[#0071e3] px-3.5 py-1.5 text-[12px] font-medium text-white hover:bg-[#0077ED] transition-colors"
          >
            接受
          </button>
          <button
            onClick={() => dismissSuggestion(suggestion.id)}
            className="rounded-full border border-black/[0.08] px-3.5 py-1.5 text-[12px] font-medium text-[rgba(0,0,0,0.48)] hover:text-[#1d1d1f] hover:border-black/[0.15] transition-all duration-150"
          >
            忽略
          </button>
          <button className="rounded-full border border-black/[0.08] px-3.5 py-1.5 text-[12px] font-medium text-[rgba(0,0,0,0.48)] hover:text-[#1d1d1f] hover:border-black/[0.15] transition-all duration-150">
            改时间
          </button>
        </div>
      </div>
    </div>
  )
}

function WeekGrid() {
  const currentDate = useUIStore((s) => s.currentDate)
  const events = useCalendarStore((s) => s.events)
  const dimensions = useDimensionStore((s) => s.dimensions)
  const activeDimensionId = useDimensionStore((s) => s.activeDimensionId)

  const weekStart = new Date(currentDate)
  weekStart.setDate(currentDate.getDate() - currentDate.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const inWeek = e.startAt >= weekStart && e.startAt < weekEnd
      const dimMatch = activeDimensionId === null || e.dimensionId === activeDimensionId
      return inWeek && dimMatch
    })
  }, [events, weekStart.getTime(), weekEnd.getTime(), activeDimensionId])

  const eventsByDay = useMemo(() => {
    const result: CalendarEvent[][] = Array.from({ length: 7 }, () => [])
    for (const ev of filteredEvents) {
      const dayIndex = ev.startAt.getDay()
      result[dayIndex].push(ev)
    }
    return result
  }, [filteredEvents])

  const today = new Date()
  const todayDayIndex = (() => {
    if (today >= weekStart && today < weekEnd) {
      return today.getDay()
    }
    return -1
  })()

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="grid grid-cols-[56px_repeat(7,1fr)] relative" style={{ height: `${17 * HOUR_HEIGHT}px` }}>
        {HOURS.map((hour) => (
          <div key={hour} className="contents">
            <div className="pr-2 flex items-start justify-end" style={{ height: `${HOUR_HEIGHT}px` }}>
              <span className="text-[10px] tabular-nums text-[rgba(0,0,0,0.25)] -mt-1.5 font-medium">
                {String(hour).padStart(2, '0')}:00
              </span>
            </div>
            {Array.from({ length: 7 }, (_, dayIndex) => (
              <div key={dayIndex} className="border-b border-l border-black/[0.04] hover:bg-[#0071e3]/[0.02] transition-colors cursor-pointer" style={{ height: `${HOUR_HEIGHT}px` }} />
            ))}
          </div>
        ))}

        {Array.from({ length: 7 }, (_, dayIndex) => {
          const dayEvents = eventsByDay[dayIndex]
          if (dayEvents.length === 0 && dayIndex !== todayDayIndex) return null
          return (
            <div
              key={`overlay-${dayIndex}`}
              className="absolute"
              style={{
                left: `calc(56px + ${dayIndex} * ((100% - 56px) / 7))`,
                width: `calc((100% - 56px) / 7)`,
                top: 0,
                bottom: 0,
              }}
            >
              {dayIndex === todayDayIndex && <CurrentTimeLine />}
              {dayEvents.map((ev) => {
                const dim = dimensions.find((d) => d.id === ev.dimensionId)
                const color = dim?.color ?? '#86868b'
                return (
                  <EventBlock
                    key={ev.id}
                    event={ev}
                    color={color}
                  />
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function CalendarPage() {
  return (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="px-5 pt-4 pb-3 space-y-3">
          <DimensionTabs />
          <CalendarNav />
        </div>
        <WeekHeader />
        <SuggestionPrompt />
        <WeekGrid />
      </main>
    </>
  )
}
