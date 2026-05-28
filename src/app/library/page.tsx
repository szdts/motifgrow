'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { useBacklogStore } from '@/stores/backlog-store'
import { useDimensionStore } from '@/stores/dimension-store'
import { BookOpen, Film, Tv, GraduationCap, Gamepad2, Layers } from 'lucide-react'
import type { BacklogItem } from '@/types'

const TYPE_ICONS: Record<BacklogItem['type'], typeof BookOpen> = {
  book: BookOpen,
  movie: Film,
  series: Tv,
  course: GraduationCap,
  game: Gamepad2,
  custom: Layers,
}

const TYPE_LABELS: Record<BacklogItem['type'], string> = {
  book: '书籍',
  movie: '电影',
  series: '剧集',
  course: '课程',
  game: '游戏',
  custom: '自定义',
}

const STATUS_LABELS: Record<string, string> = {
  backlog: '待开始',
  in_progress: '进行中',
  completed: '已完成',
  dropped: '已放弃',
}

function LibraryCard({ item }: { item: BacklogItem }) {
  const dimensions = useDimensionStore((s) => s.dimensions)
  const dim = dimensions.find((d) => d.id === item.dimensionId)
  const color = dim?.color ?? '#86868b'
  const Icon = TYPE_ICONS[item.type]
  const pct = item.totalDurationMinutes > 0
    ? Math.round((item.consumedDurationMinutes / item.totalDurationMinutes) * 100)
    : 0
  const totalH = Math.floor(item.totalDurationMinutes / 60)
  const totalM = item.totalDurationMinutes % 60
  const durationLabel = totalH > 0 ? `${totalH}h${totalM > 0 ? ` ${totalM}m` : ''}` : `${totalM}m`

  return (
    <div className="group rounded-[12px] bg-white p-5 transition-all hover:shadow-[0_3px_16px_rgba(0,0,0,0.08)] hover:translate-y-[-1px] cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-[8px]"
          style={{ backgroundColor: `${color}14` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <span
          className="rounded-[980px] px-2.5 py-0.5 text-[11px] font-medium"
          style={{
            backgroundColor: item.status === 'in_progress' ? `${color}14` : 'rgba(0,0,0,0.04)',
            color: item.status === 'in_progress' ? color : 'rgba(0,0,0,0.48)',
          }}
        >
          {STATUS_LABELS[item.status]}
        </span>
      </div>

      <h3 className="text-[15px] font-semibold tracking-tight text-[#1d1d1f] mb-1">
        {item.title}
      </h3>
      <div className="flex items-center gap-2 text-[12px] text-black/[0.48] mb-3">
        <span>{TYPE_LABELS[item.type]}</span>
        <span className="text-black/[0.12]">|</span>
        <span>{durationLabel}</span>
        {item.genre.length > 0 && (
          <>
            <span className="text-black/[0.12]">|</span>
            <span>{item.genre.join(' / ')}</span>
          </>
        )}
      </div>

      {item.status === 'in_progress' && (
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-black/[0.36]">进度</span>
            <span className="text-black/[0.48] tabular-nums">{pct}%</span>
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
        </div>
      )}
    </div>
  )
}

export default function LibraryPage() {
  const items = useBacklogStore((s) => s.items)
  const inProgress = items.filter((i) => i.status === 'in_progress')
  const backlog = items.filter((i) => i.status === 'backlog')

  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#f5f5f7]">
        <div className="px-8 py-7">
          <h1 className="text-[24px] font-semibold tracking-tight text-[#1d1d1f] mb-1">
            媒体库
          </h1>
          <p className="text-[14px] text-black/[0.48] mb-8">
            管理你的书籍、影视、课程和游戏消费列表
          </p>

          {inProgress.length > 0 && (
            <section className="mb-8">
              <h2 className="text-[11px] font-medium uppercase tracking-wider text-black/[0.48] mb-4">
                进行中
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {inProgress.map((item) => (
                  <LibraryCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {backlog.length > 0 && (
            <section>
              <h2 className="text-[11px] font-medium uppercase tracking-wider text-black/[0.48] mb-4">
                待消费
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {backlog.map((item) => (
                  <LibraryCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  )
}
