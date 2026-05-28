'use client'

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

interface EventPopoverProps {
  eventId: string
  onClose: () => void
  onOpenEdit?: (eventId: string) => void
}

export function EventPopover({
  eventId,
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -4 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden"
        >
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
