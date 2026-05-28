'use client'

import { useUIStore } from '@/stores/ui-store'
import { useCalendarStore } from '@/stores/calendar-store'
import { useDimensionStore } from '@/stores/dimension-store'
import { useState, useEffect } from 'react'
import { EventPopover } from './event-popover'

const HOURS = Array.from({ length: 17 }, (_, i) => i + 7)
const HOUR_HEIGHT = 56

export function DayView() {
  const currentDate = useUIStore((s) => s.currentDate)
  const events = useCalendarStore((s) => s.events)
  const dimensions = useDimensionStore((s) => s.dimensions)
  const activeDim = useDimensionStore((s) => s.activeDimensionId)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const isToday = currentDate.toDateString() === now.toDateString()

  const dayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

  const dayStart = new Date(currentDate)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(dayStart)
  dayEnd.setDate(dayStart.getDate() + 1)

  const dayEvents = events
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

  const nowHour = now.getHours() + now.getMinutes() / 60
  const nowTop = (nowHour - 7) * HOUR_HEIGHT

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Day header */}
      <div className="grid grid-cols-[56px_1fr] border-b border-black/[0.06]">
        <div />
        <div className="flex flex-col items-center py-2.5">
          <span
            className={`text-[11px] tracking-[0.01em] ${
              isToday
                ? 'text-[#0071e3] font-semibold'
                : 'text-[rgba(0,0,0,0.36)]'
            }`}
          >
            {dayLabels[currentDate.getDay()]}
          </span>
          <span
            className={`mt-1 text-[18px] font-medium tracking-[-0.02em] w-8 h-8 flex items-center justify-center rounded-full ${
              isToday
                ? 'bg-[#0071e3] text-white shadow-[0_1px_4px_rgba(0,113,227,0.3)]'
                : 'text-[#1d1d1f]'
            }`}
          >
            {currentDate.getDate()}
          </span>
        </div>
      </div>

      {/* Time grid */}
      <div
        className="grid grid-cols-[56px_1fr] relative"
        style={{ height: `${17 * HOUR_HEIGHT}px` }}
      >
        {HOURS.map((hour) => (
          <div key={hour} className="contents">
            <div className="h-14 pr-2 flex items-start justify-end">
              <span className="text-[10px] tabular-nums text-[rgba(0,0,0,0.25)] -mt-1.5 font-medium">
                {String(hour).padStart(2, '0')}:00
              </span>
            </div>
            <div className="h-14 border-b border-black/[0.04] hover:bg-[#0071e3]/[0.02] transition-colors cursor-pointer" />
          </div>
        ))}

        {/* Events */}
        {dayEvents.map((event) => {
          const top = (event.startHour - 7) * HOUR_HEIGHT
          const height = Math.max(event.durationHours * HOUR_HEIGHT - 2, 26)
          const isConfirmed = event.eventType === 'confirmed'
          const isSuggestion = event.eventType === 'suggestion'

          return (
            <div
              key={event.id}
              className="absolute cursor-pointer"
              style={{
                left: '56px',
                right: '8px',
                top: `${top}px`,
                height: `${height}px`,
              }}
              onClick={() => setSelectedEventId(event.id)}
            >
              <div
                className="h-full rounded-lg px-3 py-2 text-[13px] font-medium overflow-hidden transition-all duration-200 hover:brightness-[0.97]"
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
              >
                <div className="truncate">
                  {isConfirmed && '\u2713 '}
                  {event.title}
                </div>
                <div className="text-[11px] opacity-70 mt-0.5">
                  {event.startAt
                    .getHours()
                    .toString()
                    .padStart(2, '0')}
                  :
                  {event.startAt
                    .getMinutes()
                    .toString()
                    .padStart(2, '0')}{' '}
                  -{' '}
                  {event.endAt
                    .getHours()
                    .toString()
                    .padStart(2, '0')}
                  :
                  {event.endAt
                    .getMinutes()
                    .toString()
                    .padStart(2, '0')}
                </div>
              </div>
            </div>
          )
        })}

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

      {selectedEventId && (
        <EventPopover
          eventId={selectedEventId}
          onClose={() => setSelectedEventId(null)}
        />
      )}
    </div>
  )
}
