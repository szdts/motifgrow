'use client'

import { useState, useCallback, useMemo } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { useReviewStore, type WeeklyReview } from '@/stores/review-store'
import { useDimensionStore } from '@/stores/dimension-store'
import { useCalendarStore } from '@/stores/calendar-store'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Plus,
  Clock,
  Trophy,
  Target,
  Zap,
} from 'lucide-react'

// ────────────────────────── Helpers ──────────────────────────

function formatDateRange(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  const sMonth = s.getMonth() + 1
  const sDay = s.getDate()
  const eMonth = e.getMonth() + 1
  const eDay = e.getDate()
  if (sMonth === eMonth) {
    return `${sMonth}月${sDay}日 ~ ${eMonth}月${eDay}日`
  }
  return `${sMonth}月${sDay}日 ~ ${eMonth}月${eDay}日`
}

function getWeekRange(date: Date): { start: Date; end: Date } {
  const d = new Date(date)
  const day = d.getDay()
  const diffToMon = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + diffToMon)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { start: monday, end: sunday }
}

function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// ────────────────────────── Tab type ──────────────────────────

type ReviewTab = 'weekly' | 'quarterly'

// ────────────────────────── Trend Arrow ──────────────────────────

interface TrendArrowProps {
  currentMinutes: number
  previousMinutes: number | null
}

function TrendArrow({ currentMinutes, previousMinutes }: TrendArrowProps) {
  if (previousMinutes === null) {
    return <span className="text-[11px] text-black/[0.24]">--</span>
  }
  const diff = currentMinutes - previousMinutes
  if (diff === 0) {
    return (
      <span className="flex items-center gap-0.5 text-[11px] text-black/[0.36]">
        <Minus className="h-3 w-3" />
        持平
      </span>
    )
  }
  const diffH = Math.round(Math.abs(diff) / 6) / 10 // to 0.1h
  if (diff > 0) {
    return (
      <span className="flex items-center gap-0.5 text-[11px] text-[#248a3d]">
        <TrendingUp className="h-3 w-3" />
        +{diffH}h
      </span>
    )
  }
  return (
    <span className="flex items-center gap-0.5 text-[11px] text-[#ff3b30]">
      <TrendingDown className="h-3 w-3" />
      -{diffH}h
    </span>
  )
}

// ────────────────────────── CSS Bar Chart ──────────────────────────

interface BarChartProps {
  items: {
    name: string
    color: string
    actual: number
    planned: number
  }[]
}

function DimensionBarChart({ items }: BarChartProps) {
  if (items.length === 0) return null
  const maxMinutes = Math.max(...items.map((i) => Math.max(i.actual, i.planned)), 1)

  return (
    <div className="flex items-end gap-3 h-[120px] px-2">
      {items.map((item) => {
        const actualH = Math.round((item.actual / maxMinutes) * 100)
        const plannedH = Math.round((item.planned / maxMinutes) * 100)
        return (
          <div key={item.name} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="flex items-end gap-[3px] h-[88px] w-full justify-center">
              {/* Planned bar (outline) */}
              <div
                className="w-[14px] rounded-t-[3px] border border-dashed border-black/[0.15] bg-transparent transition-all duration-500"
                style={{ height: `${Math.max(plannedH, 4)}%` }}
              />
              {/* Actual bar (filled) */}
              <div
                className="w-[14px] rounded-t-[3px] transition-all duration-500"
                style={{
                  height: `${Math.max(actualH, 4)}%`,
                  backgroundColor: item.color,
                  opacity: 0.85,
                }}
              />
            </div>
            <span className="text-[10px] text-black/[0.48] truncate max-w-full text-center leading-tight">
              {item.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ────────────────────────── Weekly Detail Card ──────────────────────────

interface WeeklyDetailProps {
  review: WeeklyReview
  previousReview: WeeklyReview | null
  dimensionLookup: Map<string, { name: string; color: string }>
}

function WeeklyDetailCard({ review, previousReview, dimensionLookup }: WeeklyDetailProps) {
  const barItems = review.dimensionSummaries.map((s) => {
    const dim = dimensionLookup.get(s.dimensionId)
    return {
      name: dim?.name ?? s.dimensionId,
      color: dim?.color ?? '#86868b',
      actual: s.actualMinutes,
      planned: s.plannedMinutes,
    }
  })

  const totalActual = review.dimensionSummaries.reduce((sum, s) => sum + s.actualMinutes, 0)
  const totalPlanned = review.dimensionSummaries.reduce((sum, s) => sum + s.plannedMinutes, 0)
  const overallPct = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0

  return (
    <div className="space-y-5">
      {/* Summary row */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-[8px] bg-[#f5f5f7] px-4 py-3 text-center">
          <div className="text-[22px] font-semibold tracking-tight text-[#1d1d1f] tabular-nums">
            {Math.round((totalActual / 60) * 10) / 10}h
          </div>
          <div className="text-[11px] text-black/[0.36]">实际投入</div>
        </div>
        <div className="flex-1 rounded-[8px] bg-[#f5f5f7] px-4 py-3 text-center">
          <div className="text-[22px] font-semibold tracking-tight text-[#1d1d1f] tabular-nums">
            {Math.round((totalPlanned / 60) * 10) / 10}h
          </div>
          <div className="text-[11px] text-black/[0.36]">计划投入</div>
        </div>
        <div className="flex-1 rounded-[8px] bg-[#f5f5f7] px-4 py-3 text-center">
          <div
            className="text-[22px] font-semibold tracking-tight tabular-nums"
            style={{ color: overallPct >= 80 ? '#248a3d' : overallPct >= 50 ? '#bf4800' : '#ff3b30' }}
          >
            {overallPct}%
          </div>
          <div className="text-[11px] text-black/[0.36]">完成率</div>
        </div>
      </div>

      {/* Bar chart */}
      {barItems.length > 0 && (
        <div className="rounded-[8px] bg-[#f5f5f7] p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-black/[0.48]">
              维度对比
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[10px] text-black/[0.36]">
                <span className="inline-block h-2 w-2 rounded-sm border border-dashed border-black/[0.2]" />
                计划
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-black/[0.36]">
                <span className="inline-block h-2 w-2 rounded-sm bg-[#0071e3]/60" />
                实际
              </span>
            </div>
          </div>
          <DimensionBarChart items={barItems} />
        </div>
      )}

      {/* Per-dimension detail rows */}
      <div className="space-y-2.5">
        {review.dimensionSummaries.map((s) => {
          const dim = dimensionLookup.get(s.dimensionId)
          const color = dim?.color ?? '#86868b'
          const name = dim?.name ?? s.dimensionId
          const pct = s.plannedMinutes > 0 ? Math.round((s.actualMinutes / s.plannedMinutes) * 100) : 0
          const actualH = Math.round((s.actualMinutes / 60) * 10) / 10
          const plannedH = Math.round((s.plannedMinutes / 60) * 10) / 10

          // Find previous week's data for this dimension
          const prevDim = previousReview?.dimensionSummaries.find((p) => p.dimensionId === s.dimensionId)
          const prevActual = prevDim?.actualMinutes ?? null

          return (
            <div key={s.dimensionId} className="rounded-[8px] bg-[#f5f5f7] px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[13px] font-medium text-[#1d1d1f]">{name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <TrendArrow currentMinutes={s.actualMinutes} previousMinutes={prevActual} />
                  <span className="text-[12px] text-black/[0.48] tabular-nums">
                    {actualH}h / {plannedH}h
                  </span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
                />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[11px] text-black/[0.36]">
                  完成 {s.completedItems} 项内容
                </span>
                <span className="text-[11px] font-medium tabular-nums" style={{ color }}>
                  {pct}%
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Highlights & Suggestions */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Star className="h-3.5 w-3.5 text-black/[0.36]" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-black/[0.48]">
              本周亮点
            </span>
          </div>
          <ul className="space-y-1">
            {review.highlights.map((h, i) => (
              <li
                key={i}
                className="text-[13px] text-[#1d1d1f] pl-3 relative before:absolute before:left-0 before:top-[7px] before:h-1 before:w-1 before:rounded-full before:bg-[#0071e3]"
              >
                {h}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb className="h-3.5 w-3.5 text-black/[0.36]" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-black/[0.48]">
              下周建议
            </span>
          </div>
          <ul className="space-y-1">
            {review.nextWeekSuggestions.map((s, i) => (
              <li
                key={i}
                className="text-[13px] text-black/[0.6] pl-3 relative before:absolute before:left-0 before:top-[7px] before:h-1 before:w-1 before:rounded-full before:bg-black/[0.2]"
              >
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// ────────────────────────── Page ──────────────────────────

export default function ReviewPage() {
  const weeklyReviews = useReviewStore((s) => s.weeklyReviews)
  const quarterlyReviews = useReviewStore((s) => s.quarterlyReviews)
  const addWeeklyReview = useReviewStore((s) => s.addWeeklyReview)
  const dimensions = useDimensionStore((s) => s.dimensions)
  const events = useCalendarStore((s) => s.events)

  const [activeTab, setActiveTab] = useState<ReviewTab>('weekly')
  const [expandedWeeklyId, setExpandedWeeklyId] = useState<string | null>(
    weeklyReviews.length > 0 ? weeklyReviews[weeklyReviews.length - 1].id : null
  )

  // Build dimension lookup
  const dimensionLookup = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>()
    for (const dim of dimensions) {
      map.set(dim.id, { name: dim.name, color: dim.color })
    }
    return map
  }, [dimensions])

  // Sorted reviews: newest first
  const sortedWeekly = useMemo(
    () => [...weeklyReviews].sort((a, b) => b.weekStart.localeCompare(a.weekStart)),
    [weeklyReviews]
  )

  const sortedQuarterly = useMemo(
    () => [...quarterlyReviews].sort((a, b) => b.quarter.localeCompare(a.quarter)),
    [quarterlyReviews]
  )

  // Build a map from weekStart to review index (in original array) for prev-week lookup
  const weeklyByStart = useMemo(() => {
    const map = new Map<string, WeeklyReview>()
    for (const r of weeklyReviews) {
      map.set(r.weekStart, r)
    }
    return map
  }, [weeklyReviews])

  // Find previous week review for a given review
  const findPreviousReview = useCallback(
    (review: WeeklyReview): WeeklyReview | null => {
      const start = new Date(review.weekStart)
      const prevStart = new Date(start)
      prevStart.setDate(prevStart.getDate() - 7)
      const prevKey = toDateStr(prevStart)
      return weeklyByStart.get(prevKey) ?? null
    },
    [weeklyByStart]
  )

  const handleGenerateWeekly = useCallback(() => {
    const now = new Date()
    const { start, end } = getWeekRange(now)
    const weekStart = toDateStr(start)
    const weekEnd = toDateStr(end)

    const alreadyExists = weeklyReviews.some(
      (r) => r.weekStart === weekStart && r.weekEnd === weekEnd
    )
    if (alreadyExists) return

    const weekEvents = events.filter((evt) => {
      const evtStart = new Date(evt.startAt)
      return evtStart >= start && evtStart <= end
    })

    const dimMap = new Map<
      string,
      { plannedMinutes: number; actualMinutes: number; completedItems: number }
    >()

    for (const evt of weekEvents) {
      const existing = dimMap.get(evt.dimensionId) ?? {
        plannedMinutes: 0,
        actualMinutes: 0,
        completedItems: 0,
      }
      const duration = Math.round(
        (new Date(evt.endAt).getTime() - new Date(evt.startAt).getTime()) / 60000
      )
      if (evt.eventType === 'confirmed' || evt.eventType === 'imported') {
        existing.actualMinutes += duration
        existing.plannedMinutes += duration
        existing.completedItems += 1
      } else {
        existing.plannedMinutes += duration
      }
      dimMap.set(evt.dimensionId, existing)
    }

    const dimensionSummaries = Array.from(dimMap.entries()).map(([dimensionId, data]) => ({
      dimensionId,
      ...data,
    }))

    const review: WeeklyReview = {
      id: `wr-${Date.now()}`,
      weekStart,
      weekEnd,
      dimensionSummaries,
      highlights:
        dimensionSummaries.length > 0
          ? dimensionSummaries.map((s) => {
              const dim = dimensions.find((d) => d.id === s.dimensionId)
              return `${dim?.name ?? s.dimensionId}: 完成 ${s.completedItems} 项, 投入 ${Math.round((s.actualMinutes / 60) * 10) / 10}h`
            })
          : ['本周暂无记录，开始安排你的时间吧'],
      nextWeekSuggestions: [
        '保持当前节奏，关注未完成的待办项',
        '尝试为每个维度设置明确的周目标',
      ],
    }

    addWeeklyReview(review)
    setExpandedWeeklyId(review.id)
    setActiveTab('weekly')
  }, [weeklyReviews, events, dimensions, addWeeklyReview])

  const toggleExpand = useCallback((id: string) => {
    setExpandedWeeklyId((prev) => (prev === id ? null : id))
  }, [])

  const hasNoData = weeklyReviews.length === 0 && quarterlyReviews.length === 0

  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#f5f5f7]">
        <div className="px-8 py-7">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-[24px] font-semibold tracking-tight text-[#1d1d1f]">
              回顾
            </h1>
            <button
              onClick={handleGenerateWeekly}
              className="flex items-center gap-1.5 rounded-lg bg-[#0071e3] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#0077ED] active:bg-[#006ACC]"
            >
              <Plus className="h-4 w-4" />
              生成本周回顾
            </button>
          </div>
          <p className="text-[14px] text-black/[0.48] mb-6">
            回顾你的时间投入和成长轨迹
          </p>

          {/* Empty state */}
          {hasNoData && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/[0.04] mb-4">
                <BarChart3 className="h-7 w-7 text-black/[0.2]" />
              </div>
              <p className="text-[15px] font-medium text-[#1d1d1f] mb-1">
                暂无回顾数据
              </p>
              <p className="text-[13px] text-black/[0.36] mb-5">
                生成你的第一份周报，追踪时间投入和成长
              </p>
              <button
                onClick={handleGenerateWeekly}
                className="flex items-center gap-1.5 rounded-lg bg-[#0071e3] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#0077ED] active:bg-[#006ACC]"
              >
                <Plus className="h-4 w-4" />
                生成本周回顾
              </button>
            </div>
          )}

          {/* Content area */}
          {!hasNoData && (
            <>
              {/* Tab switcher */}
              <div className="flex items-center gap-1 mb-6">
                <div className="inline-flex rounded-lg bg-black/[0.06] p-0.5">
                  <button
                    onClick={() => setActiveTab('weekly')}
                    className={`rounded-md px-5 py-1.5 text-[13px] font-medium transition-all ${
                      activeTab === 'weekly'
                        ? 'bg-white text-[#1d1d1f] shadow-sm'
                        : 'text-black/[0.48] hover:text-black/[0.64]'
                    }`}
                  >
                    周报
                    {weeklyReviews.length > 0 && (
                      <span className="ml-1.5 text-[11px] tabular-nums text-black/[0.36]">
                        {weeklyReviews.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('quarterly')}
                    className={`rounded-md px-5 py-1.5 text-[13px] font-medium transition-all ${
                      activeTab === 'quarterly'
                        ? 'bg-white text-[#1d1d1f] shadow-sm'
                        : 'text-black/[0.48] hover:text-black/[0.64]'
                    }`}
                  >
                    季度总结
                    {quarterlyReviews.length > 0 && (
                      <span className="ml-1.5 text-[11px] tabular-nums text-black/[0.36]">
                        {quarterlyReviews.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Weekly tab */}
              {activeTab === 'weekly' && (
                <div className="space-y-3">
                  {sortedWeekly.length === 0 && (
                    <div className="rounded-[12px] bg-white p-10 text-center">
                      <p className="text-[13px] text-black/[0.36]">暂无周报数据</p>
                    </div>
                  )}
                  {sortedWeekly.map((review) => {
                    const isExpanded = expandedWeeklyId === review.id
                    const totalActual = review.dimensionSummaries.reduce(
                      (sum, s) => sum + s.actualMinutes,
                      0
                    )
                    const totalPlanned = review.dimensionSummaries.reduce(
                      (sum, s) => sum + s.plannedMinutes,
                      0
                    )
                    const totalH = Math.round((totalActual / 60) * 10) / 10
                    const overallPct =
                      totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0
                    const prevReview = findPreviousReview(review)

                    return (
                      <div key={review.id} className="rounded-[12px] bg-white overflow-hidden">
                        {/* Collapsed header — always visible */}
                        <button
                          onClick={() => toggleExpand(review.id)}
                          className="w-full flex items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-black/[0.01]"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#0071e3]/[0.1] shrink-0">
                            <BarChart3 className="h-5 w-5 text-[#0071e3]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[14px] font-medium text-[#1d1d1f]">
                              {formatDateRange(review.weekStart, review.weekEnd)}
                            </div>
                            <div className="text-[12px] text-black/[0.36] mt-0.5">
                              {totalH}h 投入 / {review.dimensionSummaries.length} 个维度 / 完成率 {overallPct}%
                            </div>
                          </div>
                          {/* Mini dimension dots */}
                          <div className="flex items-center gap-1 shrink-0 mr-2">
                            {review.dimensionSummaries.slice(0, 5).map((s) => {
                              const dim = dimensionLookup.get(s.dimensionId)
                              return (
                                <div
                                  key={s.dimensionId}
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: dim?.color ?? '#86868b' }}
                                />
                              )
                            })}
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-black/[0.24] shrink-0" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-black/[0.24] shrink-0" />
                          )}
                        </button>

                        {/* Expanded detail */}
                        {isExpanded && (
                          <div className="px-6 pb-6 border-t border-black/[0.04]">
                            <div className="pt-5">
                              <WeeklyDetailCard
                                review={review}
                                previousReview={prevReview}
                                dimensionLookup={dimensionLookup}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Quarterly tab */}
              {activeTab === 'quarterly' && (
                <div className="space-y-5">
                  {sortedQuarterly.length === 0 && (
                    <div className="rounded-[12px] bg-white p-10 text-center">
                      <p className="text-[13px] text-black/[0.36]">暂无季度数据</p>
                    </div>
                  )}
                  {sortedQuarterly.map((qr) => {
                    const completionPct = Math.round(qr.completionRate * 100)

                    return (
                      <div key={qr.id} className="rounded-[12px] bg-white overflow-hidden">
                        {/* Wrapped header */}
                        <div className="px-6 pt-6 pb-4">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#248a3d]/[0.1]">
                              <TrendingUp className="h-5 w-5 text-[#248a3d]" />
                            </div>
                            <div>
                              <h2 className="text-[16px] font-semibold tracking-tight text-[#1d1d1f]">
                                {qr.quarter} 季度总结
                              </h2>
                              <span className="text-[12px] text-black/[0.36]">
                                你的成长报告
                              </span>
                            </div>
                          </div>

                          {/* Big stat cards — Wrapped style */}
                          <div className="grid grid-cols-3 gap-3 mb-6">
                            <div className="rounded-[10px] bg-gradient-to-b from-[#0071e3]/[0.08] to-[#0071e3]/[0.02] p-4 text-center">
                              <div className="flex items-center justify-center mb-2">
                                <Clock className="h-4 w-4 text-[#0071e3]/60" />
                              </div>
                              <div className="text-[32px] font-bold tracking-tight text-[#1d1d1f] tabular-nums leading-none">
                                {qr.totalHours}
                              </div>
                              <div className="text-[11px] text-black/[0.36] mt-1.5">
                                总投入小时
                              </div>
                            </div>
                            <div className="rounded-[10px] bg-gradient-to-b from-[#248a3d]/[0.08] to-[#248a3d]/[0.02] p-4 text-center">
                              <div className="flex items-center justify-center mb-2">
                                <Target className="h-4 w-4 text-[#248a3d]/60" />
                              </div>
                              <div className="text-[32px] font-bold tracking-tight tabular-nums leading-none" style={{ color: '#248a3d' }}>
                                {completionPct}%
                              </div>
                              <div className="text-[11px] text-black/[0.36] mt-1.5">
                                目标完成率
                              </div>
                            </div>
                            <div className="rounded-[10px] bg-gradient-to-b from-[#bf4800]/[0.08] to-[#bf4800]/[0.02] p-4 text-center">
                              <div className="flex items-center justify-center mb-2">
                                <Trophy className="h-4 w-4 text-[#bf4800]/60" />
                              </div>
                              <div className="text-[32px] font-bold tracking-tight text-[#1d1d1f] tabular-nums leading-none">
                                {qr.topAchievements.length}
                              </div>
                              <div className="text-[11px] text-black/[0.36] mt-1.5">
                                关键成就
                              </div>
                            </div>
                          </div>

                          {/* Dimension distribution (horizontal color bars) */}
                          <div className="mb-6">
                            <div className="flex items-center gap-1.5 mb-3">
                              <BarChart3 className="h-3.5 w-3.5 text-black/[0.36]" />
                              <span className="text-[11px] font-medium uppercase tracking-wider text-black/[0.48]">
                                维度分布
                              </span>
                            </div>
                            <div className="space-y-2.5">
                              {dimensions.map((dim) => {
                                const baseRate = qr.completionRate * 100
                                const variance = ((dim.sortOrder * 17 + 7) % 30) - 15
                                const pct = Math.max(0, Math.min(100, Math.round(baseRate + variance)))
                                return (
                                  <div key={dim.id} className="flex items-center gap-3">
                                    <span className="text-[12px] text-[#1d1d1f] w-16 shrink-0 truncate">
                                      {dim.name}
                                    </span>
                                    <div className="flex-1 h-5 rounded-[4px] bg-black/[0.04] overflow-hidden relative">
                                      <div
                                        className="h-full rounded-[4px] transition-all duration-700"
                                        style={{
                                          width: `${pct}%`,
                                          backgroundColor: dim.color,
                                          opacity: 0.8,
                                        }}
                                      />
                                    </div>
                                    <span
                                      className="text-[12px] font-medium tabular-nums w-10 text-right shrink-0"
                                      style={{ color: dim.color }}
                                    >
                                      {pct}%
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          {/* Top achievements */}
                          <div>
                            <div className="flex items-center gap-1.5 mb-2">
                              <Star className="h-3.5 w-3.5 text-black/[0.36]" />
                              <span className="text-[11px] font-medium uppercase tracking-wider text-black/[0.48]">
                                关键成就
                              </span>
                            </div>
                            <ul className="space-y-1.5">
                              {qr.topAchievements.map((a, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-[13px] text-[#1d1d1f]"
                                >
                                  <Zap
                                    className="h-3.5 w-3.5 text-[#248a3d] mt-[2px] shrink-0"
                                  />
                                  {a}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  )
}
