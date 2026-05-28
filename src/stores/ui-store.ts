import { create } from 'zustand'
import type { CalendarView } from '@/types'

interface UIState {
  sidebarOpen: boolean
  calendarView: CalendarView
  currentDate: Date
  toggleSidebar: () => void
  setCalendarView: (view: CalendarView) => void
  setCurrentDate: (date: Date) => void
  goToToday: () => void
  goForward: () => void
  goBackward: () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: true,
  calendarView: 'week',
  currentDate: new Date(),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setCalendarView: (view) => set({ calendarView: view }),
  setCurrentDate: (date) => set({ currentDate: date }),
  goToToday: () => set({ currentDate: new Date() }),
  goForward: () => {
    const { currentDate, calendarView } = get()
    const next = new Date(currentDate)
    if (calendarView === 'day') next.setDate(next.getDate() + 1)
    else if (calendarView === 'week') next.setDate(next.getDate() + 7)
    else next.setMonth(next.getMonth() + 1)
    set({ currentDate: next })
  },
  goBackward: () => {
    const { currentDate, calendarView } = get()
    const prev = new Date(currentDate)
    if (calendarView === 'day') prev.setDate(prev.getDate() - 1)
    else if (calendarView === 'week') prev.setDate(prev.getDate() - 7)
    else prev.setMonth(prev.getMonth() - 1)
    set({ currentDate: prev })
  },
}))
