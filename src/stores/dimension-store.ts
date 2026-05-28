import { create } from 'zustand'
import type { Dimension } from '@/types'

interface DimensionState {
  dimensions: Dimension[]
  activeDimensionId: string | null // null = "All" tab
  setActiveDimension: (id: string | null) => void
}

export const useDimensionStore = create<DimensionState>((set) => ({
  dimensions: [
    { id: 'work', name: '工作', icon: '💼', color: '#86868b', sortOrder: 0 },
    { id: 'growth', name: '个人成长', icon: '📚', color: '#0071e3', sortOrder: 1 },
    { id: 'entertainment', name: '娱乐', icon: '🎬', color: '#bf4800', sortOrder: 2 },
    { id: 'fitness', name: '健身', icon: '💪', color: '#248a3d', sortOrder: 3 },
  ],
  activeDimensionId: null,
  setActiveDimension: (id) => set({ activeDimensionId: id }),
}))
