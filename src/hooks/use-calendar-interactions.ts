'use client'

import { useCallback, useRef, useState } from 'react'
import { useCalendarStore } from '@/stores/calendar-store'

// ---- Shared constants ----
const HOUR_HEIGHT = 56
const GRID_START_HOUR = 7
const SNAP_MINUTES = 15
const SINGLE_CLICK_DELAY = 250
const MIN_DRAG_DISTANCE = 4

// ---- Types ----
interface AnchorRect {
  top: number
  left: number
  width: number
  height: number
  right: number
  bottom: number
}

interface PopoverState {
  eventId: string
  anchorRect: AnchorRect
}

interface CreateCardState {
  day: Date
  startHour: number
  endHour: number
  anchorRect: AnchorRect
}

interface DragSelectionState {
  dayDate: Date
  dayIndex: number
  startHour: number
  endHour: number
}

interface ResizingState {
  eventId: string
  edge: 'top' | 'bottom'
  originalStartHour: number
  originalEndHour: number
  currentStartHour: number
  currentEndHour: number
}

interface MovingState {
  eventId: string
  originalStartAt: Date
  originalEndAt: Date
  durationMs: number
  offsetHour: number
  offsetDayPx: number
  currentDay: Date
  currentStartHour: number
}

export interface CalendarInteractionsReturn {
  // Event click/double-click
  handleEventClick: (eventId: string, e: React.MouseEvent) => void
  handleEventDoubleClick: (eventId: string) => void

  // Empty slot click
  handleSlotClick: (dayDate: Date, hour: number, e: React.MouseEvent) => void

  // Drag-to-create
  handleGridMouseDown: (dayDate: Date, dayIndex: number, startY: number, gridRect: AnchorRect) => void
  handleGridMouseMove: (currentY: number) => void
  handleGridMouseUp: (gridRect: AnchorRect) => void

  // Event resize
  handleResizeStart: (eventId: string, edge: 'top' | 'bottom', e: React.MouseEvent) => void
  handleResizeMove: (currentY: number) => void
  handleResizeEnd: () => void

  // Event move
  handleMoveStart: (eventId: string, e: React.MouseEvent, gridRect: AnchorRect) => void
  handleMoveMove: (clientX: number, clientY: number, gridRect: AnchorRect) => void
  handleMoveEnd: () => void

  // State
  popover: PopoverState | null
  editModalEventId: string | null
  createCard: CreateCardState | null
  dragSelection: DragSelectionState | null
  resizing: ResizingState | null
  moving: MovingState | null

  // Dismiss
  closePopover: () => void
  closeEditModal: () => void
  closeCreateCard: () => void
  closeDragSelection: () => void
}

function snapToQuarter(hour: number): number {
  return Math.round(hour * (60 / SNAP_MINUTES)) / (60 / SNAP_MINUTES)
}

function pixelToHour(pixelY: number): number {
  return GRID_START_HOUR + pixelY / HOUR_HEIGHT
}

function clampHour(hour: number): number {
  return Math.max(GRID_START_HOUR, Math.min(24, hour))
}

export function useCalendarInteractions(): CalendarInteractionsReturn {
  const updateEvent = useCalendarStore((s) => s.updateEvent)

  // ---- Popover (single-click on event) ----
  const [popover, setPopover] = useState<PopoverState | null>(null)
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ---- Edit modal (double-click on event) ----
  const [editModalEventId, setEditModalEventId] = useState<string | null>(null)

  // ---- Create card ----
  const [createCard, setCreateCard] = useState<CreateCardState | null>(null)

  // ---- Drag-to-create selection ----
  const [dragSelection, setDragSelection] = useState<DragSelectionState | null>(null)
  const isDraggingRef = useRef(false)
  const dragWasDraggingRef = useRef(false)
  const dragStartYRef = useRef(0)
  const dragDayDateRef = useRef<Date>(new Date())
  const dragDayIndexRef = useRef(0)
  const dragGridRectRef = useRef<AnchorRect | null>(null)

  // ---- Event resize ----
  const [resizing, setResizing] = useState<ResizingState | null>(null)
  const isResizingRef = useRef(false)
  const resizeEdgeRef = useRef<'top' | 'bottom'>('bottom')
  const resizeEventIdRef = useRef<string>('')
  const resizeStartYRef = useRef(0)
  const resizeOrigStartRef = useRef(0)
  const resizeOrigEndRef = useRef(0)

  // ---- Event move ----
  const [moving, setMoving] = useState<MovingState | null>(null)
  const isMovingRef = useRef(false)
  const moveEventIdRef = useRef<string>('')
  const moveStartClientRef = useRef({ x: 0, y: 0 })
  const moveOriginalRef = useRef({ startAt: new Date(), endAt: new Date(), durationMs: 0 })
  const moveOffsetRef = useRef({ hourOffset: 0, dayPxOffset: 0 })
  const movePendingRef = useRef(false)

  // ----- HANDLERS -----

  const closePopover = useCallback(() => setPopover(null), [])
  const closeEditModal = useCallback(() => setEditModalEventId(null), [])
  const closeCreateCard = useCallback(() => setCreateCard(null), [])
  const closeDragSelection = useCallback(() => setDragSelection(null), [])

  // --- Change 1 & 3: Event click (popover) vs double-click (edit modal) ---
  const handleEventClick = useCallback((eventId: string, e: React.MouseEvent) => {
    // Prevent if a drag/resize/move is in progress
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

    // Dismiss any open create card
    setCreateCard(null)

    // Start a single-click timer. If double-click fires within 250ms, it cancels this.
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current)
    }
    clickTimerRef.current = setTimeout(() => {
      setPopover({ eventId, anchorRect })
      clickTimerRef.current = null
    }, SINGLE_CLICK_DELAY)
  }, [])

  const handleEventDoubleClick = useCallback((eventId: string) => {
    // Cancel pending single-click popover
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current)
      clickTimerRef.current = null
    }
    setPopover(null)
    setEditModalEventId(eventId)
  }, [])

  // --- Change 2: Click empty slot -> mini create card ---
  const handleSlotClick = useCallback((dayDate: Date, hour: number, e: React.MouseEvent) => {
    if (isResizingRef.current || isMovingRef.current || isDraggingRef.current) return
    // Skip if a drag-to-create or move just happened (click fires after mouseup)
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
      day: dayDate,
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

  // --- Change 4: Drag on empty area -> select time range -> create ---
  const handleGridMouseDown = useCallback((dayDate: Date, dayIndex: number, startY: number, gridRect: AnchorRect) => {
    if (isResizingRef.current || isMovingRef.current) return

    isDraggingRef.current = false
    dragStartYRef.current = startY
    dragDayDateRef.current = dayDate
    dragDayIndexRef.current = dayIndex
    dragGridRectRef.current = gridRect
    movePendingRef.current = true
  }, [])

  const handleGridMouseMove = useCallback((currentY: number) => {
    if (!movePendingRef.current && !isDraggingRef.current) return
    if (isResizingRef.current || isMovingRef.current) return

    const delta = Math.abs(currentY - dragStartYRef.current)
    if (!isDraggingRef.current && delta < MIN_DRAG_DISTANCE) return

    isDraggingRef.current = true
    movePendingRef.current = false

    const startHour = clampHour(snapToQuarter(pixelToHour(dragStartYRef.current)))
    const endHour = clampHour(snapToQuarter(pixelToHour(currentY)))

    const actualStart = Math.min(startHour, endHour)
    const actualEnd = Math.max(startHour, endHour)
    const minEnd = actualStart + 0.5 // 30 min minimum

    setDragSelection({
      dayDate: dragDayDateRef.current,
      dayIndex: dragDayIndexRef.current,
      startHour: actualStart,
      endHour: Math.max(actualEnd, minEnd),
    })
  }, [])

  const handleGridMouseUp = useCallback((gridRect: AnchorRect) => {
    movePendingRef.current = false

    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    dragWasDraggingRef.current = true

    setDragSelection((prev) => {
      if (!prev) return null

      // Open create card with the selected range
      const top = (prev.startHour - GRID_START_HOUR) * HOUR_HEIGHT
      setCreateCard({
        day: prev.dayDate,
        startHour: prev.startHour,
        endHour: prev.endHour,
        anchorRect: {
          top: gridRect.top + top,
          left: gridRect.left,
          width: gridRect.width,
          height: (prev.endHour - prev.startHour) * HOUR_HEIGHT,
          right: gridRect.right,
          bottom: gridRect.top + top + (prev.endHour - prev.startHour) * HOUR_HEIGHT,
        },
      })

      return null
    })
  }, [])

  // --- Change 5: Drag event edge -> resize duration ---
  const handleResizeStart = useCallback((eventId: string, edge: 'top' | 'bottom', e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    const events = useCalendarStore.getState().events
    const event = events.find((ev) => ev.id === eventId)
    if (!event) return

    isResizingRef.current = true
    resizeEdgeRef.current = edge
    resizeEventIdRef.current = eventId
    resizeStartYRef.current = e.clientY

    const startHour = event.startAt.getHours() + event.startAt.getMinutes() / 60
    const endHour = event.endAt.getHours() + event.endAt.getMinutes() / 60
    resizeOrigStartRef.current = startHour
    resizeOrigEndRef.current = endHour

    setResizing({
      eventId,
      edge,
      originalStartHour: startHour,
      originalEndHour: endHour,
      currentStartHour: startHour,
      currentEndHour: endHour,
    })
  }, [])

  const handleResizeMove = useCallback((currentY: number) => {
    if (!isResizingRef.current) return

    const deltaY = currentY - resizeStartYRef.current
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
  }, [])

  const handleResizeEnd = useCallback(() => {
    if (!isResizingRef.current) return
    isResizingRef.current = false

    setResizing((prev) => {
      if (!prev) return null

      const events = useCalendarStore.getState().events
      const event = events.find((ev) => ev.id === prev.eventId)
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
  }, [updateEvent])

  // --- Change 6: Drag event body -> move to other time/day ---
  const handleMoveStart = useCallback((eventId: string, e: React.MouseEvent, gridRect: AnchorRect) => {
    e.stopPropagation()
    e.preventDefault()

    const events = useCalendarStore.getState().events
    const event = events.find((ev) => ev.id === eventId)
    if (!event) return

    isMovingRef.current = false // will activate after threshold
    movePendingRef.current = true
    moveEventIdRef.current = eventId
    moveStartClientRef.current = { x: e.clientX, y: e.clientY }

    const durationMs = event.endAt.getTime() - event.startAt.getTime()
    moveOriginalRef.current = {
      startAt: new Date(event.startAt),
      endAt: new Date(event.endAt),
      durationMs,
    }

    const startHour = event.startAt.getHours() + event.startAt.getMinutes() / 60
    // How far into the event did the user click?
    const eventTopPx = (startHour - GRID_START_HOUR) * HOUR_HEIGHT
    const clickYInGrid = e.clientY - gridRect.top
    const hourOffset = (clickYInGrid - eventTopPx) / HOUR_HEIGHT

    moveOffsetRef.current = { hourOffset, dayPxOffset: 0 }
  }, [])

  const handleMoveMove = useCallback((clientX: number, clientY: number, gridRect: AnchorRect) => {
    if (!movePendingRef.current && !isMovingRef.current) return

    const dx = clientX - moveStartClientRef.current.x
    const dy = clientY - moveStartClientRef.current.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (!isMovingRef.current && dist < MIN_DRAG_DISTANCE) return

    if (!isMovingRef.current) {
      isMovingRef.current = true
      movePendingRef.current = false
    }

    // Calculate what hour the mouse is at relative to grid
    const mouseYInGrid = clientY - gridRect.top
    const mouseHour = pixelToHour(mouseYInGrid) - moveOffsetRef.current.hourOffset
    const snappedHour = clampHour(snapToQuarter(mouseHour))

    // Calculate which day column the mouse is over
    const gridLeft = gridRect.left
    const gridWidth = gridRect.width
    const dayWidth = gridWidth / 7
    const mouseXInGrid = clientX - gridLeft
    const dayIndex = Math.max(0, Math.min(6, Math.floor(mouseXInGrid / dayWidth)))

    // Get the actual date for this day index
    const orig = moveOriginalRef.current.startAt
    const weekStart = new Date(orig)
    weekStart.setDate(orig.getDate() - orig.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const targetDay = new Date(weekStart)
    targetDay.setDate(weekStart.getDate() + dayIndex)

    const durationHours = moveOriginalRef.current.durationMs / 3600000
    const endHour = Math.min(snappedHour + durationHours, 24)
    const adjustedStart = endHour === 24 ? 24 - durationHours : snappedHour

    setMoving({
      eventId: moveEventIdRef.current,
      originalStartAt: moveOriginalRef.current.startAt,
      originalEndAt: moveOriginalRef.current.endAt,
      durationMs: moveOriginalRef.current.durationMs,
      offsetHour: moveOffsetRef.current.hourOffset,
      offsetDayPx: 0,
      currentDay: targetDay,
      currentStartHour: adjustedStart,
    })
  }, [])

  const handleMoveEnd = useCallback(() => {
    movePendingRef.current = false

    if (!isMovingRef.current) {
      isMovingRef.current = false
      setMoving(null)
      return
    }

    isMovingRef.current = false
    dragWasDraggingRef.current = true

    setMoving((prev) => {
      if (!prev) return null

      const newStart = new Date(prev.currentDay)
      const hours = Math.floor(prev.currentStartHour)
      const minutes = Math.round((prev.currentStartHour - hours) * 60)
      newStart.setHours(hours, minutes, 0, 0)

      const newEnd = new Date(newStart.getTime() + prev.durationMs)

      updateEvent(prev.eventId, { startAt: newStart, endAt: newEnd })

      return null
    })
  }, [updateEvent])

  return {
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
    popover,
    editModalEventId,
    createCard,
    dragSelection,
    resizing,
    moving,
    closePopover,
    closeEditModal,
    closeCreateCard,
    closeDragSelection,
  }
}
