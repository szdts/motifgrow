import { create } from 'zustand'

interface DimensionSummary {
  dimensionId: string
  plannedMinutes: number
  actualMinutes: number
  completedItems: number
}

export interface WeeklyReview {
  id: string
  weekStart: string
  weekEnd: string
  dimensionSummaries: DimensionSummary[]
  highlights: string[]
  nextWeekSuggestions: string[]
}

export interface QuarterlyReview {
  id: string
  quarter: string
  totalHours: number
  topAchievements: string[]
  completionRate: number
}

interface ReviewState {
  weeklyReviews: WeeklyReview[]
  quarterlyReviews: QuarterlyReview[]
  addWeeklyReview: (review: WeeklyReview) => void
  addQuarterlyReview: (review: QuarterlyReview) => void
}

export const useReviewStore = create<ReviewState>()((set) => ({
  weeklyReviews: [
    {
      id: 'wr-1',
      weekStart: '2026-05-18',
      weekEnd: '2026-05-24',
      dimensionSummaries: [
        { dimensionId: 'growth', plannedMinutes: 600, actualMinutes: 480, completedItems: 2 },
        { dimensionId: 'entertainment', plannedMinutes: 300, actualMinutes: 180, completedItems: 1 },
        { dimensionId: 'fitness', plannedMinutes: 360, actualMinutes: 360, completedItems: 4 },
      ],
      highlights: ['读完《百年孤独》', '看了《沙丘2》前半段', '健身 4 次全部完成'],
      nextWeekSuggestions: ['看片配额有余量，建议安排《沙丘2》后半段', '读书节奏很好，保持当前配额'],
    },
  ],
  quarterlyReviews: [
    {
      id: 'qr-1',
      quarter: '2026-Q1',
      totalHours: 312,
      topAchievements: ['读了 10 本书', '健身 42 次', '看了 15 部电影'],
      completionRate: 0.78,
    },
  ],
  addWeeklyReview: (review) =>
    set((s) => ({ weeklyReviews: [...s.weeklyReviews, review] })),
  addQuarterlyReview: (review) =>
    set((s) => ({ quarterlyReviews: [...s.quarterlyReviews, review] })),
}))
