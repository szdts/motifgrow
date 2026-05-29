'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { useAuthStore } from '@/stores/auth-store'
import { useDimensionStore } from '@/stores/dimension-store'
import type { Dimension } from '@/types'
import {
  User,
  Crown,
  Pencil,
  Trash2,
  Plus,
  X,
  Calendar,
  Bell,
  LogOut,
  Zap,
  Layers,
  CalendarPlus,
  Headset,
} from 'lucide-react'

// ────────────────────────── Toggle Switch ──────────────────────────

interface ToggleSwitchProps {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}

function ToggleSwitch({ checked, onChange, label, description }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="min-w-0">
        <div className="text-[14px] text-[#1d1d1f]">{label}</div>
        {description && (
          <div className="text-[12px] text-black/[0.48] mt-0.5">
            {description}
          </div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-[31px] w-[51px] shrink-0 items-center rounded-full transition-colors duration-200 ${
          checked ? 'bg-[#0071e3]' : 'bg-black/[0.12]'
        }`}
      >
        <span
          className={`inline-block h-[27px] w-[27px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-[22px]' : 'translate-x-[2px]'
          }`}
        />
      </button>
    </div>
  )
}

// ────────────────────────── Radio Pill Group ──────────────────────────

interface RadioPillProps<T extends string> {
  options: { value: T; label: string }[]
  selected: T
  onChange: (v: T) => void
}

function RadioPillGroup<T extends string>({
  options,
  selected,
  onChange,
}: RadioPillProps<T>) {
  return (
    <div className="inline-flex rounded-lg bg-black/[0.06] p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-md px-4 py-1.5 text-[13px] font-medium transition-all ${
            selected === opt.value
              ? 'bg-white text-[#1d1d1f] shadow-sm'
              : 'text-black/[0.48] hover:text-black/[0.64]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ────────────────────────── Dimension Edit Modal ──────────────────────────

const ICON_OPTIONS = [
  'Briefcase',
  'BookOpen',
  'Film',
  'Dumbbell',
  'Music',
  'Code',
  'Heart',
  'Palette',
  'Globe',
  'Gamepad2',
  'GraduationCap',
  'Camera',
] as const

const COLOR_OPTIONS = [
  '#0071e3',
  '#248a3d',
  '#bf4800',
  '#ff3b30',
  '#86868b',
  '#5856d6',
  '#ff9500',
  '#30b0c7',
  '#ff2d55',
  '#64d2ff',
] as const

interface DimensionModalProps {
  dimension: Dimension | null
  onClose: () => void
  onSave: (data: { name: string; icon: string; color: string }) => void
}

function DimensionModal({ dimension, onClose, onSave }: DimensionModalProps) {
  const [name, setName] = useState(dimension?.name ?? '')
  const [icon, setIcon] = useState(dimension?.icon ?? ICON_OPTIONS[0])
  const [color, setColor] = useState(dimension?.color ?? COLOR_OPTIONS[0])

  const handleSubmit = () => {
    const trimmed = name.trim()
    if (trimmed.length === 0) return
    onSave({ name: trimmed, icon, color })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="w-full max-w-md rounded-[12px] bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-semibold text-[#1d1d1f]">
            {dimension ? '编辑维度' : '添加维度'}
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/[0.04] transition-colors"
          >
            <X className="h-4 w-4 text-black/[0.48]" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="text-[12px] font-medium text-black/[0.48] mb-1.5 block">
              名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：阅读、编程"
              className="w-full rounded-lg border border-black/[0.1] bg-[#f5f5f7] px-3 py-2 text-[14px] text-[#1d1d1f] outline-none transition-colors focus:border-[#0071e3] focus:bg-white placeholder:text-black/[0.24]"
            />
          </div>

          {/* Icon */}
          <div>
            <label className="text-[12px] font-medium text-black/[0.48] mb-2 block">
              图标
            </label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-[12px] transition-all ${
                    icon === ic
                      ? 'bg-[#0071e3] text-white ring-2 ring-[#0071e3]/30'
                      : 'bg-black/[0.04] text-black/[0.48] hover:bg-black/[0.08]'
                  }`}
                  title={ic}
                >
                  {ic.charAt(0)}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-[12px] font-medium text-black/[0.48] mb-2 block">
              颜色
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full transition-all ${
                    color === c
                      ? 'ring-2 ring-offset-2 ring-[#0071e3]'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-black/[0.1] px-4 py-2.5 text-[13px] font-medium text-[#1d1d1f] transition-colors hover:bg-black/[0.04]"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={name.trim().length === 0}
            className="flex-1 rounded-lg bg-[#0071e3] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#0077ED] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {dimension ? '保存' : '添加'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ────────────────────────── Delete Confirm Modal ──────────────────────────

interface DeleteConfirmProps {
  dimensionName: string
  onClose: () => void
  onConfirm: () => void
}

function DeleteConfirmModal({
  dimensionName,
  onClose,
  onConfirm,
}: DeleteConfirmProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-sm rounded-[12px] bg-white p-6 shadow-xl">
        <h3 className="text-[16px] font-semibold text-[#1d1d1f] mb-2">
          删除维度
        </h3>
        <p className="text-[14px] text-black/[0.48] mb-6">
          确定要删除「{dimensionName}」吗？相关的事件和待办项不会被删除，但将失去维度标记。
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-black/[0.1] px-4 py-2.5 text-[13px] font-medium text-[#1d1d1f] transition-colors hover:bg-black/[0.04]"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-[#ff3b30] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#e0342b]"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  )
}

// ────────────────────────── Settings Page ──────────────────────────

type CalendarDefaultView = 'day' | 'week' | 'month'
type WeekStart = 'sunday' | 'monday'

export default function SettingsPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const dimensions = useDimensionStore((s) => s.dimensions)
  const addDimension = useDimensionStore((s) => s.addDimension)
  const updateDimension = useDimensionStore((s) => s.updateDimension)
  const removeDimension = useDimensionStore((s) => s.removeDimension)

  // Calendar settings (local state, no backend yet)
  const [calendarView, setCalendarView] = useState<CalendarDefaultView>('week')
  const [weekStart, setWeekStart] = useState<WeekStart>('monday')

  // Google Calendar connection (mock)
  const [calendarConnected, setCalendarConnected] = useState(false)

  // Notification toggles (local state)
  const [notifyEvents, setNotifyEvents] = useState(true)
  const [notifyAI, setNotifyAI] = useState(true)
  const [notifyWeekly, setNotifyWeekly] = useState(true)

  // Dimension edit modal
  const [editingDim, setEditingDim] = useState<Dimension | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [deletingDim, setDeletingDim] = useState<Dimension | null>(null)

  const handleSaveDimension = useCallback(
    (data: { name: string; icon: string; color: string }) => {
      if (editingDim) {
        updateDimension(editingDim.id, data)
        setEditingDim(null)
      } else {
        addDimension({
          id: `dim-${Date.now()}`,
          name: data.name,
          icon: data.icon,
          color: data.color,
          sortOrder: dimensions.length,
        })
        setShowAddModal(false)
      }
    },
    [editingDim, dimensions.length, updateDimension, addDimension]
  )

  const handleDeleteDimension = useCallback(() => {
    if (deletingDim) {
      removeDimension(deletingDim.id)
      setDeletingDim(null)
    }
  }, [deletingDim, removeDimension])

  const handleLogout = useCallback(() => {
    logout()
    router.push('/login')
  }, [logout, router])

  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#f5f5f7]">
        <div className="px-8 py-7 max-w-2xl">
          <h1 className="text-[24px] font-semibold tracking-tight text-[#1d1d1f] mb-1">
            设置
          </h1>
          <p className="text-[14px] text-black/[0.48] mb-8">
            自定义你的 Motifgrow 体验
          </p>

          <div className="space-y-6">
            {/* ── Account Info ── */}
            <section>
              <h2 className="text-[11px] font-medium uppercase tracking-wider text-black/[0.48] mb-3 px-1">
                账号
              </h2>
              <div className="rounded-[12px] bg-white p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0071e3]/[0.1] shrink-0">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt=""
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-[#0071e3]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[16px] font-semibold text-[#1d1d1f] truncate">
                      {user?.name ?? '未登录'}
                    </div>
                    <div className="text-[13px] text-black/[0.48] truncate">
                      {user?.email ?? ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        user?.plan === 'pro'
                          ? 'bg-[#0071e3]/[0.1] text-[#0071e3]'
                          : 'bg-black/[0.06] text-black/[0.48]'
                      }`}
                    >
                      {user?.plan === 'pro' && (
                        <Crown className="h-3 w-3" />
                      )}
                      {user?.plan === 'pro' ? 'Pro' : 'Free'}
                    </span>
                    <button className="flex items-center gap-1 rounded-lg border border-black/[0.1] px-3 py-1.5 text-[12px] font-medium text-[#1d1d1f] transition-colors hover:bg-black/[0.04]">
                      <Pencil className="h-3 w-3" />
                      编辑资料
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Dimensions Management ── */}
            <section>
              <h2 className="text-[11px] font-medium uppercase tracking-wider text-black/[0.48] mb-3 px-1">
                维度管理
              </h2>
              <div className="rounded-[12px] bg-white overflow-hidden">
                {dimensions.map((dim, i) => (
                  <div key={dim.id}>
                    <div className="flex items-center gap-3 px-5 py-3.5">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[13px] font-medium text-white shrink-0"
                        style={{ backgroundColor: dim.color }}
                      >
                        {dim.icon.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] text-[#1d1d1f]">
                          {dim.name}
                        </div>
                      </div>
                      <div
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: dim.color }}
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setEditingDim(dim)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-black/[0.04]"
                        >
                          <Pencil className="h-3.5 w-3.5 text-black/[0.36]" />
                        </button>
                        <button
                          onClick={() => setDeletingDim(dim)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[#ff3b30]/[0.08]"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-[#ff3b30]/60" />
                        </button>
                      </div>
                    </div>
                    {i < dimensions.length - 1 && (
                      <div className="mx-5 h-px bg-black/[0.06]" />
                    )}
                  </div>
                ))}
                <div className="px-5 py-3">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-black/[0.12] py-2.5 text-[13px] font-medium text-black/[0.48] transition-colors hover:border-[#0071e3] hover:text-[#0071e3] hover:bg-[#0071e3]/[0.04]"
                  >
                    <Plus className="h-4 w-4" />
                    添加维度
                  </button>
                </div>
              </div>
            </section>

            {/* ── Calendar Settings ── */}
            <section>
              <h2 className="text-[11px] font-medium uppercase tracking-wider text-black/[0.48] mb-3 px-1">
                日历设置
              </h2>
              <div className="rounded-[12px] bg-white p-5 space-y-5">
                <div>
                  <div className="text-[14px] text-[#1d1d1f] mb-2.5">
                    默认视图
                  </div>
                  <RadioPillGroup
                    options={[
                      { value: 'day' as CalendarDefaultView, label: '日' },
                      { value: 'week' as CalendarDefaultView, label: '周' },
                      { value: 'month' as CalendarDefaultView, label: '月' },
                    ]}
                    selected={calendarView}
                    onChange={setCalendarView}
                  />
                </div>
                <div className="h-px bg-black/[0.06]" />
                <div>
                  <div className="text-[14px] text-[#1d1d1f] mb-2.5">
                    一周起始日
                  </div>
                  <RadioPillGroup
                    options={[
                      { value: 'sunday' as WeekStart, label: '周日' },
                      { value: 'monday' as WeekStart, label: '周一' },
                    ]}
                    selected={weekStart}
                    onChange={setWeekStart}
                  />
                </div>
                <div className="h-px bg-black/[0.06]" />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[14px] text-[#1d1d1f]">
                      Google Calendar
                    </div>
                    <div className={`text-[12px] mt-0.5 ${calendarConnected ? 'text-[#248a3d]' : 'text-black/[0.36]'}`}>
                      {calendarConnected ? '已连接' : '未连接'}
                    </div>
                  </div>
                  {calendarConnected ? (
                    <button
                      onClick={() => setCalendarConnected(false)}
                      className="rounded-lg border border-[#ff3b30]/20 px-3.5 py-1.5 text-[13px] font-medium text-[#ff3b30] transition-colors hover:bg-[#ff3b30]/[0.06]"
                    >
                      断开连接
                    </button>
                  ) : (
                    <button
                      onClick={() => setCalendarConnected(true)}
                      className="rounded-lg border border-black/[0.1] px-3.5 py-1.5 text-[13px] font-medium text-[#1d1d1f] transition-colors hover:bg-black/[0.04]"
                    >
                      连接
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* ── Notifications ── */}
            <section>
              <h2 className="text-[11px] font-medium uppercase tracking-wider text-black/[0.48] mb-3 px-1">
                通知设置
              </h2>
              <div className="rounded-[12px] bg-white px-5">
                <ToggleSwitch
                  checked={notifyEvents}
                  onChange={setNotifyEvents}
                  label="事件提醒"
                  description="在事件开始前发送通知"
                />
                <div className="h-px bg-black/[0.06]" />
                <ToggleSwitch
                  checked={notifyAI}
                  onChange={setNotifyAI}
                  label="AI 建议推送"
                  description="当 AI 生成新的日程建议时通知"
                />
                <div className="h-px bg-black/[0.06]" />
                <ToggleSwitch
                  checked={notifyWeekly}
                  onChange={setNotifyWeekly}
                  label="周报提醒"
                  description="每周日晚提醒查看本周回顾"
                />
              </div>
            </section>

            {/* ── Subscription ── */}
            <section>
              <h2 className="text-[11px] font-medium uppercase tracking-wider text-black/[0.48] mb-3 px-1">
                订阅管理
              </h2>
              <div className="rounded-[12px] bg-white p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[14px] font-medium text-[#1d1d1f]">
                      当前计划
                    </div>
                    <div className="text-[13px] text-black/[0.48] mt-0.5">
                      {user?.plan === 'pro' ? 'Pro 版' : 'Free 免费版'}
                    </div>
                  </div>
                  {user?.plan !== 'pro' && (
                    <a
                      href="/pricing"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#0071e3] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#0077ED]"
                    >
                      <Crown className="h-3.5 w-3.5" />
                      升级到 Pro
                    </a>
                  )}
                </div>
                <div className="rounded-[8px] bg-[#f5f5f7] p-4">
                  <div className="text-[12px] font-medium text-black/[0.48] mb-2.5">
                    Pro 特权
                  </div>
                  <div className="space-y-2">
                    {[
                      { icon: Zap, text: 'AI 智能调度' },
                      { icon: Layers, text: '无限维度' },
                      { icon: CalendarPlus, text: '日历导入' },
                      { icon: Headset, text: '优先支持' },
                    ].map(({ icon: Icon, text }) => (
                      <div
                        key={text}
                        className="flex items-center gap-2.5"
                      >
                        <Icon className="h-4 w-4 text-[#0071e3]" />
                        <span className="text-[13px] text-[#1d1d1f]">
                          {text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ── Danger Zone ── */}
            <section>
              <h2 className="text-[11px] font-medium uppercase tracking-wider text-[#ff3b30]/60 mb-3 px-1">
                危险操作
              </h2>
              <div className="rounded-[12px] border border-[#ff3b30]/[0.15] bg-white p-5 space-y-3">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#ff3b30]/20 px-4 py-2.5 text-[13px] font-medium text-[#ff3b30] transition-colors hover:bg-[#ff3b30]/[0.06]"
                >
                  <LogOut className="h-4 w-4" />
                  退出登录
                </button>
                <button
                  disabled
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-black/[0.08] px-4 py-2.5 text-[13px] font-medium text-black/[0.24] cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" />
                  删除账号
                </button>
              </div>
            </section>
          </div>

          {/* Version */}
          <div className="mt-10 mb-6 text-center">
            <p className="text-[12px] text-black/[0.24]">
              Motifgrow v0.1.0
            </p>
          </div>
        </div>
      </main>

      {/* Modals */}
      {(editingDim !== null || showAddModal) && (
        <DimensionModal
          dimension={editingDim}
          onClose={() => {
            setEditingDim(null)
            setShowAddModal(false)
          }}
          onSave={handleSaveDimension}
        />
      )}

      {deletingDim !== null && (
        <DeleteConfirmModal
          dimensionName={deletingDim.name}
          onClose={() => setDeletingDim(null)}
          onConfirm={handleDeleteDimension}
        />
      )}
    </>
  )
}
