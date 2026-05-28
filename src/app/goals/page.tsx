'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { useOKRStore } from '@/stores/okr-store'
import { useDimensionStore } from '@/stores/dimension-store'
import { Target } from 'lucide-react'
import type { KeyResult } from '@/types'

function KRCard({ kr, color }: { kr: KeyResult; color: string }) {
  const pct = kr.targetValue > 0
    ? Math.min(Math.round((kr.currentValue / kr.targetValue) * 100), 100)
    : 0

  return (
    <div className="rounded-[8px] bg-[#f5f5f7] px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] text-[#1d1d1f]">{kr.title}</span>
        <span className="text-[12px] text-black/[0.48] tabular-nums">
          {kr.currentValue} / {kr.targetValue} {kr.unit}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[11px] text-black/[0.36]">
          {kr.weeklyQuota > 0 ? `每周 ${kr.weeklyQuota} ${kr.unit}` : '无周配额'}
        </span>
        <span className="text-[11px] font-medium tabular-nums" style={{ color }}>
          {pct}%
        </span>
      </div>
    </div>
  )
}

export default function GoalsPage() {
  const objectives = useOKRStore((s) => s.objectives)
  const dimensions = useDimensionStore((s) => s.dimensions)

  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#f5f5f7]">
        <div className="px-8 py-7">
          <h1 className="text-[24px] font-semibold tracking-tight text-[#1d1d1f] mb-1">
            目标
          </h1>
          <p className="text-[14px] text-black/[0.48] mb-8">
            跟踪你的季度 OKR 进度
          </p>

          <div className="space-y-5">
            {objectives.map((obj) => {
              const dim = dimensions.find((d) => d.id === obj.dimensionId)
              const color = dim?.color ?? '#86868b'
              const avgPct = obj.keyResults.length > 0
                ? Math.round(
                    obj.keyResults.reduce((sum, kr) => {
                      const p = kr.targetValue > 0
                        ? Math.min(kr.currentValue / kr.targetValue, 1)
                        : 0
                      return sum + p
                    }, 0) / obj.keyResults.length * 100
                  )
                : 0

              return (
                <div
                  key={obj.id}
                  className="rounded-[12px] bg-white p-6 transition-all hover:shadow-[0_3px_16px_rgba(0,0,0,0.06)]"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-[8px]"
                        style={{ backgroundColor: `${color}14` }}
                      >
                        <Target className="h-5 w-5" style={{ color }} />
                      </div>
                      <div>
                        <h2 className="text-[16px] font-semibold tracking-tight text-[#1d1d1f]">
                          {obj.title}
                        </h2>
                        <span className="text-[12px] text-black/[0.36]">{obj.quarter}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[20px] font-semibold tabular-nums tracking-tight" style={{ color }}>
                        {avgPct}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {obj.keyResults.map((kr) => (
                      <KRCard key={kr.id} kr={kr} color={color} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </>
  )
}
