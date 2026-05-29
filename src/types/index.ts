export type FocusLevel = 'deep' | 'shallow' | 'relaxing'
export type EventType = 'imported' | 'suggestion' | 'confirmed'
export type BacklogStatus = 'backlog' | 'in_progress' | 'completed' | 'dropped'
export type CalendarView = 'day' | 'week' | 'month'

export interface Dimension {
  id: string
  name: string
  icon: string
  color: string
  sortOrder: number
}

export interface KeyResult {
  id: string
  objectiveId: string
  title: string
  targetValue: number
  unit: string
  currentValue: number
  weeklyQuota: number
}

export interface Objective {
  id: string
  dimensionId: string
  title: string
  quarter: string
  keyResults: KeyResult[]
}

export interface BacklogItem {
  id: string
  dimensionId: string
  keyResultId: string | null
  title: string
  type: 'book' | 'movie' | 'series' | 'course' | 'game' | 'custom'
  posterUrl: string | null
  genre: string[]
  totalDurationMinutes: number
  consumedDurationMinutes: number
  focusLevel: FocusLevel
  focusLevelSource: 'ai' | 'manual'
  prioritySort: number
  status: BacklogStatus
}

export interface CalendarEvent {
  id: string
  dimensionId: string
  backlogItemId: string | null
  title: string
  startAt: Date
  endAt: Date
  eventType: EventType
}

export interface WeeklyQuota {
  dimensionId: string
  dimensionName: string
  dimensionIcon: string
  dimensionColor: string
  current: number
  target: number
  unit: string
}

export interface WeeklyReviewData {
  id: string
  weekStart: string
  weekEnd: string
  dimensionSummaries: {
    dimensionId: string
    plannedMinutes: number
    actualMinutes: number
    completedItems: number
  }[]
  highlights: string[]
  nextWeekSuggestions: string[]
}

export interface QuarterlyReviewData {
  id: string
  quarter: string
  totalHours: number
  topAchievements: string[]
  completionRate: number
}

export interface User {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  plan: 'free' | 'pro'
  createdAt: string
}
