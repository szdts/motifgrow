import { create } from 'zustand'
import type { Objective, KeyResult, WeeklyQuota } from '@/types'
import { useDimensionStore } from './dimension-store'

interface OKRState {
  objectives: Objective[]
  addObjective: (obj: Objective) => void
  updateObjective: (id: string, patch: Partial<Omit<Objective, 'keyResults'>>) => void
  removeObjective: (id: string) => void
  addKeyResult: (objectiveId: string, kr: KeyResult) => void
  updateKeyResult: (krId: string, patch: Partial<KeyResult>) => void
  removeKeyResult: (objectiveId: string, krId: string) => void
}

export const useOKRStore = create<OKRState>()((set) => ({
  objectives: [
    {
      id: 'obj-1',
      dimensionId: 'growth',
      title: 'Q2 个人成长冲刺',
      quarter: '2026-Q2',
      keyResults: [
        { id: 'kr-1-1', objectiveId: 'obj-1', title: '读完 12 本书', targetValue: 12, unit: '本', currentValue: 3, weeklyQuota: 1 },
        { id: 'kr-1-2', objectiveId: 'obj-1', title: '看完 20 部电影', targetValue: 20, unit: '部', currentValue: 8, weeklyQuota: 2 },
        { id: 'kr-1-3', objectiveId: 'obj-1', title: '完成 3 门在线课程', targetValue: 3, unit: '门', currentValue: 1, weeklyQuota: 0.25 },
      ],
    },
    {
      id: 'obj-2',
      dimensionId: 'fitness',
      title: 'Q2 健身习惯建立',
      quarter: '2026-Q2',
      keyResults: [
        { id: 'kr-2-1', objectiveId: 'obj-2', title: '每周力量训练 4 次', targetValue: 48, unit: '次', currentValue: 18, weeklyQuota: 4 },
        { id: 'kr-2-2', objectiveId: 'obj-2', title: '体重降至 75kg', targetValue: 75, unit: 'kg', currentValue: 79, weeklyQuota: 0 },
        { id: 'kr-2-3', objectiveId: 'obj-2', title: '累计跑步 100km', targetValue: 100, unit: 'km', currentValue: 32, weeklyQuota: 8 },
      ],
    },
  ],
  addObjective: (obj) => set((s) => ({ objectives: [...s.objectives, obj] })),
  updateObjective: (id, patch) =>
    set((s) => ({
      objectives: s.objectives.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    })),
  removeObjective: (id) =>
    set((s) => ({ objectives: s.objectives.filter((o) => o.id !== id) })),
  addKeyResult: (objectiveId, kr) =>
    set((s) => ({
      objectives: s.objectives.map((o) =>
        o.id === objectiveId ? { ...o, keyResults: [...o.keyResults, kr] } : o
      ),
    })),
  updateKeyResult: (krId, patch) =>
    set((s) => ({
      objectives: s.objectives.map((o) => ({
        ...o,
        keyResults: o.keyResults.map((kr) =>
          kr.id === krId ? { ...kr, ...patch } : kr
        ),
      })),
    })),
  removeKeyResult: (objectiveId, krId) =>
    set((s) => ({
      objectives: s.objectives.map((o) =>
        o.id === objectiveId
          ? { ...o, keyResults: o.keyResults.filter((kr) => kr.id !== krId) }
          : o
      ),
    })),
}))

export function getWeeklyQuotas(): WeeklyQuota[] {
  const objectives = useOKRStore.getState().objectives
  const dimensions = useDimensionStore.getState().dimensions

  const quotaMap = new Map<string, WeeklyQuota>()

  for (const obj of objectives) {
    const dim = dimensions.find((d) => d.id === obj.dimensionId)
    if (!dim) continue

    for (const kr of obj.keyResults) {
      const existing = quotaMap.get(obj.dimensionId)
      if (existing) {
        existing.current += kr.currentValue
        existing.target += kr.targetValue
      } else {
        quotaMap.set(obj.dimensionId, {
          dimensionId: obj.dimensionId,
          dimensionName: dim.name,
          dimensionIcon: dim.icon,
          dimensionColor: dim.color,
          current: kr.currentValue,
          target: kr.targetValue,
          unit: kr.unit,
        })
      }
    }
  }

  return Array.from(quotaMap.values())
}
