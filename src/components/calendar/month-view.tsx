'use client'

import { useUIStore } from '@/stores/ui-store'
import { useCalendarStore } from '@/stores/calendar-store'
import { useDimensionStore } from '@/stores/dimension-store'
import { useMemo } from 'react'

interface MonthCell {
  date: Date
  isCurrentMonth: boolean
}

export function MonthView() {
  const currentDate = useUIStore((s) => s.currentDate)
  const setCalendarView = useUIStore((s) => s.setCalendarView)
  const setCurrentDate = useUIStore((s) => s.setCurrentDate)
  const events = useCalendarStore((s) => s.events)
  const dimensions = useDimensionStore((s) => s.dimensions)
  const activeDim = useDimensionStore((s) => s.activeDimensionId)

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
      .filter((e) => !activeDim || e.dimensionId === activeDim)
      .slice(0, 3)
      .map((e) => ({
        ...e,
        color:
          dimensions.find((d) => d.id === e.dimensionId)?.color ?? '#86868b',
      }))
  }

  const handleDayClick = (date: Date) => {
    setCurrentDate(date)
    setCalendarView('day')
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
              onClick={() => handleDayClick(cell.date)}
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
    </div>
  )
}
