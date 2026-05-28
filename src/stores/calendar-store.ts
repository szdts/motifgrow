import { create } from 'zustand'
import type { CalendarEvent } from '@/types'

interface CalendarState {
  events: CalendarEvent[]
  addEvent: (event: CalendarEvent) => void
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => void
  removeEvent: (id: string) => void
  confirmSuggestion: (id: string) => void
  dismissSuggestion: (id: string) => void
}

export const useCalendarStore = create<CalendarState>()((set) => ({
  events: [
    {
      id: 'evt-1',
      dimensionId: 'work',
      backlogItemId: null,
      title: '站会',
      startAt: new Date('2026-05-25T09:00:00+08:00'),
      endAt: new Date('2026-05-25T09:30:00+08:00'),
      eventType: 'imported',
    },
    {
      id: 'evt-2',
      dimensionId: 'work',
      backlogItemId: null,
      title: '产品评审',
      startAt: new Date('2026-05-26T14:00:00+08:00'),
      endAt: new Date('2026-05-26T16:00:00+08:00'),
      eventType: 'imported',
    },
    {
      id: 'evt-3',
      dimensionId: 'growth',
      backlogItemId: 'item-1',
      title: '读《三体》',
      startAt: new Date('2026-05-27T07:30:00+08:00'),
      endAt: new Date('2026-05-27T09:00:00+08:00'),
      eventType: 'confirmed',
    },
    {
      id: 'evt-4',
      dimensionId: 'fitness',
      backlogItemId: null,
      title: '力量训练',
      startAt: new Date('2026-05-27T18:00:00+08:00'),
      endAt: new Date('2026-05-27T19:30:00+08:00'),
      eventType: 'confirmed',
    },
    {
      id: 'evt-5',
      dimensionId: 'entertainment',
      backlogItemId: 'item-2',
      title: '看《沙丘2》',
      startAt: new Date('2026-05-28T20:00:00+08:00'),
      endAt: new Date('2026-05-28T22:46:00+08:00'),
      eventType: 'suggestion',
    },
    {
      id: 'evt-6',
      dimensionId: 'growth',
      backlogItemId: 'item-4',
      title: 'Next.js 课程',
      startAt: new Date('2026-05-29T08:00:00+08:00'),
      endAt: new Date('2026-05-29T09:30:00+08:00'),
      eventType: 'suggestion',
    },
    {
      id: 'evt-7',
      dimensionId: 'fitness',
      backlogItemId: null,
      title: '跑步',
      startAt: new Date('2026-05-30T07:00:00+08:00'),
      endAt: new Date('2026-05-30T08:00:00+08:00'),
      eventType: 'confirmed',
    },
    {
      id: 'evt-8',
      dimensionId: 'entertainment',
      backlogItemId: 'item-3',
      title: '鱿鱼游戏 S2',
      startAt: new Date('2026-05-30T20:00:00+08:00'),
      endAt: new Date('2026-05-30T21:00:00+08:00'),
      eventType: 'confirmed',
    },
  ],
  addEvent: (event) => set((s) => ({ events: [...s.events, event] })),
  updateEvent: (id, patch) =>
    set((s) => ({
      events: s.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    })),
  removeEvent: (id) =>
    set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
  confirmSuggestion: (id) =>
    set((s) => ({
      events: s.events.map((e) =>
        e.id === id ? { ...e, eventType: 'confirmed' as const } : e
      ),
    })),
  dismissSuggestion: (id) =>
    set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
}))
