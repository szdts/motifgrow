'use client'

import { useDimensionStore } from '@/stores/dimension-store'
import { DimensionIcon } from '@/components/ui/dimension-icon'
import { Plus, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const ICON_OPTIONS = ['Briefcase', 'BookOpen', 'Film', 'Dumbbell', 'Music', 'Palette', 'Heart', 'Star', 'Zap', 'Coffee', 'Gamepad2', 'Plane', 'ShoppingBag', 'Code', 'Camera']
const COLOR_OPTIONS = ['#86868b', '#0071e3', '#bf4800', '#248a3d', '#ff3b30', '#ff9500', '#5856d6', '#af52de', '#ff2d55', '#00c7be', '#34c759', '#007aff']

function CreateDimensionModal({ onClose }: { onClose: () => void }) {
  const addDimension = useDimensionStore((s) => s.addDimension)
  const dimensions = useDimensionStore((s) => s.dimensions)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('Star')
  const [color, setColor] = useState('#5856d6')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const handleSave = () => {
    if (!name.trim()) return
    addDimension({
      id: name.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      name: name.trim(),
      icon,
      color,
      sortOrder: dimensions.length,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div ref={ref} className="w-[340px] rounded-xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-black/[0.06] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-black/[0.06]">
          <span className="text-[15px] font-semibold text-[#1d1d1f] tracking-[-0.01em]">新建类型</span>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-full text-[rgba(0,0,0,0.3)] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors">
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="text-[11px] font-semibold tracking-[0.02em] uppercase text-[rgba(0,0,0,0.3)] mb-1.5 block">名称</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入类型名称"
              className="w-full rounded-lg border border-black/[0.08] px-3 py-2 text-[14px] text-[#1d1d1f] placeholder:text-[rgba(0,0,0,0.2)] outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]/20 transition-all"
              onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) handleSave() }}
            />
          </div>

          {/* Icon */}
          <div>
            <label className="text-[11px] font-semibold tracking-[0.02em] uppercase text-[rgba(0,0,0,0.3)] mb-1.5 block">图标</label>
            <div className="flex flex-wrap gap-1.5">
              {ICON_OPTIONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 ${
                    icon === ic
                      ? 'bg-[#0071e3]/10 text-[#0071e3] ring-1 ring-[#0071e3]/30'
                      : 'text-[rgba(0,0,0,0.4)] hover:bg-black/[0.04]'
                  }`}
                >
                  <DimensionIcon name={ic} size={16} strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-[11px] font-semibold tracking-[0.02em] uppercase text-[rgba(0,0,0,0.3)] mb-1.5 block">颜色</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all duration-150 ${
                    color === c ? 'ring-2 ring-offset-2 ring-black/20 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-black/[0.06] bg-[#fafafa]">
          <button onClick={onClose} className="rounded-lg px-4 py-1.5 text-[13px] font-medium text-[rgba(0,0,0,0.56)] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-all duration-150">
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="rounded-lg bg-[#0071e3] px-4 py-1.5 text-[13px] font-medium text-white hover:bg-[#0077ED] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
          >
            创建
          </button>
        </div>
      </div>
    </div>
  )
}

export function DimensionTabs() {
  const { dimensions, activeDimensionIds, toggleDimension, resetToAll } = useDimensionStore()
  const [showCreate, setShowCreate] = useState(false)
  const isAllActive = activeDimensionIds.length === 0

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          onClick={resetToAll}
          className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium tracking-[-0.01em] transition-all duration-200 ${
            isAllActive
              ? 'bg-[#1d1d1f] text-white shadow-[0_1px_3px_rgba(0,0,0,0.12)]'
              : 'text-[rgba(0,0,0,0.48)] hover:text-[#1d1d1f] hover:bg-black/[0.04]'
          }`}
        >
          全部
        </button>
        {dimensions.map((dim) => {
          const isActive = activeDimensionIds.includes(dim.id)
          return (
            <button
              key={dim.id}
              onClick={() => toggleDimension(dim.id)}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium tracking-[-0.01em] transition-all duration-200 ${
                isActive
                  ? 'text-white shadow-[0_1px_3px_rgba(0,0,0,0.12)]'
                  : 'text-[rgba(0,0,0,0.48)] hover:text-[#1d1d1f] hover:bg-black/[0.04]'
              }`}
              style={isActive ? { backgroundColor: dim.color } : undefined}
            >
              <DimensionIcon name={dim.icon} size={14} strokeWidth={isActive ? 2 : 1.5} />
              {dim.name}
            </button>
          )
        })}
        <button
          onClick={() => setShowCreate(true)}
          className="w-7 h-7 flex items-center justify-center rounded-full text-[rgba(0,0,0,0.2)] hover:text-[rgba(0,0,0,0.48)] hover:bg-black/[0.04] transition-all duration-200"
        >
          <Plus size={14} strokeWidth={1.5} />
        </button>
      </div>
      {showCreate && <CreateDimensionModal onClose={() => setShowCreate(false)} />}
    </>
  )
}
