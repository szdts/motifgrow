'use client'

import { useMemo, useEffect, useState, useRef, useCallback } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { DimensionTabs } from '@/components/layout/dimension-tabs'
import { useUIStore } from '@/stores/ui-store'
import { useCalendarStore } from '@/stores/calendar-store'
import { useDimensionStore } from '@/stores/dimension-store'
import { ChevronLeft, ChevronRight, Check, X, Clock } from 'lucide-react'
import { DayView } from '@/components/calendar/day-view'
import { MonthView } from '@/components/calendar/month-view'
import { EventPopover } from '@/components/calendar/event-popover'
import { EventEditModal } from '@/components/calendar/event-edit-modal'
import { MiniCreateCard } from '@/components/calendar/mini-create-card'
import { useCalendarInteractions } from '@/hooks/use-calendar-interactions'
import type { CalendarEvent } from '@/types'

const HOURS = Array.from({ length: 17 }, (_, i) => i + 7) // 07:00 - 23:00
const HOUR_HEIGHT = 56
const GRID_START_HOUR = 7

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

// ---- Interactive Event Block with resize handles and move support ----
interface EventBlockProps {
  event: CalendarEvent
  color: string
  resizing: { eventId: string; edge: 'top' | 'bottom'; currentStartHour: number; currentEndHour: number } | null
  moving: { eventId: string; currentDay: Date; currentStartHour: number } | null
  onEventClick: (eventId: string, e: React.MouseEvent) => void
  onEventDoubleClick: (eventId: string) => void
  onResizeStart: (eventId: string, edge: 'top' | 'bottom', e: React.MouseEvent) => void
  onMoveStart: (eventId: string, e: React.MouseEvent) => void
}

function EventBlock({
  event,
  color,
  resizing,
  moving,
  onEventClick,
  onEventDoubleClick,
  onResizeStart,
  onMoveStart,
}: EventBlockProps) {
  const confirmSuggestion = useCalendarStore((s) => s.confirmSuggestion)
  const dismissSuggestion = useCalendarStore((s) => s.dismissSuggestion)

  // Determine visual position: use resizing/moving state if this event is being manipulated
  const isResizing = resizing?.eventId === event.id
  const isMoving = moving?.eventId === event.id

  let startHour: number
  let endHour: number

  if (isResizing) {
    startHour = resizing.currentStartHour
    endHour = resizing.currentEndHour
  } else if (isMoving) {
    startHour = moving.currentStartHour
    const durationHours = (event.endAt.getTime() - event.startAt.getTime()) / 3600000
    endHour = moving.currentStartHour + durationHours
  } else {
    startHour = event.startAt.getHours() + event.startAt.getMinutes() / 60
    endHour = event.endAt.getHours() + event.endAt.getMinutes() / 60
  }

  const top = (startHour - GRID_START_HOUR) * HOUR_HEIGHT
  const durationHours = endHour - startHour
  const height = Math.max(durationHours * HOUR_HEIGHT - 2, 26)

  const formatTime = (d: Date) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

  const handleClick = (e: React.MouseEvent) => {
    onEventClick(event.id, e)
  }

  const handleDoubleClick = () => {
    onEventDoubleClick(event.id)
  }

  const isConfirmed = event.eventType === 'confirmed'
  const isSuggestion = event.eventType === 'suggestion'

  // Opacity when being moved (ghost effect at original position is handled by the moving overlay)
  const opacity = isMoving ? 0.3 : 1

  const resizeHandleClasses = "absolute left-0 right-0 h-[8px] z-10 cursor-ns-resize"

  if (isSuggestion) {
    return (
      <div
        className={`absolute left-0.5 right-0.5 rounded-lg px-2 py-1.5 text-[11px] font-medium overflow-hidden group transition-all duration-200 hover:shadow-sm select-none ${isMoving ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{
          top: `${top}px`,
          height: `${height}px`,
          border: `1.5px dashed color-mix(in srgb, ${color} 40%, transparent)`,
          color: `color-mix(in srgb, ${color} 60%, transparent)`,
          backgroundColor: 'transparent',
          opacity,
        }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseDown={(e) => {
          // Prevent if clicking on suggestion buttons
          if ((e.target as HTMLElement).closest('button')) return
          onMoveStart(event.id, e)
        }}
      >
        {/* Resize handles */}
        <div
          className={`${resizeHandleClasses} top-0`}
          onMouseDown={(e) => onResizeStart(event.id, 'top', e)}
        />
        <div
          className={`${resizeHandleClasses} bottom-0`}
          onMouseDown={(e) => onResizeStart(event.id, 'bottom', e)}
        />

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
        className={`absolute left-0.5 right-0.5 rounded-lg px-2 py-1.5 text-[11px] font-medium overflow-hidden transition-all duration-200 hover:shadow-sm select-none ${isMoving ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{
          top: `${top}px`,
          height: `${height}px`,
          backgroundColor: '#f5f5f7',
          color: 'rgba(0,0,0,0.4)',
          opacity,
        }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseDown={(e) => onMoveStart(event.id, e)}
      >
        {/* Resize handles */}
        <div
          className={`${resizeHandleClasses} top-0`}
          onMouseDown={(e) => onResizeStart(event.id, 'top', e)}
        />
        <div
          className={`${resizeHandleClasses} bottom-0`}
          onMouseDown={(e) => onResizeStart(event.id, 'bottom', e)}
        />

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
      className={`absolute left-0.5 right-0.5 rounded-lg px-2 py-1.5 text-[11px] font-medium overflow-hidden transition-all duration-200 hover:brightness-95 select-none ${isMoving ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
        borderLeft: `3px solid ${color}`,
        color,
        opacity,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={(e) => onMoveStart(event.id, e)}
    >
      {/* Resize handles */}
      <div
        className={`${resizeHandleClasses} top-0`}
        onMouseDown={(e) => onResizeStart(event.id, 'top', e)}
      />
      <div
        className={`${resizeHandleClasses} bottom-0`}
        onMouseDown={(e) => onResizeStart(event.id, 'bottom', e)}
      />

      <div className="truncate leading-tight">{'\u2713 '}{event.title}</div>
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

// ---- WeekGrid with all 6 interactions ----
interface WeekGridProps {
  interactions: ReturnType<typeof useCalendarInteractions>
}

function WeekGrid({ interactions }: WeekGridProps) {
  const currentDate = useUIStore((s) => s.currentDate)
  const events = useCalendarStore((s) => s.events)
  const dimensions = useDimensionStore((s) => s.dimensions)
  const activeDimensionId = useDimensionStore((s) => s.activeDimensionId)
  const gridRef = useRef<HTMLDivElement>(null)

  const {
    handleEventClick,
    handleEventDoubleClick,
    handleSlotClick,
    handleGridMouseDown,
    handleGridMouseMove,
    handleGridMouseUp,
    handleResizeStart,
    handleResizeMove,
    handleResizeEnd,
    handleMoveStart,
    handleMoveMove,
    handleMoveEnd,
    dragSelection,
    resizing,
    moving,
  } = interactions

  const weekStart = new Date(currentDate)
  weekStart.setDate(currentDate.getDate() - currentDate.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      return d
    })
  }, [weekStart.getTime()])

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

  // Global mouse move/up for ALL drag operations (resize, move, drag-to-create)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const gridRect = gridRef.current?.getBoundingClientRect()
      if (!gridRect) return

      if (resizing) {
        handleResizeMove(e.clientY)
      }

      // Drag-to-create: relay to hook even when mouse is outside grid
      const yInGrid = e.clientY - gridRect.top
      handleGridMouseMove(yInGrid)

      if (moving) {
        handleMoveMove(e.clientX, e.clientY, {
          top: gridRect.top,
          left: gridRect.left + 56,
          width: gridRect.width - 56,
          height: gridRect.height,
          right: gridRect.right,
          bottom: gridRect.bottom,
        })
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (resizing) {
        handleResizeEnd()
      }
      if (moving) {
        handleMoveEnd()
      }
      // Drag-to-create: compute grid rect and finish
      const gridRect = gridRef.current?.getBoundingClientRect()
      if (gridRect) {
        const xInGrid = e.clientX - gridRect.left - 56
        const dayWidth = (gridRect.width - 56) / 7
        const dayIndex = Math.max(0, Math.min(6, Math.floor(xInGrid / dayWidth)))
        const dayLeft = gridRect.left + 56 + dayIndex * dayWidth
        handleGridMouseUp({
          top: gridRect.top,
          left: dayLeft,
          width: dayWidth,
          height: gridRect.height,
          right: dayLeft + dayWidth,
          bottom: gridRect.bottom,
        })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizing, moving, handleResizeMove, handleResizeEnd, handleMoveEnd, handleMoveMove, handleGridMouseMove, handleGridMouseUp])

  // Grid-level handlers are now handled by global window listeners above.
  // Only keep a noop to prevent React warnings on unused refs.

  // Handle move start wrapper to pass grid rect
  const handleMoveStartWrapper = useCallback((eventId: string, e: React.MouseEvent) => {
    const gridRect = gridRef.current?.getBoundingClientRect()
    if (!gridRect) return
    handleMoveStart(eventId, e, {
      top: gridRect.top,
      left: gridRect.left + 56,
      width: gridRect.width - 56,
      height: gridRect.height,
      right: gridRect.right,
      bottom: gridRect.bottom,
    })
  }, [handleMoveStart])

  return (
    <div className="flex-1 overflow-y-auto">
      <div
        ref={gridRef}
        className="grid grid-cols-[56px_repeat(7,1fr)] relative select-none"
        style={{ height: `${17 * HOUR_HEIGHT}px` }}
        onMouseLeave={() => {
          // No-op: global window handlers manage all drag operations
        }}
      >
        {HOURS.map((hour) => (
          <div key={hour} className="contents">
            <div className="pr-2 flex items-start justify-end" style={{ height: `${HOUR_HEIGHT}px` }}>
              <span className="text-[10px] tabular-nums text-[rgba(0,0,0,0.25)] -mt-1.5 font-medium">
                {String(hour).padStart(2, '0')}:00
              </span>
            </div>
            {Array.from({ length: 7 }, (_, dayIndex) => {
              const dayDate = weekDays[dayIndex]
              return (
                <div
                  key={dayIndex}
                  className="border-b border-l border-black/[0.04] hover:bg-[#0071e3]/[0.02] transition-colors cursor-pointer"
                  style={{ height: `${HOUR_HEIGHT}px` }}
                  onClick={(e) => {
                    // Only trigger slot click if not part of a drag
                    handleSlotClick(dayDate, hour, e)
                  }}
                  onMouseDown={(e) => {
                    // Prevent if clicking on an event
                    if ((e.target as HTMLElement).closest('[data-event-block]')) return
                    const gridRect = gridRef.current?.getBoundingClientRect()
                    if (!gridRect) return
                    const yInGrid = e.clientY - gridRect.top
                    handleGridMouseDown(dayDate, dayIndex, yInGrid, {
                      top: gridRect.top,
                      left: gridRect.left + 56 + dayIndex * ((gridRect.width - 56) / 7),
                      width: (gridRect.width - 56) / 7,
                      height: gridRect.height,
                      right: gridRect.left + 56 + (dayIndex + 1) * ((gridRect.width - 56) / 7),
                      bottom: gridRect.bottom,
                    })
                  }}
                />
              )
            })}
          </div>
        ))}

        {/* Drag selection overlay (Change 4) */}
        {dragSelection && (
          <div
            className="absolute pointer-events-none rounded-lg z-10"
            style={{
              left: `calc(56px + ${dragSelection.dayIndex} * ((100% - 56px) / 7) + 2px)`,
              width: `calc((100% - 56px) / 7 - 4px)`,
              top: `${(dragSelection.startHour - GRID_START_HOUR) * HOUR_HEIGHT}px`,
              height: `${(dragSelection.endHour - dragSelection.startHour) * HOUR_HEIGHT}px`,
              backgroundColor: 'rgba(0, 113, 227, 0.1)',
              border: '2px solid rgba(0, 113, 227, 0.3)',
            }}
          />
        )}

        {/* Moving event ghost (Change 6) */}
        {moving && (() => {
          const event = events.find((e) => e.id === moving.eventId)
          if (!event) return null
          const dim = dimensions.find((d) => d.id === event.dimensionId)
          const color = dim?.color ?? '#86868b'
          const durationHours = (event.endAt.getTime() - event.startAt.getTime()) / 3600000
          const moveDayIndex = moving.currentDay.getDay()

          return (
            <div
              className="absolute rounded-lg pointer-events-none z-30 transition-none"
              style={{
                left: `calc(56px + ${moveDayIndex} * ((100% - 56px) / 7) + 2px)`,
                width: `calc((100% - 56px) / 7 - 4px)`,
                top: `${(moving.currentStartHour - GRID_START_HOUR) * HOUR_HEIGHT}px`,
                height: `${Math.max(durationHours * HOUR_HEIGHT - 2, 26)}px`,
                backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`,
                borderLeft: `3px solid ${color}`,
                color,
                opacity: 0.85,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <div className="px-2 py-1.5 text-[11px] font-medium truncate">
                {event.title}
              </div>
            </div>
          )
        })()}

        {/* Event overlays */}
        {Array.from({ length: 7 }, (_, dayIndex) => {
          const dayEvents = eventsByDay[dayIndex]
          if (dayEvents.length === 0 && dayIndex !== todayDayIndex) return null
          return (
            <div
              key={`overlay-${dayIndex}`}
              className="absolute pointer-events-none"
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
                  <div key={ev.id} data-event-block className="pointer-events-auto">
                    <EventBlock
                      event={ev}
                      color={color}
                      resizing={resizing}
                      moving={moving}
                      onEventClick={handleEventClick}
                      onEventDoubleClick={handleEventDoubleClick}
                      onResizeStart={handleResizeStart}
                      onMoveStart={handleMoveStartWrapper}
                    />
                  </div>
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
  const calendarView = useUIStore((s) => s.calendarView)
  const interactions = useCalendarInteractions()

  const {
    popover,
    editModalEventId,
    createCard,
    closePopover,
    closeEditModal,
    closeCreateCard,
  } = interactions

  const handleOpenEdit = useCallback((eventId: string) => {
    closePopover()
    // Slight delay to let popover close animation finish
    setTimeout(() => {
      // We need to set the edit modal. Since interactions manages this state,
      // we trigger it through the double-click handler's mechanism.
      // Actually, just reuse the interaction hook: simulate double-click
      interactions.handleEventDoubleClick(eventId)
    }, 50)
  }, [closePopover, interactions])

  return (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        <div className="px-5 pt-4 pb-3 space-y-3">
          <DimensionTabs />
          <CalendarNav />
        </div>
        {calendarView === 'week' && <WeekHeader />}
        <SuggestionPrompt />
        {calendarView === 'day' && <DayView />}
        {calendarView === 'week' && <WeekGrid interactions={interactions} />}
        {calendarView === 'month' && <MonthView />}
      </main>

      {/* Anchored popover (Change 1) */}
      {popover && (
        <EventPopover
          eventId={popover.eventId}
          anchorRect={popover.anchorRect}
          onClose={closePopover}
          onOpenEdit={handleOpenEdit}
        />
      )}

      {/* Full edit modal (Change 3 - triggered by double-click) */}
      {editModalEventId && (
        <EventEditModal
          eventId={editModalEventId}
          onClose={closeEditModal}
        />
      )}

      {/* Mini create card (Change 2 & 4) */}
      {createCard && (
        <MiniCreateCard
          day={createCard.day}
          startHour={createCard.startHour}
          endHour={createCard.endHour}
          anchorRect={createCard.anchorRect}
          onClose={closeCreateCard}
        />
      )}
    </>
  )
}
