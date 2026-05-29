'use client'

import { useMemo, useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from '@/components/layout/sidebar'
import { DimensionTabs } from '@/components/layout/dimension-tabs'
import { useUIStore } from '@/stores/ui-store'
import { useCalendarStore } from '@/stores/calendar-store'
import { useDimensionStore } from '@/stores/dimension-store'
import { ChevronLeft, ChevronRight, ChevronDown, Check, X, Clock, PanelLeftOpen, Plus } from 'lucide-react'
import { DatePickerPopover } from '@/components/calendar/date-picker-popover'
import { DayView } from '@/components/calendar/day-view'
import { MonthView } from '@/components/calendar/month-view'
import { EventPopover } from '@/components/calendar/event-popover'
import { EventEditModal } from '@/components/calendar/event-edit-modal'
import { MiniCreateCard } from '@/components/calendar/mini-create-card'
import { DimensionIcon } from '@/components/ui/dimension-icon'
import { useCalendarInteractions } from '@/hooks/use-calendar-interactions'
import type { CalendarEvent } from '@/types'

const HOURS = Array.from({ length: 24 }, (_, i) => i) // 00:00 - 23:00
const HOUR_HEIGHT = 56
const GRID_START_HOUR = 0

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
        <DatePickerPopover>
          <button className="flex items-center gap-1 text-[15px] font-semibold tracking-[-0.02em] text-[#1d1d1f] hover:bg-black/[0.03] rounded-lg px-2 py-1 transition-colors">
            {formatDateRange()}
            <ChevronDown size={14} strokeWidth={1.5} className="text-[rgba(0,0,0,0.3)]" />
          </button>
        </DatePickerPopover>
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

  const top = (hour - GRID_START_HOUR) * HOUR_HEIGHT + (min / 60) * HOUR_HEIGHT

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
  const [dismissed, setDismissed] = useState(false)
  const events = useCalendarStore((s) => s.events)
  const dimensions = useDimensionStore((s) => s.dimensions)
  const confirmSuggestion = useCalendarStore((s) => s.confirmSuggestion)
  const dismissSuggestion = useCalendarStore((s) => s.dismissSuggestion)

  const suggestion = events.find((e) => e.eventType === 'suggestion')
  const dim = suggestion ? dimensions.find((d) => d.id === suggestion.dimensionId) : null
  const color = dim?.color ?? '#86868b'

  const formatTime = (d: Date) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

  const isVisible = !!suggestion && !dismissed

  return (
    <AnimatePresence>
      {isVisible && suggestion && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-max max-w-[90%]"
        >
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
              <button
                onClick={() => setDismissed(true)}
                className="w-6 h-6 flex items-center justify-center rounded-full text-[rgba(0,0,0,0.3)] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
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
  const activeDimIds = useDimensionStore((s) => s.activeDimensionIds)
  const gridRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollContainerRef.current) {
      const now = new Date()
      const targetHour = Math.max(0, now.getHours() - 1)
      scrollContainerRef.current.scrollTop = targetHour * HOUR_HEIGHT
    }
  }, [])


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
      const dimMatch = activeDimIds.length === 0 || activeDimIds.includes(e.dimensionId)
      return inWeek && dimMatch
    })
  }, [events, weekStart.getTime(), weekEnd.getTime(), activeDimIds])

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

      // Event move: always call — function has internal movePendingRef guard
      // Must not gate on `moving` state, because handleMoveMove sets it
      handleMoveMove(e.clientX, e.clientY, {
        top: gridRect.top,
        left: gridRect.left + 56,
        width: gridRect.width - 56,
        height: gridRect.height,
        right: gridRect.right,
        bottom: gridRect.bottom,
      })
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (resizing) {
        handleResizeEnd()
      }
      // Always call — handleMoveEnd has internal guards
      handleMoveEnd()
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
  }, [resizing, handleResizeMove, handleResizeEnd, handleMoveEnd, handleMoveMove, handleGridMouseMove, handleGridMouseUp])

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
    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white">
        <WeekHeader />
      </div>
      <div
        ref={gridRef}
        className="grid grid-cols-[56px_repeat(7,1fr)] relative select-none"
        style={{ height: `${HOURS.length * HOUR_HEIGHT}px` }}
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

function QuickCreateModal({ onClose }: { onClose: () => void }) {
  const today = new Date()
  const [title, setTitle] = useState('')
  const [dimensionId, setDimensionId] = useState('growth')
  const [dateStr, setDateStr] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  )
  const [startHour, setStartHour] = useState(9)
  const [startMinute, setStartMinute] = useState(0)
  const [endHour, setEndHour] = useState(10)
  const [endMinute, setEndMinute] = useState(0)
  const [description, setDescription] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addEvent = useCalendarStore((s) => s.addEvent)
  const dimensions = useDimensionStore((s) => s.dimensions)

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const selectedDim = dimensions.find((d) => d.id === dimensionId)
  const selectedColor = selectedDim?.color ?? '#86868b'

  const handleSave = () => {
    if (!title.trim()) return
    const [y, m, d] = dateStr.split('-').map(Number)
    const startAt = new Date(y, m - 1, d, startHour, startMinute, 0, 0)
    const endAt = new Date(y, m - 1, d, endHour, endMinute, 0, 0)
    if (endAt <= startAt) return

    addEvent({
      id: `evt-${Date.now()}`,
      dimensionId,
      backlogItemId: null,
      title: title.trim(),
      startAt,
      endAt,
      eventType: 'confirmed',
    })
    onClose()
  }

  const hourOptions = Array.from({ length: 24 }, (_, i) => i)
  const minuteOptions = [0, 15, 30, 45]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      onClick={onClose}
    >
      <div
        className="w-[380px] rounded-xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-black/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 pb-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] text-[rgba(0,0,0,0.36)] tracking-[-0.01em]">新建日程</span>
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center rounded-full text-[rgba(0,0,0,0.3)] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>
          {/* Title input */}
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="添加主题"
            className="w-full text-[18px] font-semibold tracking-[-0.02em] text-[#1d1d1f] placeholder:text-[rgba(0,0,0,0.2)] outline-none mb-4"
            onKeyDown={(e) => { if (e.key === 'Enter' && title.trim()) handleSave() }}
          />
        </div>

        {/* Fields */}
        <div className="px-4 space-y-3 pb-4">
          {/* Date */}
          <div className="flex items-center gap-3 text-[13px] text-[rgba(0,0,0,0.56)]">
            <Clock size={15} strokeWidth={1.5} className="text-[rgba(0,0,0,0.3)] shrink-0" />
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="bg-transparent text-[#0071e3] font-medium outline-none cursor-pointer"
            />
          </div>

          {/* Time */}
          <div className="flex items-center gap-3 text-[13px] text-[rgba(0,0,0,0.56)]">
            <div className="w-[15px] shrink-0" />
            <div className="flex items-center gap-1.5">
              <select
                value={startHour}
                onChange={(e) => {
                  const h = Number(e.target.value)
                  setStartHour(h)
                  if (endHour < h || (endHour === h && endMinute <= startMinute)) {
                    setEndHour(Math.min(h + 1, 23))
                    setEndMinute(0)
                  }
                }}
                className="bg-transparent text-[#0071e3] font-medium outline-none cursor-pointer"
              >
                {hourOptions.map((h) => (
                  <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
                ))}
              </select>
              <span>:</span>
              <select
                value={startMinute}
                onChange={(e) => setStartMinute(Number(e.target.value))}
                className="bg-transparent text-[#0071e3] font-medium outline-none cursor-pointer"
              >
                {minuteOptions.map((m) => (
                  <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                ))}
              </select>
              <span className="mx-1 text-[rgba(0,0,0,0.3)]">—</span>
              <select
                value={endHour}
                onChange={(e) => setEndHour(Number(e.target.value))}
                className="bg-transparent text-[#0071e3] font-medium outline-none cursor-pointer"
              >
                {hourOptions.map((h) => (
                  <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
                ))}
              </select>
              <span>:</span>
              <select
                value={endMinute}
                onChange={(e) => setEndMinute(Number(e.target.value))}
                className="bg-transparent text-[#0071e3] font-medium outline-none cursor-pointer"
              >
                {minuteOptions.map((m) => (
                  <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dimension chips */}
          <div className="flex gap-1 flex-wrap">
            {dimensions.map((d) => (
              <button
                key={d.id}
                onClick={() => setDimensionId(d.id)}
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-all duration-150 ${
                  dimensionId === d.id
                    ? 'text-white shadow-sm'
                    : 'text-[rgba(0,0,0,0.36)] bg-black/[0.03] hover:bg-black/[0.06]'
                }`}
                style={
                  dimensionId === d.id ? { backgroundColor: d.color } : undefined
                }
              >
                <DimensionIcon
                  name={d.icon}
                  size={10}
                  strokeWidth={dimensionId === d.id ? 2 : 1.5}
                />
                {d.name}
              </button>
            ))}
          </div>

          {/* Description */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="添加描述 (可选)"
            rows={2}
            className="w-full text-[13px] text-[#1d1d1f] placeholder:text-[rgba(0,0,0,0.2)] outline-none resize-none rounded-lg bg-black/[0.02] px-3 py-2 border border-black/[0.04] focus:border-black/[0.1] transition-colors"
          />

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              className="rounded-full border border-black/[0.08] px-3.5 py-1.5 text-[12px] font-medium text-[rgba(0,0,0,0.48)] hover:text-[#1d1d1f] hover:border-black/[0.15] transition-all duration-150"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="rounded-full px-3.5 py-1.5 text-[12px] font-medium text-white transition-all duration-200 hover:brightness-[0.95] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
              style={{ backgroundColor: selectedColor }}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const calendarView = useUIStore((s) => s.calendarView)
  const interactions = useCalendarInteractions()
  const [showQuickCreate, setShowQuickCreate] = useState(false)

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

  const sidebarOpen = useUIStore((s) => s.sidebarOpen)

  return (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden bg-white relative">
        {!sidebarOpen && (
          <button
            onClick={() => useUIStore.getState().toggleSidebar()}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-10 flex items-center justify-center rounded-r-md bg-white border border-l-0 border-black/[0.06] text-[rgba(0,0,0,0.3)] hover:text-[#1d1d1f] hover:bg-black/[0.02] transition-all duration-200"
          >
            <PanelLeftOpen size={13} strokeWidth={1.5} />
          </button>
        )}
        <div className="px-5 pt-4 pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <DimensionTabs />
            <button
              onClick={() => setShowQuickCreate(true)}
              className="flex items-center gap-1.5 rounded-full bg-[#0071e3] px-3.5 py-1.5 text-[12px] font-medium text-white hover:bg-[#0077ED] transition-colors shadow-[0_1px_3px_rgba(0,113,227,0.3)]"
            >
              <Plus size={14} strokeWidth={2} />
              新建日程
            </button>
          </div>
          <CalendarNav />
        </div>
        <div className="relative flex-1 flex flex-col overflow-hidden">
          <SuggestionPrompt />
          {calendarView === 'day' && <DayView />}
          {calendarView === 'week' && <WeekGrid interactions={interactions} />}
          {calendarView === 'month' && <MonthView />}
        </div>
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
          onClose={() => { closeCreateCard(); interactions.clearDragSelection() }}
        />
      )}

      {/* Quick create modal from top-right button */}
      {showQuickCreate && (
        <QuickCreateModal onClose={() => setShowQuickCreate(false)} />
      )}
    </>
  )
}
