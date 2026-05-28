'use client'

import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useUIStore } from '@/stores/ui-store'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DatePickerPopoverProps {
  children: React.ReactNode
}

export function DatePickerPopover({ children }: DatePickerPopoverProps) {
  const [open, setOpen] = useState(false)
  const { calendarView, currentDate, setCurrentDate, goToToday } = useUIStore()
  const [viewYear, setViewYear] = useState(currentDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth())

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1)
      setViewMonth(11)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1)
      setViewMonth(0)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const handleSelectDate = (date: Date) => {
    setCurrentDate(date)
    setOpen(false)
  }

  const handleSelectMonth = (month: number) => {
    setCurrentDate(new Date(viewYear, month, 1))
    setOpen(false)
  }

  const handleToday = () => {
    goToToday()
    setOpen(false)
  }

  // Build month calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate()
  const dayLabels = ['日', '一', '二', '三', '四', '五', '六']
  const today = new Date()

  const cells: { day: number; isCurrentMonth: boolean; date: Date }[] = []
  for (let i = 0; i < 42; i++) {
    const dayNum = i - firstDay + 1
    if (dayNum < 1) {
      const d = daysInPrevMonth + dayNum
      cells.push({ day: d, isCurrentMonth: false, date: new Date(viewYear, viewMonth - 1, d) })
    } else if (dayNum > daysInMonth) {
      const d = dayNum - daysInMonth
      cells.push({ day: d, isCurrentMonth: false, date: new Date(viewYear, viewMonth + 1, d) })
    } else {
      cells.push({ day: dayNum, isCurrentMonth: true, date: new Date(viewYear, viewMonth, dayNum) })
    }
  }

  const isInCurrentWeek = (date: Date) => {
    if (calendarView !== 'week') return false
    const weekStart = new Date(currentDate)
    weekStart.setDate(currentDate.getDate() - currentDate.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)
    return date >= weekStart && date < weekEnd
  }

  const isToday = (date: Date) =>
    date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()

  const isSelected = (date: Date) =>
    date.getDate() === currentDate.getDate() && date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear()

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

  return (
    <Popover open={open} onOpenChange={(nextOpen) => setOpen(nextOpen)}>
      <PopoverTrigger render={<span />}>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border-none rounded-xl bg-white" align="start" sideOffset={8}>
        {calendarView === 'month' ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[14px] font-semibold text-[#1d1d1f]">{viewYear}年</span>
              <div className="flex gap-0.5">
                <button onClick={() => setViewYear(viewYear - 1)} className="w-6 h-6 flex items-center justify-center rounded-md text-[rgba(0,0,0,0.3)] hover:bg-black/[0.04]">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={() => setViewYear(viewYear + 1)} className="w-6 h-6 flex items-center justify-center rounded-md text-[rgba(0,0,0,0.3)] hover:bg-black/[0.04]">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {months.map((m, i) => {
                const isCurrent = i === currentDate.getMonth() && viewYear === currentDate.getFullYear()
                return (
                  <button
                    key={m}
                    onClick={() => handleSelectMonth(i)}
                    className={`py-2 rounded-lg text-[13px] font-medium transition-all ${
                      isCurrent
                        ? 'bg-[#0071e3] text-white'
                        : 'text-[#1d1d1f] hover:bg-black/[0.04]'
                    }`}
                  >
                    {m}
                  </button>
                )
              })}
            </div>
            <button onClick={handleToday} className="mt-3 w-full text-center text-[13px] text-[#0071e3] font-medium hover:underline">
              今天
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[14px] font-semibold text-[#1d1d1f]">{viewYear}年 {viewMonth + 1}月</span>
              <div className="flex gap-0.5">
                <button onClick={handlePrevMonth} className="w-6 h-6 flex items-center justify-center rounded-md text-[rgba(0,0,0,0.3)] hover:bg-black/[0.04]">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={handleNextMonth} className="w-6 h-6 flex items-center justify-center rounded-md text-[rgba(0,0,0,0.3)] hover:bg-black/[0.04]">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-y-0.5 text-center">
              {dayLabels.map((d) => (
                <div key={d} className="text-[10px] font-medium text-[rgba(0,0,0,0.3)] py-1">{d}</div>
              ))}
              {cells.slice(0, 42).map((cell, i) => {
                const weekHighlight = isInCurrentWeek(cell.date)
                return (
                  <button
                    key={i}
                    onClick={() => handleSelectDate(cell.date)}
                    className={`text-[12px] w-7 h-7 mx-auto flex items-center justify-center rounded-full transition-all ${
                      isToday(cell.date)
                        ? 'bg-[#0071e3] text-white font-semibold'
                        : isSelected(cell.date)
                          ? 'bg-black/[0.08] text-[#1d1d1f] font-semibold'
                          : cell.isCurrentMonth
                            ? `text-[#1d1d1f] hover:bg-black/[0.04] ${weekHighlight ? 'bg-[#0071e3]/[0.06]' : ''}`
                            : 'text-[rgba(0,0,0,0.2)] hover:bg-black/[0.04]'
                    }`}
                  >
                    {cell.day}
                  </button>
                )
              })}
            </div>
            <button onClick={handleToday} className="mt-3 w-full text-center text-[13px] text-[#0071e3] font-medium hover:underline">
              今天
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
