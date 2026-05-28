'use client'

import { useCalendarStore } from '@/stores/calendar-store'
import { useDimensionStore } from '@/stores/dimension-store'
import { useBacklogStore } from '@/stores/backlog-store'
import { DimensionIcon } from '@/components/ui/dimension-icon'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Tag, Link2, Repeat } from 'lucide-react'
import { useState, useEffect } from 'react'

interface EventEditModalProps {
  eventId: string | null
  onClose: () => void
}

export function EventEditModal({ eventId, onClose }: EventEditModalProps) {
  const event = useCalendarStore((s) =>
    eventId ? s.events.find((e) => e.id === eventId) : null
  )
  const updateEvent = useCalendarStore((s) => s.updateEvent)
  const dimensions = useDimensionStore((s) => s.dimensions)
  const backlogItems = useBacklogStore((s) => s.items)

  const [title, setTitle] = useState('')
  const [dimensionId, setDimensionId] = useState('')

  // Sync local state when event changes
  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setDimensionId(event.dimensionId)
    }
  }, [event])

  if (!eventId || !event) return null

  const dim = dimensions.find((d) => d.id === (dimensionId || event.dimensionId))
  const color = dim?.color ?? '#86868b'

  const formatTime = (d: Date) =>
    `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  const formatDateFull = (d: Date) =>
    `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`

  const handleSave = () => {
    updateEvent(eventId, { title, dimensionId })
    onClose()
  }

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-[680px] max-h-[80vh] bg-white rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.16)] overflow-hidden flex"
        >
          {/* Left panel - Form */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="text-[11px] font-semibold tracking-[0.02em] uppercase text-[rgba(0,0,0,0.3)] mb-4">
              编辑日程
            </div>

            {/* Title */}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="添加主题"
              className="w-full text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f] placeholder:text-[rgba(0,0,0,0.2)] outline-none border-none bg-transparent mb-6"
            />

            <div className="space-y-4">
              {/* Dimension selector */}
              <div className="flex items-center gap-3">
                <Tag
                  size={16}
                  strokeWidth={1.5}
                  className="text-[rgba(0,0,0,0.3)] shrink-0"
                />
                <div className="flex gap-1.5">
                  {dimensions.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDimensionId(d.id)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-all duration-150 ${
                        dimensionId === d.id
                          ? 'text-white shadow-sm'
                          : 'text-[rgba(0,0,0,0.48)] bg-black/[0.03] hover:bg-black/[0.06]'
                      }`}
                      style={
                        dimensionId === d.id
                          ? { backgroundColor: d.color }
                          : undefined
                      }
                    >
                      <DimensionIcon
                        name={d.icon}
                        size={12}
                        strokeWidth={dimensionId === d.id ? 2 : 1.5}
                      />
                      {d.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-black/[0.06]" />

              {/* Date/Time */}
              <div className="flex items-center gap-3">
                <Clock
                  size={16}
                  strokeWidth={1.5}
                  className="text-[rgba(0,0,0,0.3)] shrink-0"
                />
                <div className="text-[14px] text-[#1d1d1f] tracking-[-0.01em]">
                  {formatDateFull(event.startAt)}{' '}
                  <span className="font-medium">
                    {formatTime(event.startAt)}
                  </span>
                  {' \u2014 '}
                  <span className="font-medium">
                    {formatTime(event.endAt)}
                  </span>
                  {' '}
                  {formatDateFull(event.endAt)}
                </div>
              </div>

              <div className="h-px bg-black/[0.06]" />

              {/* Repeat */}
              <div className="flex items-center gap-3">
                <Repeat
                  size={16}
                  strokeWidth={1.5}
                  className="text-[rgba(0,0,0,0.3)] shrink-0"
                />
                <span className="text-[14px] text-[rgba(0,0,0,0.48)]">
                  不重复
                </span>
              </div>

              {/* Backlog link */}
              {event.backlogItemId && (
                <>
                  <div className="h-px bg-black/[0.06]" />
                  <div className="flex items-center gap-3">
                    <Link2
                      size={16}
                      strokeWidth={1.5}
                      className="text-[rgba(0,0,0,0.3)] shrink-0"
                    />
                    <span className="text-[14px] text-[#0071e3]">
                      {backlogItems.find((i) => i.id === event.backlogItemId)
                        ?.title ?? '关联内容'}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                onClick={onClose}
                className="rounded-full px-5 py-2 text-[14px] font-medium text-[rgba(0,0,0,0.48)] hover:bg-black/[0.04] transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="rounded-full px-5 py-2 text-[14px] font-medium text-white transition-all duration-200 hover:brightness-[0.95] active:scale-[0.98]"
                style={{ backgroundColor: color }}
              >
                保存
              </button>
            </div>
          </div>

          {/* Right panel - Mini preview */}
          <div className="w-[260px] border-l border-black/[0.06] bg-[#fafafa] p-4">
            <div className="text-[11px] font-semibold tracking-[0.02em] uppercase text-[rgba(0,0,0,0.3)] mb-3">
              预览
            </div>
            <div className="text-[13px] font-medium text-[#1d1d1f] mb-2">
              {formatDateFull(event.startAt)}
            </div>
            <div className="space-y-1">
              {/* Simple preview of the event in context */}
              <div
                className="rounded-lg px-2.5 py-2 text-[12px] font-medium"
                style={{
                  backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
                  borderLeft: `3px solid ${color}`,
                  color: color,
                }}
              >
                <div className="truncate">{title || '(无主题)'}</div>
                <div className="text-[11px] opacity-60 mt-0.5">
                  {formatTime(event.startAt)} - {formatTime(event.endAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-[rgba(0,0,0,0.3)] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
