'use client'

import { useUIStore } from '@/stores/ui-store'
import { useCalendarStore } from '@/stores/calendar-store'
import { useDimensionStore } from '@/stores/dimension-store'
import { useMemo, useState, useEffect, useRef } from 'react'
import { X, Clock, FileText } from 'lucide-react'

interface MonthCell {
  date: Date
  isCurrentMonth: boolean
}

export function MonthView() {
  const currentDate = useUIStore((s) => s.currentDate)
  const events = useCalendarStore((s) => s.events)
  const dimensions = useDimensionStore((s) => s.dimensions)
  const activeDimIds = useDimensionStore((s) => s.activeDimensionIds)

  const today = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const startDay = firstDayOfMonth.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const cells = useMemo(() => {
    const result: MonthCell[] = []
    for (let i = 0; i < 42; i++) {
      const dayNum = i - startDay + 1
      if (dayNum < 1) {
        result.push({
          date: new Date(year, month - 1, daysInPrevMonth + dayNum),
          isCurrentMonth: false,
        })
      } else if (dayNum > daysInMonth) {
        result.push({
          date: new Date(year, month + 1, dayNum - daysInMonth),
          isCurrentMonth: false,
        })
      } else {
        result.push({
          date: new Date(year, month, dayNum),
          isCurrentMonth: true,
        })
      }
    }
    return result
  }, [year, month, startDay, daysInMonth, daysInPrevMonth])

  const dayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

  const getEventsForDate = (date: Date) => {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(start.getDate() + 1)
    return events
      .filter((e) => e.startAt >= start && e.startAt < end)
      .filter((e) => activeDimIds.length === 0 || activeDimIds.includes(e.dimensionId))
      .slice(0, 3)
      .map((e) => ({
        ...e,
        color:
          dimensions.find((d) => d.id === e.dimensionId)?.color ?? '#86868b',
      }))
  }

  const [quickCreate, setQuickCreate] = useState<{ date: Date; anchorRect: DOMRect } | null>(null)

  const handleDayClick = (date: Date, e: React.MouseEvent) => {
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    setQuickCreate({ date, anchorRect: rect })
  }

  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()

  // Only show 5 rows if last row is all next month
  const rows =
    cells.length > 35 && cells.slice(35).every((c) => !c.isCurrentMonth)
      ? 5
      : 6

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Day header */}
      <div className="grid grid-cols-7 border-b border-black/[0.06]">
        {dayLabels.map((label, i) => {
          const isTodayCol =
            today.getDay() === i &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear()
          return (
            <div
              key={label}
              className={`py-2 text-center text-[12px] font-medium tracking-[0.01em] ${
                isTodayCol
                  ? 'text-[#0071e3]'
                  : 'text-[rgba(0,0,0,0.36)]'
              }`}
            >
              {label}
            </div>
          )
        })}
      </div>

      {/* Grid */}
      <div
        className="flex-1 grid grid-cols-7"
        style={{ gridTemplateRows: `repeat(${rows}, 1fr)` }}
      >
        {cells.slice(0, rows * 7).map((cell, i) => {
          const dayEvents = getEventsForDate(cell.date)
          const isTodayCell = isToday(cell.date)

          return (
            <div
              key={i}
              onClick={(e) => handleDayClick(cell.date, e)}
              className={`min-h-[100px] border-b border-r border-black/[0.04] p-1.5 cursor-pointer transition-colors hover:bg-black/[0.015] ${
                isTodayCell ? 'bg-black/[0.02]' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <span
                  className={`text-[13px] font-medium tracking-[-0.01em] w-7 h-7 flex items-center justify-center rounded-full ${
                    isTodayCell
                      ? 'bg-[#0071e3] text-white shadow-[0_1px_4px_rgba(0,113,227,0.3)]'
                      : cell.isCurrentMonth
                        ? 'text-[#1d1d1f]'
                        : 'text-[rgba(0,0,0,0.2)]'
                  }`}
                >
                  {cell.date.getDate() === 1 && cell.isCurrentMonth
                    ? `${cell.date.getMonth() + 1}月`
                    : cell.date.getDate()}
                </span>
              </div>
              <div className="mt-1 space-y-0.5">
                {dayEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="flex items-center gap-1 text-[11px] truncate leading-tight rounded px-1 py-0.5 hover:bg-black/[0.04] transition-colors"
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: evt.color }}
                    />
                    <span
                      className={`truncate ${
                        evt.eventType === 'suggestion'
                          ? 'text-[rgba(0,0,0,0.3)]'
                          : 'text-[#1d1d1f]'
                      }`}
                    >
                      {evt.startAt
                        .getHours()
                        .toString()
                        .padStart(2, '0')}
                      :
                      {evt.startAt
                        .getMinutes()
                        .toString()
                        .padStart(2, '0')}{' '}
                      {evt.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {quickCreate && (
        <MonthQuickCreate
          date={quickCreate.date}
          anchorRect={quickCreate.anchorRect}
          onClose={() => setQuickCreate(null)}
        />
      )}
    </div>
  )
}

// ---- Month Quick Create popover ----

interface MonthQuickCreateProps {
  date: Date
  anchorRect: DOMRect
  onClose: () => void
}

function MonthQuickCreate({ date, anchorRect, onClose }: MonthQuickCreateProps) {
  const addEvent = useCalendarStore((s) => s.addEvent)
  const dimensions = useDimensionStore((s) => s.dimensions)
  const [title, setTitle] = useState('')
  const [selectedDimId, setSelectedDimId] = useState(dimensions[0]?.id ?? 'work')
  const [startHour, setStartHour] = useState(9)
  const [endHour, setEndHour] = useState(10)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  // Position: try to show below the cell, centered horizontally
  const style: React.CSSProperties = {
    position: 'fixed',
    zIndex: 50,
    top: Math.min(anchorRect.bottom + 4, window.innerHeight - 400),
    left: Math.max(8, Math.min(anchorRect.left, window.innerWidth - 380)),
  }

  const selectedDim = dimensions.find((d) => d.id === selectedDimId)

  const handleSave = () => {
    if (!title.trim()) return
    const startAt = new Date(date)
    startAt.setHours(startHour, 0, 0, 0)
    const endAt = new Date(date)
    endAt.setHours(endHour, 0, 0, 0)
    addEvent({
      id: crypto.randomUUID(),
      title: title.trim(),
      dimensionId: selectedDimId,
      backlogItemId: null,
      startAt,
      endAt,
      eventType: 'confirmed',
    })
    onClose()
  }

  const formatDate = (d: Date) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`

  return (
    <div ref={ref} style={style} className="w-[360px] rounded-xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-black/[0.06] overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] text-[rgba(0,0,0,0.36)] tracking-[-0.01em]">新建日程</span>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-full text-[rgba(0,0,0,0.3)] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors">
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>
        {/* Title input */}
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="添加主题"
          className="w-full text-[18px] font-semibold tracking-[-0.02em] text-[#1d1d1f] placeholder:text-[rgba(0,0,0,0.2)] outline-none mb-4"
          onKeyDown={(e) => { if (e.key === 'Enter' && title.trim()) handleSave() }}
        />
      </div>

      {/* Fields */}
      <div className="px-4 space-y-3 pb-4">
        {/* Time */}
        <div className="flex items-center gap-3 text-[13px] text-[rgba(0,0,0,0.56)]">
          <Clock size={15} strokeWidth={1.5} className="text-[rgba(0,0,0,0.3)] shrink-0" />
          <span>{formatDate(date)}</span>
          <select
            value={startHour}
            onChange={(e) => { const h = Number(e.target.value); setStartHour(h); if (endHour <= h) setEndHour(h + 1) }}
            className="bg-transparent text-[#0071e3] font-medium outline-none cursor-pointer"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
            ))}
          </select>
          <span>-</span>
          <select
            value={endHour}
            onChange={(e) => setEndHour(Number(e.target.value))}
            className="bg-transparent text-[#0071e3] font-medium outline-none cursor-pointer"
          >
            {Array.from({ length: 24 - startHour }, (_, i) => i + startHour + 1).map((h) => (
              <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
            ))}
          </select>
        </div>

        {/* Description placeholder */}
        <div className="flex items-center gap-3 text-[13px] text-[rgba(0,0,0,0.3)]">
          <FileText size={15} strokeWidth={1.5} className="shrink-0" />
          <span>添加描述</span>
        </div>

        {/* Dimension selector */}
        <div className="flex items-center gap-3 text-[13px]">
          <div className="w-[15px] h-[15px] flex items-center justify-center shrink-0">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedDim?.color ?? '#86868b' }} />
          </div>
          <select
            value={selectedDimId}
            onChange={(e) => setSelectedDimId(e.target.value)}
            className="bg-transparent text-[#1d1d1f] font-medium outline-none cursor-pointer"
          >
            {dimensions.map((dim) => (
              <option key={dim.id} value={dim.id}>{dim.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-black/[0.06] bg-[#fafafa]">
        <button
          onClick={onClose}
          className="rounded-lg px-4 py-1.5 text-[13px] font-medium text-[rgba(0,0,0,0.56)] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-all duration-150"
        >
          取消
        </button>
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className="rounded-lg bg-[#0071e3] px-4 py-1.5 text-[13px] font-medium text-white hover:bg-[#0077ED] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
        >
          保存
        </button>
      </div>
    </div>
  )
}
