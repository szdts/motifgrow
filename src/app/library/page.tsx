'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { useBacklogStore } from '@/stores/backlog-store'
import { useDimensionStore } from '@/stores/dimension-store'
import {
  BookOpen, Film, Tv, GraduationCap, Gamepad2, Layers,
  Plus, Search, X, Clock, Trash2, ChevronDown, ChevronUp,
} from 'lucide-react'
import type { BacklogItem, BacklogStatus, FocusLevel } from '@/types'
import { useState, useRef, useEffect } from 'react'

// ─── Constants ──────────────────────────────────────────────────────────────

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

const FOCUS_LABELS: Record<FocusLevel, string> = {
  deep: '深度',
  shallow: '浅度',
  relaxing: '放松',
}

const STATUS_FLOW: BacklogStatus[] = ['backlog', 'in_progress', 'completed']

const ALL_TYPES = ['all', 'book', 'movie', 'series', 'course', 'game', 'custom'] as const

const TYPE_FILTER_LABELS: Record<string, string> = {
  all: '全部',
  book: '书籍',
  movie: '电影',
  series: '剧集',
  course: '课程',
  game: '游戏',
  custom: '自定义',
}

// ─── ProgressModal ──────────────────────────────────────────────────────────

function ProgressModal({
  item,
  onClose,
}: {
  item: BacklogItem
  onClose: () => void
}) {
  const updateItem = useBacklogStore((s) => s.updateItem)
  const [minutes, setMinutes] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSave = () => {
    const mins = parseInt(minutes, 10)
    if (isNaN(mins) || mins <= 0) return
    const newConsumed = Math.min(
      item.consumedDurationMinutes + mins,
      item.totalDurationMinutes
    )
    const updates: Partial<BacklogItem> = { consumedDurationMinutes: newConsumed }
    if (newConsumed >= item.totalDurationMinutes) {
      updates.status = 'completed'
    } else if (item.status === 'backlog') {
      updates.status = 'in_progress'
    }
    updateItem(item.id, updates)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      <div
        className="relative w-full max-w-[340px] rounded-[12px] bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-[#1d1d1f]">打卡进度</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-black/30 hover:text-black/60 hover:bg-black/[0.04] transition-colors">
            <X size={16} />
          </button>
        </div>
        <p className="text-[13px] text-black/[0.48] mb-4">
          {item.title} — 已消费 {Math.floor(item.consumedDurationMinutes / 60)}h{item.consumedDurationMinutes % 60}m / 共 {Math.floor(item.totalDurationMinutes / 60)}h{item.totalDurationMinutes % 60}m
        </p>
        <div className="mb-4">
          <label className="block text-[12px] text-black/[0.48] mb-1.5">本次消费时长（分钟）</label>
          <input
            ref={inputRef}
            type="number"
            min={1}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
            placeholder="60"
            className="w-full rounded-lg border border-black/[0.08] bg-[#f5f5f7] px-3 py-2 text-[14px] text-[#1d1d1f] placeholder:text-black/[0.24] outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg border border-black/[0.08] py-2 text-[13px] font-medium text-black/[0.48] hover:bg-black/[0.02] transition-colors">
            取消
          </button>
          <button onClick={handleSave} className="flex-1 rounded-lg bg-[#0071e3] py-2 text-[13px] font-medium text-white hover:bg-[#0077ED] transition-colors">
            保存
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── DeleteConfirmModal ─────────────────────────────────────────────────────

function DeleteConfirmModal({
  itemTitle,
  onConfirm,
  onClose,
}: {
  itemTitle: string
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      <div
        className="relative w-full max-w-[340px] rounded-[12px] bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-2">确认删除</h3>
        <p className="text-[13px] text-black/[0.48] mb-5">
          确定要删除「{itemTitle}」吗？此操作不可撤销。
        </p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg border border-black/[0.08] py-2 text-[13px] font-medium text-black/[0.48] hover:bg-black/[0.02] transition-colors">
            取消
          </button>
          <button onClick={onConfirm} className="flex-1 rounded-lg bg-[#ff3b30] py-2 text-[13px] font-medium text-white hover:bg-[#ff453a] transition-colors">
            删除
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── DetailModal ────────────────────────────────────────────────────────────

function DetailModal({
  item,
  onClose,
}: {
  item: BacklogItem
  onClose: () => void
}) {
  const updateItem = useBacklogStore((s) => s.updateItem)
  const removeItem = useBacklogStore((s) => s.removeItem)
  const dimensions = useDimensionStore((s) => s.dimensions)
  const dim = dimensions.find((d) => d.id === item.dimensionId)
  const color = dim?.color ?? '#86868b'
  const Icon = TYPE_ICONS[item.type]
  const pct = item.totalDurationMinutes > 0
    ? Math.round((item.consumedDurationMinutes / item.totalDurationMinutes) * 100)
    : 0

  const [showProgress, setShowProgress] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleStatusChange = (newStatus: BacklogStatus) => {
    updateItem(item.id, { status: newStatus })
  }

  const handleFocusChange = (level: FocusLevel) => {
    updateItem(item.id, { focusLevel: level, focusLevelSource: 'manual' })
  }

  const handleDelete = () => {
    removeItem(item.id)
    onClose()
  }

  if (showProgress) {
    return <ProgressModal item={item} onClose={() => setShowProgress(false)} />
  }

  if (showDeleteConfirm) {
    return (
      <DeleteConfirmModal
        itemTitle={item.title}
        onConfirm={handleDelete}
        onClose={() => setShowDeleteConfirm(false)}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      <div
        className="relative w-full max-w-[420px] rounded-[12px] bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-[8px]"
              style={{ backgroundColor: `${color}14` }}
            >
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-[#1d1d1f]">{item.title}</h3>
              <span className="text-[12px] text-black/[0.36]">
                {TYPE_LABELS[item.type]}{item.genre.length > 0 ? ` · ${item.genre.join(' / ')}` : ''}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-black/30 hover:text-black/60 hover:bg-black/[0.04] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-[12px] mb-1.5">
            <span className="text-black/[0.36]">进度</span>
            <span className="text-black/[0.48] tabular-nums">{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-black/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${pct}%`, backgroundColor: color }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-black/[0.36] mt-1">
            <span>已消费 {Math.floor(item.consumedDurationMinutes / 60)}h{item.consumedDurationMinutes % 60}m</span>
            <span>共 {Math.floor(item.totalDurationMinutes / 60)}h{item.totalDurationMinutes % 60}m</span>
          </div>
        </div>

        {/* Status */}
        <div className="mb-5">
          <label className="block text-[12px] text-black/[0.48] mb-2">状态</label>
          <div className="flex gap-2">
            {STATUS_FLOW.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className="flex-1 rounded-lg py-1.5 text-[12px] font-medium transition-all"
                style={{
                  backgroundColor: item.status === s ? `${color}14` : 'rgba(0,0,0,0.03)',
                  color: item.status === s ? color : 'rgba(0,0,0,0.36)',
                  border: item.status === s ? `1px solid ${color}30` : '1px solid transparent',
                }}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Focus Level */}
        <div className="mb-5">
          <label className="block text-[12px] text-black/[0.48] mb-2">专注档位</label>
          <div className="flex gap-2">
            {(['deep', 'shallow', 'relaxing'] as const).map((level) => (
              <button
                key={level}
                onClick={() => handleFocusChange(level)}
                className="flex-1 rounded-lg py-1.5 text-[12px] font-medium transition-all"
                style={{
                  backgroundColor: item.focusLevel === level ? '#0071e314' : 'rgba(0,0,0,0.03)',
                  color: item.focusLevel === level ? '#0071e3' : 'rgba(0,0,0,0.36)',
                  border: item.focusLevel === level ? '1px solid #0071e330' : '1px solid transparent',
                }}
              >
                {FOCUS_LABELS[level]}
              </button>
            ))}
          </div>
        </div>

        {/* Dimension info */}
        {dim && (
          <div className="mb-5 flex items-center gap-2">
            <span className="text-[12px] text-black/[0.36]">维度:</span>
            <span
              className="rounded-[980px] px-2 py-0.5 text-[11px] font-medium"
              style={{ backgroundColor: `${color}14`, color }}
            >
              {dim.name}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowProgress(true)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[#0071e3] py-2.5 text-[13px] font-medium text-white hover:bg-[#0077ED] transition-colors"
          >
            <Clock size={14} />
            打卡进度
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center w-10 rounded-lg border border-black/[0.08] text-black/[0.36] hover:text-[#ff3b30] hover:border-[#ff3b30]/30 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── AddItemModal ───────────────────────────────────────────────────────────

function AddItemModal({ onClose }: { onClose: () => void }) {
  const addItem = useBacklogStore((s) => s.addItem)
  const items = useBacklogStore((s) => s.items)
  const dimensions = useDimensionStore((s) => s.dimensions)

  const [title, setTitle] = useState('')
  const [type, setType] = useState<BacklogItem['type']>('book')
  const [dimensionId, setDimensionId] = useState(dimensions[0]?.id ?? '')
  const [hours, setHours] = useState('')
  const [mins, setMins] = useState('')
  const [focusLevel, setFocusLevel] = useState<FocusLevel>('deep')
  const [genreStr, setGenreStr] = useState('')
  const [titleError, setTitleError] = useState(false)

  const handleSave = () => {
    if (!title.trim()) {
      setTitleError(true)
      return
    }
    const totalMinutes = (parseInt(hours, 10) || 0) * 60 + (parseInt(mins, 10) || 0)
    const genre = genreStr
      .split(/[,，]/)
      .map((s) => s.trim())
      .filter(Boolean)
    const newItem: BacklogItem = {
      id: crypto.randomUUID(),
      dimensionId,
      keyResultId: null,
      title: title.trim(),
      type,
      posterUrl: null,
      genre,
      totalDurationMinutes: totalMinutes,
      consumedDurationMinutes: 0,
      focusLevel,
      focusLevelSource: 'manual',
      prioritySort: items.length,
      status: 'backlog',
    }
    addItem(newItem)
    onClose()
  }

  const typeOptions: BacklogItem['type'][] = ['book', 'movie', 'series', 'course', 'game', 'custom']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      <div
        className="relative w-full max-w-[440px] rounded-[12px] bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-semibold text-[#1d1d1f]">添加内容</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-black/30 hover:text-black/60 hover:bg-black/[0.04] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-[12px] text-black/[0.48] mb-1.5">标题 *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setTitleError(false) }}
            placeholder="书名、电影名..."
            className={`w-full rounded-lg border px-3 py-2 text-[14px] text-[#1d1d1f] placeholder:text-black/[0.24] outline-none transition-all ${
              titleError
                ? 'border-[#ff3b30] bg-[#ff3b30]/[0.04] focus:ring-2 focus:ring-[#ff3b30]/20'
                : 'border-black/[0.08] bg-[#f5f5f7] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20'
            }`}
          />
          {titleError && (
            <p className="mt-1 text-[11px] text-[#ff3b30]">请输入标题</p>
          )}
        </div>

        {/* Type */}
        <div className="mb-4">
          <label className="block text-[12px] text-black/[0.48] mb-1.5">类型</label>
          <div className="flex gap-1.5 flex-wrap">
            {typeOptions.map((t) => {
              const TypeIcon = TYPE_ICONS[t]
              const isActive = type === t
              return (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all"
                  style={{
                    backgroundColor: isActive ? '#0071e3' : 'rgba(0,0,0,0.04)',
                    color: isActive ? '#fff' : 'rgba(0,0,0,0.48)',
                  }}
                >
                  <TypeIcon size={14} />
                  {TYPE_LABELS[t]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Dimension */}
        <div className="mb-4">
          <label className="block text-[12px] text-black/[0.48] mb-1.5">维度</label>
          <div className="relative">
            <select
              value={dimensionId}
              onChange={(e) => setDimensionId(e.target.value)}
              className="w-full appearance-none rounded-lg border border-black/[0.08] bg-[#f5f5f7] px-3 py-2 pr-8 text-[14px] text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
            >
              {dimensions.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black/[0.36]" />
          </div>
        </div>

        {/* Duration */}
        <div className="mb-4">
          <label className="block text-[12px] text-black/[0.48] mb-1.5">总时长</label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="number"
                min={0}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-black/[0.08] bg-[#f5f5f7] px-3 py-2 pr-8 text-[14px] text-[#1d1d1f] placeholder:text-black/[0.24] outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-black/[0.36]">时</span>
            </div>
            <div className="flex-1 relative">
              <input
                type="number"
                min={0}
                max={59}
                value={mins}
                onChange={(e) => setMins(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-black/[0.08] bg-[#f5f5f7] px-3 py-2 pr-8 text-[14px] text-[#1d1d1f] placeholder:text-black/[0.24] outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-black/[0.36]">分</span>
            </div>
          </div>
        </div>

        {/* Focus Level */}
        <div className="mb-4">
          <label className="block text-[12px] text-black/[0.48] mb-1.5">专注档位</label>
          <div className="flex gap-2">
            {(['deep', 'shallow', 'relaxing'] as const).map((level) => {
              const isActive = focusLevel === level
              return (
                <button
                  key={level}
                  onClick={() => setFocusLevel(level)}
                  className="flex-1 rounded-lg py-2 text-[13px] font-medium transition-all"
                  style={{
                    backgroundColor: isActive ? '#0071e3' : 'rgba(0,0,0,0.04)',
                    color: isActive ? '#fff' : 'rgba(0,0,0,0.48)',
                  }}
                >
                  {FOCUS_LABELS[level]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Genre */}
        <div className="mb-6">
          <label className="block text-[12px] text-black/[0.48] mb-1.5">标签（逗号分隔）</label>
          <input
            type="text"
            value={genreStr}
            onChange={(e) => setGenreStr(e.target.value)}
            placeholder="科幻, 冒险, 编程"
            className="w-full rounded-lg border border-black/[0.08] bg-[#f5f5f7] px-3 py-2 text-[14px] text-[#1d1d1f] placeholder:text-black/[0.24] outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg border border-black/[0.08] py-2.5 text-[13px] font-medium text-black/[0.48] hover:bg-black/[0.02] transition-colors">
            取消
          </button>
          <button onClick={handleSave} className="flex-1 rounded-lg bg-[#0071e3] py-2.5 text-[13px] font-medium text-white hover:bg-[#0077ED] transition-colors">
            保存
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── LibraryCard ────────────────────────────────────────────────────────────

function LibraryCard({
  item,
  onOpenDetail,
}: {
  item: BacklogItem
  onOpenDetail: (item: BacklogItem) => void
}) {
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
    <div
      className="group rounded-[12px] bg-white p-5 transition-all hover:shadow-[0_3px_16px_rgba(0,0,0,0.08)] hover:translate-y-[-1px] cursor-pointer"
      onClick={() => onOpenDetail(item)}
    >
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
            backgroundColor: item.status === 'in_progress' ? `${color}14` : item.status === 'completed' ? '#248a3d14' : 'rgba(0,0,0,0.04)',
            color: item.status === 'in_progress' ? color : item.status === 'completed' ? '#248a3d' : 'rgba(0,0,0,0.48)',
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
            <span className="truncate">{item.genre.join(' / ')}</span>
          </>
        )}
      </div>

      {/* Focus level badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="rounded-[980px] px-2 py-0.5 text-[10px] font-medium bg-black/[0.04] text-black/[0.48]">
          {FOCUS_LABELS[item.focusLevel]}
        </span>
        {dim && (
          <span
            className="rounded-[980px] px-2 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: `${color}14`, color }}
          >
            {dim.name}
          </span>
        )}
      </div>

      {(item.status === 'in_progress' || item.status === 'completed') && (
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
                backgroundColor: item.status === 'completed' ? '#248a3d' : color,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── EmptyState ─────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="flex h-16 w-16 items-center justify-center rounded-[16px] bg-black/[0.04] mb-4">
        <Layers className="h-7 w-7 text-black/[0.24]" />
      </div>
      <h3 className="text-[16px] font-semibold text-[#1d1d1f] mb-1">还没有内容</h3>
      <p className="text-[13px] text-black/[0.36] mb-5 text-center max-w-[280px]">
        添加你想看的书、电影和课程，追踪消费进度
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-1.5 rounded-lg bg-[#0071e3] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#0077ED] transition-colors"
      >
        <Plus size={15} />
        添加内容
      </button>
    </div>
  )
}

// ─── SectionGroup ───────────────────────────────────────────────────────────

function SectionGroup({
  title,
  count,
  items,
  defaultCollapsed,
  onOpenDetail,
}: {
  title: string
  count: number
  items: BacklogItem[]
  defaultCollapsed?: boolean
  onOpenDetail: (item: BacklogItem) => void
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed ?? false)

  if (items.length === 0) return null

  return (
    <section className="mb-8">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 mb-4 group/header"
      >
        <h2 className="text-[11px] font-medium uppercase tracking-wider text-black/[0.48]">
          {title} ({count})
        </h2>
        {collapsed ? (
          <ChevronDown size={13} className="text-black/[0.24] group-hover/header:text-black/[0.48] transition-colors" />
        ) : (
          <ChevronUp size={13} className="text-black/[0.24] group-hover/header:text-black/[0.48] transition-colors" />
        )}
      </button>
      {!collapsed && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <LibraryCard key={item.id} item={item} onOpenDetail={onOpenDetail} />
          ))}
        </div>
      )}
    </section>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const items = useBacklogStore((s) => s.items)
  const searchQuery = useBacklogStore((s) => s.searchQuery)
  const setSearchQuery = useBacklogStore((s) => s.setSearchQuery)

  const [showAddModal, setShowAddModal] = useState(false)
  const [detailItem, setDetailItem] = useState<BacklogItem | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // Filter items
  const filtered = items.filter((item) => {
    if (typeFilter !== 'all' && item.type !== typeFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchTitle = item.title.toLowerCase().includes(q)
      const matchGenre = item.genre.some((g) => g.toLowerCase().includes(q))
      if (!matchTitle && !matchGenre) return false
    }
    return true
  })

  const inProgress = filtered.filter((i) => i.status === 'in_progress')
  const backlog = filtered.filter((i) => i.status === 'backlog')
  const completed = filtered.filter((i) => i.status === 'completed')

  const hasNoItems = items.length === 0
  const hasNoResults = !hasNoItems && filtered.length === 0

  // Sync detail item with store (in case it was updated/deleted)
  const currentDetailItem = detailItem
    ? items.find((i) => i.id === detailItem.id) ?? null
    : null

  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#f5f5f7]">
        <div className="px-8 py-7">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-[24px] font-semibold tracking-tight text-[#1d1d1f]">
              媒体库
            </h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-[#0071e3] px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-[#0077ED] transition-colors"
            >
              <Plus size={15} />
              添加内容
            </button>
          </div>
          <p className="text-[14px] text-black/[0.48] mb-5">
            管理你的书籍、影视、课程和游戏消费列表
          </p>

          {/* Search + Filters */}
          {!hasNoItems && (
            <div className="mb-6 space-y-3">
              {/* Search bar */}
              <div className="relative max-w-[360px]">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/[0.24]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索标题或标签..."
                  className="w-full rounded-lg border border-black/[0.08] bg-white pl-9 pr-3 py-2 text-[13px] text-[#1d1d1f] placeholder:text-black/[0.24] outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-black/[0.24] hover:text-black/[0.48] hover:bg-black/[0.04] transition-colors"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Type filter tabs */}
              <div className="flex items-center gap-1">
                {ALL_TYPES.map((t) => {
                  const isActive = typeFilter === t
                  const TypeIcon = t !== 'all' ? TYPE_ICONS[t as BacklogItem['type']] : null
                  return (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium tracking-[-0.01em] transition-all duration-200 ${
                        isActive
                          ? 'bg-[#1d1d1f] text-white shadow-[0_1px_3px_rgba(0,0,0,0.12)]'
                          : 'text-[rgba(0,0,0,0.48)] hover:text-[#1d1d1f] hover:bg-black/[0.04]'
                      }`}
                    >
                      {TypeIcon && <TypeIcon size={14} strokeWidth={isActive ? 2 : 1.5} />}
                      {TYPE_FILTER_LABELS[t]}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Content */}
          {hasNoItems ? (
            <EmptyState onAdd={() => setShowAddModal(true)} />
          ) : hasNoResults ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Search className="h-8 w-8 text-black/[0.16] mb-3" />
              <p className="text-[14px] text-black/[0.36]">没有找到匹配的内容</p>
            </div>
          ) : (
            <>
              <SectionGroup
                title="进行中"
                count={inProgress.length}
                items={inProgress}
                onOpenDetail={setDetailItem}
              />
              <SectionGroup
                title="待消费"
                count={backlog.length}
                items={backlog}
                onOpenDetail={setDetailItem}
              />
              <SectionGroup
                title="已完成"
                count={completed.length}
                items={completed}
                defaultCollapsed
                onOpenDetail={setDetailItem}
              />
            </>
          )}
        </div>
      </main>

      {/* Modals */}
      {showAddModal && <AddItemModal onClose={() => setShowAddModal(false)} />}
      {currentDetailItem && (
        <DetailModal item={currentDetailItem} onClose={() => setDetailItem(null)} />
      )}
    </>
  )
}
