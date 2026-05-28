'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useCalendarStore } from '@/stores/calendar-store'
import { useDimensionStore } from '@/stores/dimension-store'
import { useBacklogStore } from '@/stores/backlog-store'
import { DimensionIcon } from '@/components/ui/dimension-icon'
import { ChevronDown } from 'lucide-react'

interface MiniCreateCardProps {
  day: Date
  startHour: number
  endHour: number
  anchorRect: {
    top: number
    left: number
    width: number
    height: number
    right: number
    bottom: number
  }
  onClose: () => void
}

function formatHour(hour: number): string {
  const h = Math.floor(hour)
  const m = Math.round((hour - h) * 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function MiniCreateCard({
  day,
  startHour,
  endHour,
  anchorRect,
  onClose,
}: MiniCreateCardProps) {
  const [title, setTitle] = useState('')
  const [selectedBacklogId, setSelectedBacklogId] = useState<string | null>(null)
  const [dimensionId, setDimensionId] = useState<string>('growth')
  const [showBacklogDropdown, setShowBacklogDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const addEvent = useCalendarStore((s) => s.addEvent)
  const dimensions = useDimensionStore((s) => s.dimensions)
  const backlogItems = useBacklogStore((s) => s.items)

  // Auto-focus input
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    // Delay to avoid the initial click triggering close
    const timer = setTimeout(() => {
      window.addEventListener('mousedown', handleClickOutside)
    }, 100)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  const handleBacklogSelect = useCallback((itemId: string) => {
    setSelectedBacklogId(itemId)
    const item = backlogItems.find((i) => i.id === itemId)
    if (item) {
      setTitle(item.title)
      setDimensionId(item.dimensionId)
    }
    setShowBacklogDropdown(false)
  }, [backlogItems])

  const handleCreate = useCallback(() => {
    if (!title.trim()) return

    const startAt = new Date(day)
    const startH = Math.floor(startHour)
    const startM = Math.round((startHour - startH) * 60)
    startAt.setHours(startH, startM, 0, 0)

    const endAt = new Date(day)
    const endH = Math.floor(endHour)
    const endM = Math.round((endHour - endH) * 60)
    endAt.setHours(endH, endM, 0, 0)

    addEvent({
      id: `evt-${Date.now()}`,
      dimensionId,
      backlogItemId: selectedBacklogId,
      title: title.trim(),
      startAt,
      endAt,
      eventType: 'suggestion',
    })

    onClose()
  }, [title, day, startHour, endHour, dimensionId, selectedBacklogId, addEvent, onClose])

  // Position: prefer right of anchor, fall back to left
  const CARD_WIDTH = 280
  const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1200
  const preferRight = anchorRect.right + CARD_WIDTH + 12 <= viewportW
  const cardLeft = preferRight
    ? anchorRect.right + 8
    : anchorRect.left - CARD_WIDTH - 8
  const cardTop = Math.max(8, Math.min(anchorRect.top, (typeof window !== 'undefined' ? window.innerHeight : 800) - 340))

  const dim = dimensions.find((d) => d.id === dimensionId)
  const color = dim?.color ?? '#86868b'

  return (
    <div className="fixed inset-0 z-50" style={{ pointerEvents: 'none' }}>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.95, x: preferRight ? -8 : 8 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-visible"
        style={{
          top: `${cardTop}px`,
          left: `${cardLeft}px`,
          width: `${CARD_WIDTH}px`,
          pointerEvents: 'auto',
        }}
      >
        <div className="p-3 space-y-2.5">
          {/* Time display */}
          <div className="flex items-center gap-1.5 text-[12px] text-[rgba(0,0,0,0.4)] font-medium">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            {formatHour(startHour)} - {formatHour(endHour)}
          </div>

          {/* Title input */}
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate()
            }}
            placeholder="添加主题..."
            className="w-full text-[14px] font-medium tracking-[-0.01em] text-[#1d1d1f] placeholder:text-[rgba(0,0,0,0.2)] outline-none border-none bg-transparent"
          />

          {/* Backlog item selector */}
          <div className="relative">
            <button
              onClick={() => setShowBacklogDropdown(!showBacklogDropdown)}
              className="flex items-center gap-1.5 text-[12px] text-[rgba(0,0,0,0.4)] hover:text-[#1d1d1f] transition-colors w-full rounded-md px-2 py-1.5 bg-black/[0.02] hover:bg-black/[0.04]"
            >
              <span className="truncate flex-1 text-left">
                {selectedBacklogId
                  ? backlogItems.find((i) => i.id === selectedBacklogId)?.title ?? '关联待办'
                  : '关联待办 (可选)'}
              </span>
              <ChevronDown size={12} className="shrink-0" />
            </button>

            {showBacklogDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-black/[0.06] max-h-[160px] overflow-y-auto z-10">
                <button
                  onClick={() => {
                    setSelectedBacklogId(null)
                    setShowBacklogDropdown(false)
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-[12px] text-[rgba(0,0,0,0.36)] hover:bg-black/[0.03] transition-colors"
                >
                  无关联
                </button>
                {backlogItems.map((item) => {
                  const itemDim = dimensions.find((d) => d.id === item.dimensionId)
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleBacklogSelect(item.id)}
                      className="w-full text-left px-2.5 py-1.5 text-[12px] text-[#1d1d1f] hover:bg-black/[0.03] transition-colors flex items-center gap-2"
                    >
                      {itemDim && (
                        <DimensionIcon
                          name={itemDim.icon}
                          size={11}
                          strokeWidth={1.5}
                          style={{ color: itemDim.color }}
                        />
                      )}
                      <span className="truncate">{item.title}</span>
                    </button>
                  )
                })}
              </div>
            )}
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

          {/* Create button */}
          <button
            onClick={handleCreate}
            disabled={!title.trim()}
            className="w-full rounded-lg py-1.5 text-[13px] font-medium text-white transition-all duration-200 hover:brightness-[0.95] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
            style={{ backgroundColor: color }}
          >
            创建
          </button>
        </div>
      </motion.div>
    </div>
  )
}
