import { create } from 'zustand'
import type { Dimension } from '@/types'

interface DimensionState {
  dimensions: Dimension[]
  activeDimensionIds: string[] // empty = show all (same as "全部")
  toggleDimension: (id: string) => void
  resetToAll: () => void
  addDimension: (dim: Dimension) => void
  updateDimension: (id: string, patch: Partial<Omit<Dimension, 'id'>>) => void
  removeDimension: (id: string) => void
}

export const useDimensionStore = create<DimensionState>((set) => ({
  dimensions: [
    { id: 'work', name: '工作', icon: 'Briefcase', color: '#86868b', sortOrder: 0 },
    { id: 'growth', name: '个人成长', icon: 'BookOpen', color: '#0071e3', sortOrder: 1 },
    { id: 'entertainment', name: '娱乐', icon: 'Film', color: '#bf4800', sortOrder: 2 },
    { id: 'fitness', name: '健身', icon: 'Dumbbell', color: '#248a3d', sortOrder: 3 },
  ],
  activeDimensionIds: [],
  toggleDimension: (id) =>
    set((s) => ({
      activeDimensionIds: s.activeDimensionIds.includes(id)
        ? s.activeDimensionIds.filter((x) => x !== id)
        : [...s.activeDimensionIds, id],
    })),
  resetToAll: () => set({ activeDimensionIds: [] }),
  addDimension: (dim) =>
    set((s) => ({ dimensions: [...s.dimensions, dim] })),
  updateDimension: (id, patch) =>
    set((s) => ({
      dimensions: s.dimensions.map((d) =>
        d.id === id ? { ...d, ...patch } : d
      ),
    })),
  removeDimension: (id) =>
    set((s) => ({
      dimensions: s.dimensions.filter((d) => d.id !== id),
      activeDimensionIds: s.activeDimensionIds.filter((x) => x !== id),
    })),
}))
