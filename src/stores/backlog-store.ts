import { create } from 'zustand'
import type { BacklogItem, BacklogStatus } from '@/types'

type SortKey = 'prioritySort' | 'title' | 'status'

interface BacklogState {
  items: BacklogItem[]
  searchQuery: string
  sortKey: SortKey
  setSearchQuery: (q: string) => void
  setSortKey: (k: SortKey) => void
  addItem: (item: BacklogItem) => void
  updateItem: (id: string, patch: Partial<BacklogItem>) => void
  removeItem: (id: string) => void
  reorder: (fromIndex: number, toIndex: number) => void
}

export const useBacklogStore = create<BacklogState>()((set) => ({
  items: [
    {
      id: 'item-1',
      dimensionId: 'growth',
      keyResultId: 'kr-1-1',
      title: '三体',
      type: 'book',
      posterUrl: null,
      genre: ['科幻', '硬科幻'],
      totalDurationMinutes: 840,
      consumedDurationMinutes: 360,
      focusLevel: 'deep',
      focusLevelSource: 'ai',
      prioritySort: 0,
      status: 'in_progress',
    },
    {
      id: 'item-2',
      dimensionId: 'entertainment',
      keyResultId: 'kr-1-2',
      title: '沙丘2',
      type: 'movie',
      posterUrl: null,
      genre: ['科幻', '冒险'],
      totalDurationMinutes: 166,
      consumedDurationMinutes: 0,
      focusLevel: 'shallow',
      focusLevelSource: 'ai',
      prioritySort: 1,
      status: 'backlog',
    },
    {
      id: 'item-3',
      dimensionId: 'entertainment',
      keyResultId: 'kr-1-2',
      title: '鱿鱼游戏 S2',
      type: 'series',
      posterUrl: null,
      genre: ['悬疑', '惊悚'],
      totalDurationMinutes: 390,
      consumedDurationMinutes: 0,
      focusLevel: 'relaxing',
      focusLevelSource: 'ai',
      prioritySort: 2,
      status: 'backlog',
    },
    {
      id: 'item-4',
      dimensionId: 'growth',
      keyResultId: 'kr-1-3',
      title: 'Next.js 深度课程',
      type: 'course',
      posterUrl: null,
      genre: ['编程', '前端'],
      totalDurationMinutes: 600,
      consumedDurationMinutes: 120,
      focusLevel: 'deep',
      focusLevelSource: 'ai',
      prioritySort: 3,
      status: 'in_progress',
    },
    {
      id: 'item-5',
      dimensionId: 'entertainment',
      keyResultId: null,
      title: '原神剧情线',
      type: 'game',
      posterUrl: null,
      genre: ['RPG', '开放世界'],
      totalDurationMinutes: 480,
      consumedDurationMinutes: 90,
      focusLevel: 'relaxing',
      focusLevelSource: 'ai',
      prioritySort: 4,
      status: 'backlog',
    },
  ],
  searchQuery: '',
  sortKey: 'prioritySort',
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSortKey: (k) => set({ sortKey: k }),
  addItem: (item) => set((s) => ({ items: [...s.items, item] })),
  updateItem: (id, patch) =>
    set((s) => ({
      items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    })),
  removeItem: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  reorder: (fromIndex, toIndex) =>
    set((s) => {
      const next = [...s.items]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return { items: next.map((item, i) => ({ ...item, prioritySort: i })) }
    }),
}))
