'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { useOKRStore } from '@/stores/okr-store'
import { useDimensionStore } from '@/stores/dimension-store'
import {
  Target, Plus, X, MoreHorizontal, Trash2, Pencil,
  ChevronLeft, ChevronRight, ChevronDown, TrendingUp,
} from 'lucide-react'
import type { KeyResult, Objective } from '@/types'
import { useState, useRef, useEffect, useMemo } from 'react'

// ─── Quarter Utilities ─────────────────────────────────────────────────────

function getCurrentQuarter(): string {
  const now = new Date()
  const q = Math.ceil((now.getMonth() + 1) / 3)
  return `${now.getFullYear()}-Q${q}`
}

function shiftQuarter(quarter: string, delta: number): string {
  const match = quarter.match(/^(\d{4})-Q(\d)$/)
  if (!match) return quarter
  let year = parseInt(match[1], 10)
  let q = parseInt(match[2], 10) + delta
  while (q < 1) { q += 4; year -= 1 }
  while (q > 4) { q -= 4; year += 1 }
  return `${year}-Q${q}`
}

function formatQuarterLabel(quarter: string): string {
  const match = quarter.match(/^(\d{4})-Q(\d)$/)
  if (!match) return quarter
  return `${match[1]} 年第 ${match[2]} 季度`
}

// ─── DeleteConfirmModal ─────────────────────────────────────────────────────

function DeleteConfirmModal({
  title,
  onConfirm,
  onClose,
}: {
  title: string
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
          确定要删除「{title}」吗？此操作不可撤销。
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

// ─── AddObjectiveModal ──────────────────────────────────────────────────────

function AddObjectiveModal({
  defaultQuarter,
  onClose,
}: {
  defaultQuarter: string
  onClose: () => void
}) {
  const addObjective = useOKRStore((s) => s.addObjective)
  const dimensions = useDimensionStore((s) => s.dimensions)

  const quarters = useMemo(() => {
    const cq = getCurrentQuarter()
    return [
      shiftQuarter(cq, -1),
      cq,
      shiftQuarter(cq, 1),
      shiftQuarter(cq, 2),
    ]
  }, [])

  const [title, setTitle] = useState('')
  const [dimensionId, setDimensionId] = useState(dimensions[0]?.id ?? '')
  const [quarter, setQuarter] = useState(defaultQuarter)
  const [titleError, setTitleError] = useState(false)

  const handleSave = () => {
    if (!title.trim()) {
      setTitleError(true)
      return
    }
    const obj: Objective = {
      id: crypto.randomUUID(),
      dimensionId,
      title: title.trim(),
      quarter,
      keyResults: [],
    }
    addObjective(obj)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      <div
        className="relative w-full max-w-[420px] rounded-[12px] bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-semibold text-[#1d1d1f]">新建目标</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-black/30 hover:text-black/60 hover:bg-black/[0.04] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-[12px] text-black/[0.48] mb-1.5">目标标题 *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setTitleError(false) }}
            placeholder="例如：Q2 个人成长冲刺"
            className={`w-full rounded-lg border px-3 py-2 text-[14px] text-[#1d1d1f] placeholder:text-black/[0.24] outline-none transition-all ${
              titleError
                ? 'border-[#ff3b30] bg-[#ff3b30]/[0.04] focus:ring-2 focus:ring-[#ff3b30]/20'
                : 'border-black/[0.08] bg-[#f5f5f7] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20'
            }`}
          />
          {titleError && (
            <p className="mt-1 text-[11px] text-[#ff3b30]">请输入目标标题</p>
          )}
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

        {/* Quarter */}
        <div className="mb-6">
          <label className="block text-[12px] text-black/[0.48] mb-1.5">季度</label>
          <div className="flex gap-2">
            {quarters.map((q) => (
              <button
                key={q}
                onClick={() => setQuarter(q)}
                className="flex-1 rounded-lg py-1.5 text-[12px] font-medium transition-all"
                style={{
                  backgroundColor: quarter === q ? '#0071e3' : 'rgba(0,0,0,0.04)',
                  color: quarter === q ? '#fff' : 'rgba(0,0,0,0.48)',
                }}
              >
                {q.split('-')[1]}
              </button>
            ))}
          </div>
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

// ─── EditObjectiveTitleModal ────────────────────────────────────────────────

function EditObjectiveTitleModal({
  objective,
  onClose,
}: {
  objective: Objective
  onClose: () => void
}) {
  const updateObjective = useOKRStore((s) => s.updateObjective)
  const [title, setTitle] = useState(objective.title)

  const handleSave = () => {
    if (!title.trim()) return
    updateObjective(objective.id, { title: title.trim() })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      <div
        className="relative w-full max-w-[380px] rounded-[12px] bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-[#1d1d1f]">编辑目标标题</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-black/30 hover:text-black/60 hover:bg-black/[0.04] transition-colors">
            <X size={16} />
          </button>
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
          className="w-full rounded-lg border border-black/[0.08] bg-[#f5f5f7] px-3 py-2 text-[14px] text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all mb-4"
        />
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

// ─── AddKRModal ─────────────────────────────────────────────────────────────

function AddKRModal({
  objectiveId,
  onClose,
}: {
  objectiveId: string
  onClose: () => void
}) {
  const addKeyResult = useOKRStore((s) => s.addKeyResult)

  const [title, setTitle] = useState('')
  const [targetValue, setTargetValue] = useState('')
  const [unit, setUnit] = useState('')
  const [weeklyQuota, setWeeklyQuota] = useState('')
  const [titleError, setTitleError] = useState(false)

  const handleSave = () => {
    if (!title.trim()) {
      setTitleError(true)
      return
    }
    const kr: KeyResult = {
      id: crypto.randomUUID(),
      objectiveId,
      title: title.trim(),
      targetValue: parseFloat(targetValue) || 0,
      unit: unit.trim(),
      currentValue: 0,
      weeklyQuota: parseFloat(weeklyQuota) || 0,
    }
    addKeyResult(objectiveId, kr)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      <div
        className="relative w-full max-w-[420px] rounded-[12px] bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-semibold text-[#1d1d1f]">添加 Key Result</h3>
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
            placeholder="例如：读完 12 本书"
            className={`w-full rounded-lg border px-3 py-2 text-[14px] text-[#1d1d1f] placeholder:text-black/[0.24] outline-none transition-all ${
              titleError
                ? 'border-[#ff3b30] bg-[#ff3b30]/[0.04] focus:ring-2 focus:ring-[#ff3b30]/20'
                : 'border-black/[0.08] bg-[#f5f5f7] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20'
            }`}
          />
          {titleError && (
            <p className="mt-1 text-[11px] text-[#ff3b30]">请输入 KR 标题</p>
          )}
        </div>

        {/* Target + Unit */}
        <div className="mb-4 flex gap-3">
          <div className="flex-1">
            <label className="block text-[12px] text-black/[0.48] mb-1.5">目标值</label>
            <input
              type="number"
              min={0}
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="12"
              className="w-full rounded-lg border border-black/[0.08] bg-[#f5f5f7] px-3 py-2 text-[14px] text-[#1d1d1f] placeholder:text-black/[0.24] outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[12px] text-black/[0.48] mb-1.5">单位</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="本、次、km"
              className="w-full rounded-lg border border-black/[0.08] bg-[#f5f5f7] px-3 py-2 text-[14px] text-[#1d1d1f] placeholder:text-black/[0.24] outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
            />
          </div>
        </div>

        {/* Weekly Quota */}
        <div className="mb-6">
          <label className="block text-[12px] text-black/[0.48] mb-1.5">周配额</label>
          <input
            type="number"
            min={0}
            step={0.25}
            value={weeklyQuota}
            onChange={(e) => setWeeklyQuota(e.target.value)}
            placeholder="1"
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

// ─── EditKRModal ────────────────────────────────────────────────────────────

function EditKRModal({
  kr,
  onClose,
}: {
  kr: KeyResult
  onClose: () => void
}) {
  const updateKeyResult = useOKRStore((s) => s.updateKeyResult)

  const [title, setTitle] = useState(kr.title)
  const [targetValue, setTargetValue] = useState(String(kr.targetValue))
  const [unit, setUnit] = useState(kr.unit)
  const [currentValue, setCurrentValue] = useState(String(kr.currentValue))
  const [weeklyQuota, setWeeklyQuota] = useState(String(kr.weeklyQuota))

  const handleSave = () => {
    if (!title.trim()) return
    updateKeyResult(kr.id, {
      title: title.trim(),
      targetValue: parseFloat(targetValue) || 0,
      unit: unit.trim(),
      currentValue: parseFloat(currentValue) || 0,
      weeklyQuota: parseFloat(weeklyQuota) || 0,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      <div
        className="relative w-full max-w-[420px] rounded-[12px] bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-semibold text-[#1d1d1f]">编辑 Key Result</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-black/30 hover:text-black/60 hover:bg-black/[0.04] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-[12px] text-black/[0.48] mb-1.5">标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-black/[0.08] bg-[#f5f5f7] px-3 py-2 text-[14px] text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
          />
        </div>

        {/* Target + Unit */}
        <div className="mb-4 flex gap-3">
          <div className="flex-1">
            <label className="block text-[12px] text-black/[0.48] mb-1.5">目标值</label>
            <input
              type="number"
              min={0}
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              className="w-full rounded-lg border border-black/[0.08] bg-[#f5f5f7] px-3 py-2 text-[14px] text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[12px] text-black/[0.48] mb-1.5">单位</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full rounded-lg border border-black/[0.08] bg-[#f5f5f7] px-3 py-2 text-[14px] text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
            />
          </div>
        </div>

        {/* Current Value */}
        <div className="mb-4">
          <label className="block text-[12px] text-black/[0.48] mb-1.5">当前值</label>
          <input
            type="number"
            min={0}
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            className="w-full rounded-lg border border-black/[0.08] bg-[#f5f5f7] px-3 py-2 text-[14px] text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
          />
        </div>

        {/* Weekly Quota */}
        <div className="mb-6">
          <label className="block text-[12px] text-black/[0.48] mb-1.5">周配额</label>
          <input
            type="number"
            min={0}
            step={0.25}
            value={weeklyQuota}
            onChange={(e) => setWeeklyQuota(e.target.value)}
            className="w-full rounded-lg border border-black/[0.08] bg-[#f5f5f7] px-3 py-2 text-[14px] text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all"
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

// ─── InlineValueEditor ──────────────────────────────────────────────────────

function InlineValueEditor({
  value,
  onSave,
}: {
  value: number
  onSave: (v: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [inputVal, setInputVal] = useState(String(value))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  // Sync when value changes externally
  useEffect(() => {
    if (!editing) {
      setInputVal(String(value))
    }
  }, [value, editing])

  const handleConfirm = () => {
    const parsed = parseFloat(inputVal)
    if (!isNaN(parsed) && parsed >= 0) {
      onSave(parsed)
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        min={0}
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onBlur={handleConfirm}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleConfirm()
          if (e.key === 'Escape') setEditing(false)
        }}
        className="w-12 rounded border border-[#0071e3] bg-white px-1 py-0 text-[12px] text-[#1d1d1f] tabular-nums text-right outline-none focus:ring-2 focus:ring-[#0071e3]/20"
      />
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="tabular-nums text-[12px] text-black/[0.48] hover:text-[#0071e3] transition-colors cursor-text rounded px-0.5 hover:bg-[#0071e3]/[0.06]"
      title="点击编辑"
    >
      {value}
    </button>
  )
}

// ─── KRCard ─────────────────────────────────────────────────────────────────

function KRCard({
  kr,
  objectiveId,
  color,
}: {
  kr: KeyResult
  objectiveId: string
  color: string
}) {
  const updateKeyResult = useOKRStore((s) => s.updateKeyResult)
  const removeKeyResult = useOKRStore((s) => s.removeKeyResult)
  const [showEditModal, setShowEditModal] = useState(false)

  const pct = kr.targetValue > 0
    ? Math.min(Math.round((kr.currentValue / kr.targetValue) * 100), 100)
    : 0

  const handleUpdateCurrentValue = (newVal: number) => {
    updateKeyResult(kr.id, { currentValue: newVal })
  }

  return (
    <>
      <div className="group rounded-[8px] bg-[#f5f5f7] px-4 py-3 hover:bg-[#f0f0f2] transition-colors">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="text-[13px] text-[#1d1d1f] hover:text-[#0071e3] transition-colors text-left"
          >
            {kr.title}
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-black/[0.48] tabular-nums">
              <InlineValueEditor value={kr.currentValue} onSave={handleUpdateCurrentValue} />
              {' '}/ {kr.targetValue} {kr.unit}
            </span>
            <button
              onClick={() => removeKeyResult(objectiveId, kr.id)}
              className="w-5 h-5 flex items-center justify-center rounded text-black/[0.16] opacity-0 group-hover:opacity-100 hover:text-[#ff3b30] hover:bg-[#ff3b30]/[0.08] transition-all"
              title="删除 KR"
            >
              <X size={12} />
            </button>
          </div>
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
      {showEditModal && (
        <EditKRModal kr={kr} onClose={() => setShowEditModal(false)} />
      )}
    </>
  )
}

// ─── ObjectiveMenu ──────────────────────────────────────────────────────────

function ObjectiveMenu({
  onEditTitle,
  onDelete,
}: {
  onEditTitle: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-black/[0.24] hover:text-black/[0.48] hover:bg-black/[0.04] transition-colors"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-20 w-[140px] rounded-[10px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-black/[0.06] py-1 overflow-hidden">
          <button
            onClick={() => { setOpen(false); onEditTitle() }}
            className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
          >
            <Pencil size={13} />
            编辑标题
          </button>
          <button
            onClick={() => { setOpen(false); onDelete() }}
            className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-[#ff3b30] hover:bg-[#ff3b30]/[0.04] transition-colors"
          >
            <Trash2 size={13} />
            删除目标
          </button>
        </div>
      )}
    </div>
  )
}

// ─── WeeklyQuotaOverview ───────────────────────────────────────────────────

interface QuotaSummary {
  dimensionId: string
  dimensionName: string
  dimensionColor: string
  totalWeeklyQuota: number
  totalCurrent: number
  totalTarget: number
  unit: string
}

function WeeklyQuotaOverview({ objectives }: { objectives: Objective[] }) {
  const dimensions = useDimensionStore((s) => s.dimensions)

  const quotas = useMemo(() => {
    const map = new Map<string, QuotaSummary>()
    for (const obj of objectives) {
      const dim = dimensions.find((d) => d.id === obj.dimensionId)
      if (!dim) continue
      for (const kr of obj.keyResults) {
        if (kr.weeklyQuota <= 0) continue
        const existing = map.get(obj.dimensionId)
        if (existing) {
          existing.totalWeeklyQuota += kr.weeklyQuota
          existing.totalCurrent += kr.currentValue
          existing.totalTarget += kr.targetValue
        } else {
          map.set(obj.dimensionId, {
            dimensionId: obj.dimensionId,
            dimensionName: dim.name,
            dimensionColor: dim.color,
            totalWeeklyQuota: kr.weeklyQuota,
            totalCurrent: kr.currentValue,
            totalTarget: kr.targetValue,
            unit: kr.unit,
          })
        }
      }
    }
    return Array.from(map.values())
  }, [objectives, dimensions])

  if (quotas.length === 0) return null

  return (
    <div className="rounded-[12px] bg-white p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={15} className="text-black/[0.36]" />
        <h2 className="text-[11px] font-medium uppercase tracking-wider text-black/[0.48]">
          周配额总览
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quotas.map((q) => {
          const overallPct = q.totalTarget > 0
            ? Math.min(Math.round((q.totalCurrent / q.totalTarget) * 100), 100)
            : 0
          return (
            <div key={q.dimensionId} className="rounded-[8px] bg-[#f5f5f7] px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-medium text-[#1d1d1f]">{q.dimensionName}</span>
                <span className="text-[11px] font-medium tabular-nums" style={{ color: q.dimensionColor }}>
                  {overallPct}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-black/[0.06] overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${overallPct}%`, backgroundColor: q.dimensionColor }}
                />
              </div>
              <span className="text-[11px] text-black/[0.36]">
                每周 {q.totalWeeklyQuota} {q.unit}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── EmptyState ─────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="flex h-16 w-16 items-center justify-center rounded-[16px] bg-black/[0.04] mb-4">
        <Target className="h-7 w-7 text-black/[0.24]" />
      </div>
      <h3 className="text-[16px] font-semibold text-[#1d1d1f] mb-1">还没有设定目标</h3>
      <p className="text-[13px] text-black/[0.36] mb-5 text-center max-w-[280px]">
        创建季度 OKR，量化你的成长轨迹
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-1.5 rounded-lg bg-[#0071e3] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#0077ED] transition-colors"
      >
        <Plus size={15} />
        新建目标
      </button>
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function GoalsPage() {
  const objectives = useOKRStore((s) => s.objectives)
  const dimensions = useDimensionStore((s) => s.dimensions)
  const removeObjective = useOKRStore((s) => s.removeObjective)

  const [selectedQuarter, setSelectedQuarter] = useState(getCurrentQuarter)
  const [showAddObjective, setShowAddObjective] = useState(false)
  const [addKRObjectiveId, setAddKRObjectiveId] = useState<string | null>(null)
  const [editTitleObjective, setEditTitleObjective] = useState<Objective | null>(null)
  const [deleteObjective, setDeleteObjective] = useState<Objective | null>(null)

  // Filter objectives by selected quarter
  const filtered = objectives.filter((o) => o.quarter === selectedQuarter)
  const hasNoObjectives = objectives.length === 0

  // Check if there are objectives in adjacent quarters (for navigation hint)
  const prevQuarter = shiftQuarter(selectedQuarter, -1)
  const nextQuarter = shiftQuarter(selectedQuarter, 1)

  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#f5f5f7]">
        <div className="px-8 py-7">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-[24px] font-semibold tracking-tight text-[#1d1d1f]">
              目标
            </h1>
            <button
              onClick={() => setShowAddObjective(true)}
              className="flex items-center gap-1.5 rounded-lg bg-[#0071e3] px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-[#0077ED] transition-colors"
            >
              <Plus size={15} />
              新建目标
            </button>
          </div>
          <p className="text-[14px] text-black/[0.48] mb-5">
            跟踪你的季度 OKR 进度
          </p>

          {/* Quarter selector with left/right navigation */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setSelectedQuarter(prevQuarter)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-black/[0.36] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
              title={prevQuarter}
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex flex-col items-center min-w-[160px]">
              <span className="text-[17px] font-semibold tracking-tight text-[#1d1d1f]">
                {selectedQuarter}
              </span>
              <span className="text-[11px] text-black/[0.36]">
                {formatQuarterLabel(selectedQuarter)}
              </span>
            </div>
            <button
              onClick={() => setSelectedQuarter(nextQuarter)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-black/[0.36] hover:text-[#1d1d1f] hover:bg-black/[0.04] transition-colors"
              title={nextQuarter}
            >
              <ChevronRight size={18} />
            </button>
            {selectedQuarter !== getCurrentQuarter() && (
              <button
                onClick={() => setSelectedQuarter(getCurrentQuarter())}
                className="rounded-[980px] px-2.5 py-0.5 text-[11px] font-medium text-[#0071e3] bg-[#0071e3]/[0.08] hover:bg-[#0071e3]/[0.14] transition-colors"
              >
                回到本季度
              </button>
            )}
          </div>

          {/* Weekly Quota Overview */}
          {filtered.length > 0 && (
            <WeeklyQuotaOverview objectives={filtered} />
          )}

          {/* Content */}
          {hasNoObjectives ? (
            <EmptyState onAdd={() => setShowAddObjective(true)} />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Target className="h-8 w-8 text-black/[0.16] mb-3" />
              <p className="text-[14px] text-black/[0.36] mb-4">该季度没有目标</p>
              <button
                onClick={() => setShowAddObjective(true)}
                className="flex items-center gap-1.5 rounded-lg border border-black/[0.08] px-3.5 py-1.5 text-[13px] font-medium text-black/[0.48] hover:text-[#1d1d1f] hover:bg-black/[0.02] transition-colors"
              >
                <Plus size={14} />
                为 {selectedQuarter} 添加目标
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {filtered.map((obj) => {
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
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] text-black/[0.36]">{obj.quarter}</span>
                            {dim && (
                              <span
                                className="rounded-[980px] px-1.5 py-0 text-[10px] font-medium"
                                style={{ backgroundColor: `${color}14`, color }}
                              >
                                {dim.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[20px] font-semibold tabular-nums tracking-tight" style={{ color }}>
                          {avgPct}%
                        </span>
                        <ObjectiveMenu
                          onEditTitle={() => setEditTitleObjective(obj)}
                          onDelete={() => setDeleteObjective(obj)}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      {obj.keyResults.map((kr) => (
                        <KRCard key={kr.id} kr={kr} objectiveId={obj.id} color={color} />
                      ))}
                    </div>

                    {/* Add KR button */}
                    <button
                      onClick={() => setAddKRObjectiveId(obj.id)}
                      className="mt-3 w-full flex items-center justify-center gap-1 rounded-[8px] border border-dashed border-black/[0.08] py-2 text-[12px] text-black/[0.30] hover:text-black/[0.50] hover:border-black/[0.15] hover:bg-black/[0.015] transition-all"
                    >
                      <Plus size={13} strokeWidth={1.5} />
                      添加 KR
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showAddObjective && (
        <AddObjectiveModal
          defaultQuarter={selectedQuarter}
          onClose={() => setShowAddObjective(false)}
        />
      )}
      {addKRObjectiveId && (
        <AddKRModal objectiveId={addKRObjectiveId} onClose={() => setAddKRObjectiveId(null)} />
      )}
      {editTitleObjective && (
        <EditObjectiveTitleModal
          objective={editTitleObjective}
          onClose={() => setEditTitleObjective(null)}
        />
      )}
      {deleteObjective && (
        <DeleteConfirmModal
          title={deleteObjective.title}
          onConfirm={() => {
            removeObjective(deleteObjective.id)
            setDeleteObjective(null)
          }}
          onClose={() => setDeleteObjective(null)}
        />
      )}
    </>
  )
}
