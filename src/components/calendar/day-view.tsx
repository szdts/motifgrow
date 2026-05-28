'use client'

import { useUIStore } from '@/stores/ui-store'
import { useCalendarStore } from '@/stores/calendar-store'
import { useDimensionStore } from '@/stores/dimension-store'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { EventPopover } from './event-popover'
import { EventEditModal } from './event-edit-modal'
import { MiniCreateCard } from './mini-create-card'
import { Check, X } from 'lucide-react'
import type { CalendarEvent } from '@/types'

const HOURS = Array.from({ length: 17 }, (_, i) => i + 7)
const HOUR_HEIGHT = 56
const GRID_START_HOUR = 7
const SNAP_MINUTES = 15
const SINGLE_CLICK_DELAY = 250
const MIN_DRAG_DISTANCE = 4

interface AnchorRect {
  top: number
  left: number
  width: number
  height: number
  right: number
  bottom: number
}

function snapToQuarter(hour: number): number {
  return Math.round(hour * (60 / SNAP_MINUTES)) / (60 / SNAP_MINUTES)
}

function clampHour(hour: number): number {
  return Math.max(GRID_START_HOUR, Math.min(24, hour))
}

function pixelToHour(pixelY: number): number {
  return GRID_START_HOUR + pixelY / HOUR_HEIGHT
}

function formatTime(d: Date): string {
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

// ---- DayView Event Block with resize handles and move support ----
interface DayEventBlockProps {
  event: CalendarEvent & { color: string; startHour: number; durationHours: number }
  resizing: {
    eventId: string
    edge: 'top' | 'bottom'
    currentStartHour: number
    currentEndHour: number
  } | null
  moving: {
    eventId: string
    currentStartHour: number
  } | null
  onEventClick: (eventId: string, e: React.MouseEvent) => void
  onEventDoubleClick: (eventId: string) => void
  onResizeStart: (eventId: string, edge: 'top' | 'bottom', e: React.MouseEvent) => void
  onMoveStart: (eventId: string, e: React.MouseEvent) => void
}

function DayEventBlock({
  event,
  resizing,
  moving,
  onEventClick,
  onEventDoubleClick,
  onResizeStart,
  onMoveStart,
}: DayEventBlockProps) {
  const confirmSuggestion = useCalendarStore((s) => s.confirmSuggestion)
  const dismissSuggestion = useCalendarStore((s) => s.dismissSuggestion)

  const isResizing = resizing?.eventId === event.id
  const isMoving = moving?.eventId === event.id

  let displayStartHour = event.startHour
  let displayEndHour = event.startHour + event.durationHours

  if (isResizing && resizing) {
    displayStartHour = resizing.currentStartHour
    displayEndHour = resizing.currentEndHour
  } else if (isMoving && moving) {
    displayStartHour = moving.currentStartHour
    displayEndHour = moving.currentStartHour + event.durationHours
  }

  const top = (displayStartHour - GRID_START_HOUR) * HOUR_HEIGHT
  const height = Math.max((displayEndHour - displayStartHour) * HOUR_HEIGHT - 2, 26)
  const isConfirmed = event.eventType === 'confirmed'
  const isSuggestion = event.eventType === 'suggestion'
  const opacity = isMoving ? 0.3 : 1

  const resizeHandleClasses = 'absolute left-0 right-0 h-[8px] z-10 cursor-ns-resize'

  return (
    <div
      data-event-block
      className="absolute select-none"
      style={{
        left: '56px',
        right: '8px',
        top: `${top}px`,
        height: `${height}px`,
        opacity,
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

      <div
        className={`h-full rounded-lg px-3 py-2 text-[13px] font-medium overflow-hidden transition-all duration-200 hover:brightness-[0.97] ${
          isMoving ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={
          isConfirmed
            ? {
                backgroundColor: `color-mix(in srgb, ${event.color} 12%, transparent)`,
                borderLeft: `3px solid ${event.color}`,
                color: event.color,
              }
            : isSuggestion
              ? {
                  border: `1.5px dashed color-mix(in srgb, ${event.color} 40%, transparent)`,
                  color: `color-mix(in srgb, ${event.color} 60%, transparent)`,
                }
              : {
                  backgroundColor: '#f5f5f7',
                  color: 'rgba(0,0,0,0.4)',
                }
        }
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('button')) return
          onEventClick(event.id, e)
        }}
        onDoubleClick={() => onEventDoubleClick(event.id)}
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).closest('button')) return
          // Only start move if not on a resize handle
          const target = e.target as HTMLElement
          if (target.classList.contains('cursor-ns-resize')) return
          onMoveStart(event.id, e)
        }}
      >
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="truncate">
              {isConfirmed && '\u2713 '}
              {event.title}
            </div>
            {height >= 40 && (
              <div className="text-[11px] opacity-70 mt-0.5">
                {formatTime(event.startAt)} - {formatTime(event.endAt)}
              </div>
            )}
          </div>
          {isSuggestion && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); confirmSuggestion(event.id) }}
                className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-black/[0.06] transition-colors"
              >
                <Check size={12} style={{ color: event.color }} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); dismissSuggestion(event.id) }}
                className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-black/[0.06] transition-colors"
              >
                <X size={12} className="text-black/[0.36]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function DayView() {
  const currentDate = useUIStore((s) => s.currentDate)
  const events = useCalendarStore((s) => s.events)
  const updateEvent = useCalendarStore((s) => s.updateEvent)
  const dimensions = useDimensionStore((s) => s.dimensions)
  const activeDim = useDimensionStore((s) => s.activeDimensionId)

  const [now, setNow] = useState(new Date())
  const gridRef = useRef<HTMLDivElement>(null)

  // Interaction state
  const [popover, setPopover] = useState<{ eventId: string; anchorRect: AnchorRect } | null>(null)
  const [editModalEventId, setEditModalEventId] = useState<string | null>(null)
  const [createCard, setCreateCard] = useState<{ startHour: number; endHour: number; anchorRect: AnchorRect } | null>(null)
  const [dragSelection, setDragSelection] = useState<{ startHour: number; endHour: number } | null>(null)
  const [resizing, setResizing] = useState<{
    eventId: string
    edge: 'top' | 'bottom'
    originalStartHour: number
    originalEndHour: number
    currentStartHour: number
    currentEndHour: number
  } | null>(null)
  const [moving, setMoving] = useState<{
    eventId: string
    durationHours: number
    offsetHour: number
    currentStartHour: number
  } | null>(null)

  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDraggingRef = useRef(false)
  const dragStartYRef = useRef(0)
  const dragPendingRef = useRef(false)
  const dragWasDraggingRef = useRef(false)

  const isResizingRef = useRef(false)
  const resizeEdgeRef = useRef<'top' | 'bottom'>('bottom')
  const resizeStartYRef = useRef(0)

  const isMovingRef = useRef(false)
  const movePendingRef = useRef(false)
  const moveStartClientRef = useRef({ x: 0, y: 0 })
  const moveOriginalStartHourRef = useRef(0)
  const moveDurationHoursRef = useRef(0)
  const moveOffsetHourRef = useRef(0)
  const moveEventIdRef = useRef('')

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const isToday = currentDate.toDateString() === now.toDateString()

  const dayStart = new Date(currentDate)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(dayStart)
  dayEnd.setDate(dayStart.getDate() + 1)

  const dayEvents = useMemo(() => {
    return events
      .filter((e) => e.startAt >= dayStart && e.startAt < dayEnd)
      .filter((e) => !activeDim || e.dimensionId === activeDim)
      .map((e) => {
        const dim = dimensions.find((d) => d.id === e.dimensionId)
        return {
          ...e,
          color: dim?.color ?? '#86868b',
          startHour: e.startAt.getHours() + e.startAt.getMinutes() / 60,
          durationHours: (e.endAt.getTime() - e.startAt.getTime()) / 3600000,
        }
      })
  }, [events, dayStart.getTime(), dayEnd.getTime(), activeDim, dimensions])

  const nowHour = now.getHours() + now.getMinutes() / 60
  const nowTop = (nowHour - 7) * HOUR_HEIGHT

  // Event click/double-click
  const handleEventClick = useCallback((eventId: string, e: React.MouseEvent) => {
    if (isResizingRef.current || isMovingRef.current || isDraggingRef.current) return

    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const anchorRect: AnchorRect = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      right: rect.right,
      bottom: rect.bottom,
    }

    setCreateCard(null)

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current)
    }
    clickTimerRef.current = setTimeout(() => {
      setPopover({ eventId, anchorRect })
      clickTimerRef.current = null
    }, SINGLE_CLICK_DELAY)
  }, [])

  const handleEventDoubleClick = useCallback((eventId: string) => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current)
      clickTimerRef.current = null
    }
    setPopover(null)
    setEditModalEventId(eventId)
  }, [])

  // Slot click
  const handleSlotClick = useCallback((hour: number, e: React.MouseEvent) => {
    if (isResizingRef.current || isMovingRef.current) return
    // Skip if a drag-to-create just happened
    if (dragWasDraggingRef.current) {
      dragWasDraggingRef.current = false
      return
    }

    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const clickYInSlot = e.clientY - rect.top
    const minuteOffset = Math.floor((clickYInSlot / HOUR_HEIGHT) * 60)
    const snappedMinuteOffset = Math.floor(minuteOffset / SNAP_MINUTES) * SNAP_MINUTES
    const startHour = hour + snappedMinuteOffset / 60
    const endHour = Math.min(startHour + 1, 24)

    setPopover(null)
    setCreateCard({
      startHour,
      endHour,
      anchorRect: {
        top: rect.top + (snappedMinuteOffset / 60) * HOUR_HEIGHT,
        left: rect.left,
        width: rect.width,
        height: HOUR_HEIGHT,
        right: rect.right,
        bottom: rect.top + ((snappedMinuteOffset + 60) / 60) * HOUR_HEIGHT,
      },
    })
  }, [])

  // Drag to create
  const handleGridMouseDown = useCallback((hour: number, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-event-block]')) return
    if (isResizingRef.current || isMovingRef.current) return

    const gridRect = gridRef.current?.getBoundingClientRect()
    if (!gridRect) return

    dragStartYRef.current = e.clientY - gridRect.top
    dragPendingRef.current = true
    isDraggingRef.current = false
  }, [])

  // Resize start
  const handleResizeStart = useCallback((eventId: string, edge: 'top' | 'bottom', e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    const allEvents = useCalendarStore.getState().events
    const event = allEvents.find((ev) => ev.id === eventId)
    if (!event) return

    isResizingRef.current = true
    resizeEdgeRef.current = edge
    resizeStartYRef.current = e.clientY

    const startHour = event.startAt.getHours() + event.startAt.getMinutes() / 60
    const endHour = event.endAt.getHours() + event.endAt.getMinutes() / 60

    setResizing({
      eventId,
      edge,
      originalStartHour: startHour,
      originalEndHour: endHour,
      currentStartHour: startHour,
      currentEndHour: endHour,
    })
  }, [])

  // Move start
  const handleMoveStart = useCallback((eventId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    const allEvents = useCalendarStore.getState().events
    const event = allEvents.find((ev) => ev.id === eventId)
    if (!event) return

    const gridRect = gridRef.current?.getBoundingClientRect()
    if (!gridRect) return

    isMovingRef.current = false
    movePendingRef.current = true
    moveEventIdRef.current = eventId
    moveStartClientRef.current = { x: e.clientX, y: e.clientY }

    const startHour = event.startAt.getHours() + event.startAt.getMinutes() / 60
    const durationHours = (event.endAt.getTime() - event.startAt.getTime()) / 3600000
    moveOriginalStartHourRef.current = startHour
    moveDurationHoursRef.current = durationHours

    // How far into the event did the user click
    const eventTopPx = (startHour - GRID_START_HOUR) * HOUR_HEIGHT
    const clickYInGrid = e.clientY - gridRect.top
    moveOffsetHourRef.current = (clickYInGrid - eventTopPx) / HOUR_HEIGHT
  }, [])

  // Global mouse move/up for resize, move, and drag-to-create
  const handleGridMouseMove = useCallback((e: React.MouseEvent) => {
    const gridRect = gridRef.current?.getBoundingClientRect()
    if (!gridRect) return

    // Handle resize
    if (isResizingRef.current && resizing) {
      const deltaY = e.clientY - resizeStartYRef.current
      const deltaHours = deltaY / HOUR_HEIGHT

      setResizing((prev) => {
        if (!prev) return null
        if (resizeEdgeRef.current === 'bottom') {
          const newEnd = clampHour(snapToQuarter(prev.originalEndHour + deltaHours))
          const minEnd = prev.currentStartHour + SNAP_MINUTES / 60
          return { ...prev, currentEndHour: Math.max(newEnd, minEnd) }
        } else {
          const newStart = clampHour(snapToQuarter(prev.originalStartHour + deltaHours))
          const maxStart = prev.currentEndHour - SNAP_MINUTES / 60
          return { ...prev, currentStartHour: Math.min(newStart, maxStart) }
        }
      })
      return
    }

    // Handle move
    if (movePendingRef.current || isMovingRef.current) {
      const dx = e.clientX - moveStartClientRef.current.x
      const dy = e.clientY - moveStartClientRef.current.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (!isMovingRef.current && dist < MIN_DRAG_DISTANCE) return

      if (!isMovingRef.current) {
        isMovingRef.current = true
        movePendingRef.current = false
      }

      const mouseYInGrid = e.clientY - gridRect.top
      const mouseHour = pixelToHour(mouseYInGrid) - moveOffsetHourRef.current
      const snappedHour = clampHour(snapToQuarter(mouseHour))

      const endHour = Math.min(snappedHour + moveDurationHoursRef.current, 24)
      const adjustedStart = endHour === 24 ? 24 - moveDurationHoursRef.current : snappedHour

      setMoving({
        eventId: moveEventIdRef.current,
        durationHours: moveDurationHoursRef.current,
        offsetHour: moveOffsetHourRef.current,
        currentStartHour: adjustedStart,
      })
      return
    }

    // Handle drag to create
    if (!dragPendingRef.current && !isDraggingRef.current) return

    const yInGrid = e.clientY - gridRect.top
    const delta = Math.abs(yInGrid - dragStartYRef.current)
    if (!isDraggingRef.current && delta < MIN_DRAG_DISTANCE) return

    isDraggingRef.current = true
    dragPendingRef.current = false

    const startHour = clampHour(snapToQuarter(pixelToHour(dragStartYRef.current)))
    const endHour = clampHour(snapToQuarter(pixelToHour(yInGrid)))

    const actualStart = Math.min(startHour, endHour)
    const actualEnd = Math.max(startHour, endHour)
    const minEnd = actualStart + 0.5

    setDragSelection({
      startHour: actualStart,
      endHour: Math.max(actualEnd, minEnd),
    })
  }, [resizing])

  const handleGridMouseUp = useCallback((e: React.MouseEvent) => {
    // Handle resize end
    if (isResizingRef.current) {
      isResizingRef.current = false

      setResizing((prev) => {
        if (!prev) return null

        const allEvents = useCalendarStore.getState().events
        const event = allEvents.find((ev) => ev.id === prev.eventId)
        if (!event) return null

        if (resizeEdgeRef.current === 'bottom') {
          const newEnd = new Date(event.endAt)
          const hours = Math.floor(prev.currentEndHour)
          const minutes = Math.round((prev.currentEndHour - hours) * 60)
          newEnd.setHours(hours, minutes, 0, 0)
          updateEvent(prev.eventId, { endAt: newEnd })
        } else {
          const newStart = new Date(event.startAt)
          const hours = Math.floor(prev.currentStartHour)
          const minutes = Math.round((prev.currentStartHour - hours) * 60)
          newStart.setHours(hours, minutes, 0, 0)
          updateEvent(prev.eventId, { startAt: newStart })
        }

        return null
      })
      return
    }

    // Handle move end
    if (isMovingRef.current) {
      isMovingRef.current = false
      movePendingRef.current = false

      setMoving((prev) => {
        if (!prev) return null

        const allEvents = useCalendarStore.getState().events
        const event = allEvents.find((ev) => ev.id === prev.eventId)
        if (!event) return null

        const newStart = new Date(currentDate)
        const hours = Math.floor(prev.currentStartHour)
        const minutes = Math.round((prev.currentStartHour - hours) * 60)
        newStart.setHours(hours, minutes, 0, 0)

        const durationMs = event.endAt.getTime() - event.startAt.getTime()
        const newEnd = new Date(newStart.getTime() + durationMs)

        updateEvent(prev.eventId, { startAt: newStart, endAt: newEnd })

        return null
      })
      return
    }

    // Handle move pending cancel (click without drag)
    if (movePendingRef.current) {
      movePendingRef.current = false
      isMovingRef.current = false
      return
    }

    // Handle drag-to-create end
    dragPendingRef.current = false

    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    dragWasDraggingRef.current = true

    const gridRect = gridRef.current?.getBoundingClientRect()
    if (!gridRect) return

    setDragSelection((prev) => {
      if (!prev) return null

      const top = (prev.startHour - GRID_START_HOUR) * HOUR_HEIGHT
      setCreateCard({
        startHour: prev.startHour,
        endHour: prev.endHour,
        anchorRect: {
          top: gridRect.top + top,
          left: gridRect.left + 56,
          width: gridRect.width - 56,
          height: (prev.endHour - prev.startHour) * HOUR_HEIGHT,
          right: gridRect.right,
          bottom: gridRect.top + top + (prev.endHour - prev.startHour) * HOUR_HEIGHT,
        },
      })

      return null
    })
  }, [updateEvent, currentDate])

  // Global window listeners for operations that might go outside grid
  useEffect(() => {
    const handleWindowMouseUp = () => {
      if (isResizingRef.current) {
        isResizingRef.current = false
        setResizing((prev) => {
          if (!prev) return null
          const allEvents = useCalendarStore.getState().events
          const event = allEvents.find((ev) => ev.id === prev.eventId)
          if (!event) return null

          if (resizeEdgeRef.current === 'bottom') {
            const newEnd = new Date(event.endAt)
            const hours = Math.floor(prev.currentEndHour)
            const minutes = Math.round((prev.currentEndHour - hours) * 60)
            newEnd.setHours(hours, minutes, 0, 0)
            updateEvent(prev.eventId, { endAt: newEnd })
          } else {
            const newStart = new Date(event.startAt)
            const hours = Math.floor(prev.currentStartHour)
            const minutes = Math.round((prev.currentStartHour - hours) * 60)
            newStart.setHours(hours, minutes, 0, 0)
            updateEvent(prev.eventId, { startAt: newStart })
          }
          return null
        })
      }
      if (isMovingRef.current) {
        isMovingRef.current = false
        movePendingRef.current = false
        setMoving(null)
      }
    }

    window.addEventListener('mouseup', handleWindowMouseUp)
    return () => window.removeEventListener('mouseup', handleWindowMouseUp)
  }, [updateEvent])

  const handleOpenEdit = useCallback((eventId: string) => {
    setPopover(null)
    setTimeout(() => setEditModalEventId(eventId), 50)
  }, [])

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Time grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-[56px_1fr] relative select-none"
        style={{ height: `${17 * HOUR_HEIGHT}px` }}
        onMouseMove={handleGridMouseMove}
        onMouseUp={handleGridMouseUp}
      >
        {HOURS.map((hour) => (
          <div key={hour} className="contents">
            <div className="h-14 pr-2 flex items-start justify-end">
              <span className="text-[10px] tabular-nums text-[rgba(0,0,0,0.25)] -mt-1.5 font-medium">
                {String(hour).padStart(2, '0')}:00
              </span>
            </div>
            <div
              className="h-14 border-b border-black/[0.04] hover:bg-[#0071e3]/[0.02] transition-colors cursor-pointer"
              onClick={(e) => handleSlotClick(hour, e)}
              onMouseDown={(e) => handleGridMouseDown(hour, e)}
            />
          </div>
        ))}

        {/* Drag selection overlay */}
        {dragSelection && (
          <div
            className="absolute pointer-events-none rounded-lg z-10"
            style={{
              left: '58px',
              right: '8px',
              top: `${(dragSelection.startHour - GRID_START_HOUR) * HOUR_HEIGHT}px`,
              height: `${(dragSelection.endHour - dragSelection.startHour) * HOUR_HEIGHT}px`,
              backgroundColor: 'rgba(0, 113, 227, 0.1)',
              border: '2px solid rgba(0, 113, 227, 0.3)',
            }}
          />
        )}

        {/* Moving event ghost */}
        {moving && (() => {
          const event = dayEvents.find((e) => e.id === moving.eventId)
          if (!event) return null
          const ghostTop = (moving.currentStartHour - GRID_START_HOUR) * HOUR_HEIGHT
          const ghostHeight = Math.max(moving.durationHours * HOUR_HEIGHT - 2, 26)

          return (
            <div
              className="absolute rounded-lg pointer-events-none z-30"
              style={{
                left: '58px',
                right: '8px',
                top: `${ghostTop}px`,
                height: `${ghostHeight}px`,
                backgroundColor: `color-mix(in srgb, ${event.color} 18%, transparent)`,
                borderLeft: `3px solid ${event.color}`,
                color: event.color,
                opacity: 0.85,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <div className="px-3 py-2 text-[13px] font-medium truncate">
                {event.title}
              </div>
            </div>
          )
        })()}

        {/* Events */}
        {dayEvents.map((event) => (
          <DayEventBlock
            key={event.id}
            event={event}
            resizing={resizing ? { eventId: resizing.eventId, edge: resizing.edge, currentStartHour: resizing.currentStartHour, currentEndHour: resizing.currentEndHour } : null}
            moving={moving ? { eventId: moving.eventId, currentStartHour: moving.currentStartHour } : null}
            onEventClick={handleEventClick}
            onEventDoubleClick={handleEventDoubleClick}
            onResizeStart={handleResizeStart}
            onMoveStart={handleMoveStart}
          />
        ))}

        {/* Current time line */}
        {isToday && nowTop > 0 && nowTop < 17 * HOUR_HEIGHT && (
          <div
            className="absolute left-14 right-0 flex items-center z-10 pointer-events-none"
            style={{ top: `${nowTop}px` }}
          >
            <div className="w-2 h-2 rounded-full bg-[#ff3b30] -ml-1" />
            <div className="flex-1 h-[1.5px] bg-[#ff3b30]" />
          </div>
        )}
      </div>

      {/* Popover */}
      {popover && (
        <EventPopover
          eventId={popover.eventId}
          anchorRect={popover.anchorRect}
          onClose={() => setPopover(null)}
          onOpenEdit={handleOpenEdit}
        />
      )}

      {/* Edit modal */}
      {editModalEventId && (
        <EventEditModal
          eventId={editModalEventId}
          onClose={() => setEditModalEventId(null)}
        />
      )}

      {/* Create card */}
      {createCard && (
        <MiniCreateCard
          day={currentDate}
          startHour={createCard.startHour}
          endHour={createCard.endHour}
          anchorRect={createCard.anchorRect}
          onClose={() => setCreateCard(null)}
        />
      )}
    </div>
  )
}
