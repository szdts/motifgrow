'use client'

import { useDimensionStore } from '@/stores/dimension-store'
import { DimensionIcon } from '@/components/ui/dimension-icon'
import { Plus } from 'lucide-react'

export function DimensionTabs() {
  const { dimensions, activeDimensionId, setActiveDimension } = useDimensionStore()
  const activeId = activeDimensionId ?? 'all'

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setActiveDimension(null)}
        className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium tracking-[-0.01em] transition-all duration-200 ${
          activeId === 'all'
            ? 'bg-[#1d1d1f] text-white shadow-[0_1px_3px_rgba(0,0,0,0.12)]'
            : 'text-[rgba(0,0,0,0.48)] hover:text-[#1d1d1f] hover:bg-black/[0.04]'
        }`}
      >
        全部
      </button>
      {dimensions.map((dim) => (
        <button
          key={dim.id}
          onClick={() => setActiveDimension(dim.id)}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium tracking-[-0.01em] transition-all duration-200 ${
            activeId === dim.id
              ? 'text-white shadow-[0_1px_3px_rgba(0,0,0,0.12)]'
              : 'text-[rgba(0,0,0,0.48)] hover:text-[#1d1d1f] hover:bg-black/[0.04]'
          }`}
          style={activeId === dim.id ? { backgroundColor: dim.color } : undefined}
        >
          <DimensionIcon name={dim.icon} size={14} strokeWidth={activeId === dim.id ? 2 : 1.5} />
          {dim.name}
        </button>
      ))}
      <button className="w-7 h-7 flex items-center justify-center rounded-full text-[rgba(0,0,0,0.2)] hover:text-[rgba(0,0,0,0.48)] hover:bg-black/[0.04] transition-all duration-200">
        <Plus size={14} strokeWidth={1.5} />
      </button>
    </div>
  )
}
