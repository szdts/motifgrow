'use client'

import { useDimensionStore } from '@/stores/dimension-store'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function DimensionTabs() {
  const { dimensions, activeDimensionId, setActiveDimension } = useDimensionStore()

  return (
    <Tabs
      value={activeDimensionId ?? 'all'}
      onValueChange={(v) => setActiveDimension(v === 'all' ? null : v)}
    >
      <TabsList className="h-9 bg-transparent gap-1 p-0">
        <TabsTrigger
          value="all"
          className="rounded-lg px-3 py-1.5 text-sm data-[state=active]:bg-black/5 data-[state=active]:shadow-none"
        >
          全部
        </TabsTrigger>
        {dimensions.map((dim) => (
          <TabsTrigger
            key={dim.id}
            value={dim.id}
            className="rounded-lg px-3 py-1.5 text-sm data-[state=active]:bg-black/5 data-[state=active]:shadow-none"
          >
            <span className="mr-1">{dim.icon}</span>
            {dim.name}
          </TabsTrigger>
        ))}
        <button className="rounded-lg px-2 py-1.5 text-sm text-text-tertiary hover:text-text-secondary transition-colors">
          +
        </button>
      </TabsList>
    </Tabs>
  )
}
