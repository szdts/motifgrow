'use client'

import { useRef, useEffect } from 'react'
import { useCalendarStore } from '@/stores/calendar-store'
import { useDimensionStore } from '@/stores/dimension-store'
import { useBacklogStore } from '@/stores/backlog-store'
import { DimensionIcon } from '@/components/ui/dimension-icon'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Pencil,
  Trash2,
  Check,
  SkipForward,
  RefreshCw,
  Clock,
} from 'lucide-react'

interface AnchorRect {
  top: number
  left: number
  width: number
  height: number
  right: number
  bottom: number
}

interface EventPopoverProps {
  eventId: string
  anchorRect?: AnchorRect | null
  onClose: () => void
  onOpenEdit?: (eventId: string) => void
}

const POPOVER_WIDTH = 320
const POPOVER_ARROW_SIZE = 8

export function EventPopover({
  eventId,
  anchorRect,
  onClose,
  onOpenEdit,
}: EventPopoverProps) {
  const event = useCalendarStore((s) =>
    s.events.find((e) => e.id === eventId)
  )
  const confirmSuggestion = useCalendarStore((s) => s.confirmSuggestion)
  const dismissSuggestion = useCalendarStore((s) => s.dismissSuggestion)
  const removeEvent = useCalendarStore((s) => s.removeEvent)
  const dimensions = useDimensionStore((s) => s.dimensions)
  const backlogItems = useBacklogStore((s) => s.items)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!event) return null

  const dim = dimensions.find((d) => d.id === event.dimensionId)
  const backlogItem = event.backlogItemId
    ? backlogItems.find((i) => i.id === event.backlogItemId)
    : null
  const color = dim?.color ?? '#86868b'

  const formatTime = (d: Date) =>
    `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  const formatDate = (d: Date) =>
    `${d.getMonth() + 1}月${d.getDate()}日`

  const handleConfirm = () => {
    confirmSuggestion(eventId)
    onClose()
  }
  const handleDismiss = () => {
    dismissSuggestion(eventId)
    onClose()
  }
  const handleDelete = () => {
    removeEvent(eventId)
    onClose()
  }

  // Position calculation: anchored to event, preferring right side
  const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1200
  const viewportH = typeof window !== 'undefined' ? window.innerHeight : 800

  let popoverLeft: number
  let popoverTop: number
  let arrowSide: 'left' | 'right' = 'left'

  if (anchorRect) {
    // Prefer placing to the right of the event
    const rightSpace = viewportW - anchorRect.right
    const leftSpace = anchorRect.left

    if (rightSpace >= POPOVER_WIDTH + 16) {
      popoverLeft = anchorRect.right + POPOVER_ARROW_SIZE + 4
      arrowSide = 'left'
    } else if (leftSpace >= POPOVER_WIDTH + 16) {
      popoverLeft = anchorRect.left - POPOVER_WIDTH - POPOVER_ARROW_SIZE - 4
      arrowSide = 'right'
    } else {
      // Fall back to right with scroll
      popoverLeft = anchorRect.right + POPOVER_ARROW_SIZE + 4
      arrowSide = 'left'
    }

    // Vertically center on the anchor, clamped to viewport
    const anchorCenterY = anchorRect.top + anchorRect.height / 2
    popoverTop = Math.max(8, Math.min(anchorCenterY - 80, viewportH - 400))
  } else {
    // Fallback: centered (legacy behavior for DayView calling without anchor)
    popoverLeft = viewportW / 2 - POPOVER_WIDTH / 2
    popoverTop = viewportH / 2 - 120
  }

  // Arrow Y position relative to popover
  const arrowTop = anchorRect
    ? Math.max(20, Math.min(anchorRect.top + anchorRect.height / 2 - popoverTop, 160))
    : 80

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50" onClick={onClose}>
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, scale: 0.95, x: arrowSide === 'left' ? -8 : 8 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.95, x: arrowSide === 'left' ? -8 : 8 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="absolute bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-visible"
          style={{
            left: `${popoverLeft}px`,
            top: `${popoverTop}px`,
            width: `${POPOVER_WIDTH}px`,
          }}
        >
          {/* Arrow */}
          {anchorRect && (
            <div
              className="absolute w-0 h-0"
              style={{
                top: `${arrowTop}px`,
                ...(arrowSide === 'left'
                  ? {
                      left: `-${POPOVER_ARROW_SIZE}px`,
                      borderTop: `${POPOVER_ARROW_SIZE}px solid transparent`,
                      borderBottom: `${POPOVER_ARROW_SIZE}px solid transparent`,
                      borderRight: `${POPOVER_ARROW_SIZE}px solid white`,
                    }
                  : {
                      right: `-${POPOVER_ARROW_SIZE}px`,
                      borderTop: `${POPOVER_ARROW_SIZE}px solid transparent`,
                      borderBottom: `${POPOVER_ARROW_SIZE}px solid transparent`,
                      borderLeft: `${POPOVER_ARROW_SIZE}px solid white`,
                    }),
              }}
            />
          )}

          {/* Header actions */}
          <div className="flex items-center justify-end gap-1 px-3 pt-3">
            {event.eventType === 'confirmed' && (
              <>
                <button
                  onClick={() => onOpenEdit?.(eventId)}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-[rgba(0,0,0,0.36)] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
                >
                  <Pencil size={14} strokeWidth={1.5} />
                </button>
                <button
                  onClick={handleDelete}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-[rgba(0,0,0,0.36)] hover:text-[#ff3b30] hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-md text-[rgba(0,0,0,0.36)] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>

          {/* Event info */}
          <div className="px-4 pb-4">
            <div className="flex items-start gap-2.5 mt-1">
              <div
                className="w-3 h-3 rounded-full mt-1 shrink-0"
                style={{ backgroundColor: color }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
                  {event.title}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-[13px] text-[rgba(0,0,0,0.48)]">
                  <Clock size={13} strokeWidth={1.5} />
                  <span>
                    {formatDate(event.startAt)} {formatTime(event.startAt)} -{' '}
                    {formatTime(event.endAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Dimension + Backlog info */}
            <div className="mt-3 space-y-2">
              {dim && (
                <div className="flex items-center gap-2 text-[12px] text-[rgba(0,0,0,0.36)]">
                  <DimensionIcon
                    name={dim.icon}
                    size={13}
                    strokeWidth={1.5}
                  />
                  <span>{dim.name}</span>
                </div>
              )}
              {backlogItem && (
                <div className="flex items-center gap-2 text-[12px] text-[rgba(0,0,0,0.36)]">
                  <span>
                    关联：{backlogItem.title}
                  </span>
                </div>
              )}
            </div>

            {/* Suggestion actions */}
            {event.eventType === 'suggestion' && (
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={handleConfirm}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-[13px] font-medium text-white transition-all duration-200 hover:brightness-[0.95] active:scale-[0.98]"
                  style={{ backgroundColor: color }}
                >
                  <Check size={14} strokeWidth={2} />
                  完成了
                </button>
                <button
                  onClick={handleDismiss}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-[13px] font-medium text-[rgba(0,0,0,0.48)] bg-black/[0.04] hover:bg-black/[0.06] transition-all duration-200 active:scale-[0.98]"
                >
                  <SkipForward size={14} strokeWidth={1.5} />
                  跳过
                </button>
                <button className="w-9 h-9 flex items-center justify-center rounded-full text-[rgba(0,0,0,0.36)] hover:bg-black/[0.04] transition-colors">
                  <RefreshCw size={14} strokeWidth={1.5} />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
