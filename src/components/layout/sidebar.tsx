'use client'

import { useUIStore } from '@/stores/ui-store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

const mockQuotas = [
  { icon: '📚', name: '读书', current: 7.2, target: 10, unit: 'h', color: '#0071e3' },
  { icon: '🎬', name: '看片', current: 5, target: 10, unit: 'h', color: '#bf4800' },
  { icon: '💪', name: '健身', current: 4, target: 5, unit: '次', color: '#248a3d' },
]

const mockBacklog = [
  { title: '《三体》', focus: '深度', remaining: '6h', color: '#0071e3' },
  { title: '《沙丘2》', focus: '浅度', remaining: '2.5h', color: '#bf4800' },
  { title: '《鱿鱼游戏 S2》', focus: '放松', remaining: '6.5h', color: '#bf4800' },
]

export function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)

  if (!sidebarOpen) return null

  return (
    <aside className="w-60 shrink-0 border-r border-divider bg-surface-elevated">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-5">
          {/* Mini Calendar Placeholder */}
          <div>
            <div className="text-xs font-medium text-text-secondary mb-2">2026 年 5 月</div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-text-secondary">
              {['日','一','二','三','四','五','六'].map((d) => (
                <div key={d} className="py-0.5 font-medium">{d}</div>
              ))}
              {Array.from({ length: 31 }, (_, i) => (
                <div
                  key={i}
                  className={`py-0.5 rounded-full ${
                    i + 1 === 27
                      ? 'bg-dim-growth text-white font-medium'
                      : 'hover:bg-black/5 cursor-pointer'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Weekly Quotas */}
          <div>
            <div className="text-xs font-medium text-text-secondary mb-3">本周配额</div>
            <div className="space-y-3">
              {mockQuotas.map((q) => (
                <div key={q.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>
                      {q.icon} {q.name}
                    </span>
                    <span className="text-text-tertiary">
                      {q.current}/{q.target}{q.unit}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((q.current / q.target) * 100, 100)}%`,
                        backgroundColor: q.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Backlog Quick List */}
          <div>
            <div className="text-xs font-medium text-text-secondary mb-3">待消费</div>
            <div className="space-y-2">
              {mockBacklog.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-black/[0.03] cursor-pointer transition-colors"
                >
                  <div
                    className="w-1 h-6 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="min-w-0">
                    <div className="truncate text-text-primary">{item.title}</div>
                    <div className="text-text-tertiary">
                      {item.focus} · {item.remaining}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-2 w-full rounded-lg border border-dashed border-divider py-1.5 text-xs text-text-tertiary hover:text-text-secondary hover:border-text-tertiary transition-colors">
              + 添加内容
            </button>
          </div>
        </div>
      </ScrollArea>
    </aside>
  )
}
