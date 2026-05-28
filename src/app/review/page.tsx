'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { useReviewStore } from '@/stores/review-store'
import { useDimensionStore } from '@/stores/dimension-store'
import { BarChart3, TrendingUp, Star, Lightbulb } from 'lucide-react'

export default function ReviewPage() {
  const weeklyReviews = useReviewStore((s) => s.weeklyReviews)
  const quarterlyReviews = useReviewStore((s) => s.quarterlyReviews)
  const dimensions = useDimensionStore((s) => s.dimensions)

  const latestWeekly = weeklyReviews[weeklyReviews.length - 1]
  const latestQuarterly = quarterlyReviews[quarterlyReviews.length - 1]

  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#f5f5f7]">
        <div className="px-8 py-7">
          <h1 className="text-[24px] font-semibold tracking-tight text-[#1d1d1f] mb-1">
            回顾
          </h1>
          <p className="text-[14px] text-black/[0.48] mb-8">
            回顾你的时间投入和成长轨迹
          </p>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Weekly Review */}
            {latestWeekly && (
              <div className="rounded-[12px] bg-white p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#0071e3]/[0.1]">
                    <BarChart3 className="h-5 w-5 text-[#0071e3]" />
                  </div>
                  <div>
                    <h2 className="text-[16px] font-semibold tracking-tight text-[#1d1d1f]">
                      周报
                    </h2>
                    <span className="text-[12px] text-black/[0.36]">
                      {latestWeekly.weekStart} ~ {latestWeekly.weekEnd}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  {latestWeekly.dimensionSummaries.map((s) => {
                    const dim = dimensions.find((d) => d.id === s.dimensionId)
                    const color = dim?.color ?? '#86868b'
                    const name = dim?.name ?? s.dimensionId
                    const pct = s.plannedMinutes > 0
                      ? Math.round((s.actualMinutes / s.plannedMinutes) * 100)
                      : 0
                    const actualH = Math.round(s.actualMinutes / 60 * 10) / 10
                    const plannedH = Math.round(s.plannedMinutes / 60 * 10) / 10
                    return (
                      <div key={s.dimensionId} className="rounded-[8px] bg-[#f5f5f7] px-4 py-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[13px] text-[#1d1d1f]">{name}</span>
                          <span className="text-[12px] text-black/[0.48] tabular-nums">
                            {actualH}h / {plannedH}h
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${Math.min(pct, 100)}%`,
                              backgroundColor: color,
                            }}
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

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Star className="h-3.5 w-3.5 text-black/[0.36]" />
                      <span className="text-[11px] font-medium uppercase tracking-wider text-black/[0.48]">
                        本周亮点
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {latestWeekly.highlights.map((h, i) => (
                        <li key={i} className="text-[13px] text-[#1d1d1f] pl-3 relative before:absolute before:left-0 before:top-[7px] before:h-1 before:w-1 before:rounded-full before:bg-[#0071e3]">
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
                      {latestWeekly.nextWeekSuggestions.map((s, i) => (
                        <li key={i} className="text-[13px] text-black/[0.6] pl-3 relative before:absolute before:left-0 before:top-[7px] before:h-1 before:w-1 before:rounded-full before:bg-black/[0.2]">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Quarterly Review */}
            {latestQuarterly && (
              <div className="rounded-[12px] bg-white p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#248a3d]/[0.1]">
                    <TrendingUp className="h-5 w-5 text-[#248a3d]" />
                  </div>
                  <div>
                    <h2 className="text-[16px] font-semibold tracking-tight text-[#1d1d1f]">
                      季度总结
                    </h2>
                    <span className="text-[12px] text-black/[0.36]">
                      {latestQuarterly.quarter}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="rounded-[8px] bg-[#f5f5f7] px-4 py-3 text-center">
                    <div className="text-[28px] font-semibold tracking-tight text-[#1d1d1f] tabular-nums">
                      {latestQuarterly.totalHours}
                    </div>
                    <div className="text-[11px] text-black/[0.36]">总投入小时</div>
                  </div>
                  <div className="rounded-[8px] bg-[#f5f5f7] px-4 py-3 text-center">
                    <div className="text-[28px] font-semibold tracking-tight tabular-nums" style={{ color: '#248a3d' }}>
                      {Math.round(latestQuarterly.completionRate * 100)}%
                    </div>
                    <div className="text-[11px] text-black/[0.36]">目标完成率</div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Star className="h-3.5 w-3.5 text-black/[0.36]" />
                    <span className="text-[11px] font-medium uppercase tracking-wider text-black/[0.48]">
                      关键成就
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {latestQuarterly.topAchievements.map((a, i) => (
                      <li key={i} className="text-[13px] text-[#1d1d1f] pl-3 relative before:absolute before:left-0 before:top-[7px] before:h-1 before:w-1 before:rounded-full before:bg-[#248a3d]">
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {!latestWeekly && !latestQuarterly && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/[0.04] mb-4">
                <BarChart3 className="h-7 w-7 text-black/[0.2]" />
              </div>
              <p className="text-[14px] text-black/[0.48]">暂无回顾数据</p>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
