'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  BookOpen,
  Film,
  Dumbbell,
  Plus,
  X,
  Target,
  Check,
  Sparkles,
} from 'lucide-react'

// ────────────────────────── Types ──────────────────────────

interface PresetDimension {
  id: string
  name: string
  icon: string
  color: string
  selected: boolean
}

interface KRDraft {
  title: string
  targetValue: string
  unit: string
}

interface GoalDraft {
  dimensionId: string
  title: string
  keyResults: KRDraft[]
}

interface ContentDraft {
  title: string
  type: string
}

// ────────────────────────── Constants ──────────────────────────

const TOTAL_STEPS = 5

const DEFAULT_DIMENSIONS: PresetDimension[] = [
  { id: 'work', name: '工作', icon: 'Briefcase', color: '#86868b', selected: true },
  { id: 'growth', name: '个人成长', icon: 'BookOpen', color: '#0071e3', selected: true },
  { id: 'entertainment', name: '娱乐', icon: 'Film', color: '#bf4800', selected: true },
  { id: 'fitness', name: '健身', icon: 'Dumbbell', color: '#248a3d', selected: true },
]

const DIMENSION_ICONS: Record<string, typeof Briefcase> = {
  Briefcase,
  BookOpen,
  Film,
  Dumbbell,
}

const SUGGESTED_CONTENT = [
  { title: '原子习惯', type: 'book', desc: '用微小改变获得惊人成果' },
  { title: '深度工作', type: 'book', desc: '在分心世界中专注成功' },
  { title: '人类简史', type: 'book', desc: '从动物到上帝的简明历史' },
] as const

const CONTENT_TYPES = [
  { value: 'book', label: '书籍' },
  { value: 'movie', label: '电影' },
  { value: 'series', label: '剧集' },
  { value: 'course', label: '课程' },
  { value: 'game', label: '游戏' },
  { value: 'custom', label: '其他' },
] as const

// ────────────────────────── Progress Bar ──────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
            i < current ? 'bg-[#0071e3]' : 'bg-black/[0.08]'
          }`}
        />
      ))}
    </div>
  )
}

// ────────────────────────── Confetti ──────────────────────────

function Confetti() {
  const [pieces] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      size: 4 + Math.random() * 6,
      color: ['#0071e3', '#248a3d', '#bf4800', '#ff3b30', '#5856d6', '#ff9500'][
        Math.floor(Math.random() * 6)
      ],
      rotation: Math.random() * 360,
    }))
  )

  return (
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            width: p.size,
            height: p.size * 1.5,
            backgroundColor: p.color,
            borderRadius: '1px',
            transform: `rotate(${p.rotation}deg)`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti-fall {
          animation: confetti-fall 3s ease-in forwards;
        }
      `}</style>
    </div>
  )
}

// ────────────────────────── Step Components ──────────────────────────

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0071e3]/[0.1] mb-8">
        <Sparkles className="h-9 w-9 text-[#0071e3]" />
      </div>
      <h1 className="text-[28px] font-bold tracking-[-0.04em] text-[#1d1d1f]">
        欢迎来到 Motifgrow
      </h1>
      <p className="mt-3 text-[16px] text-black/[0.48] max-w-sm leading-relaxed">
        让我们花 2 分钟设置你的专属调度器
      </p>
      <button
        onClick={onNext}
        className="mt-10 h-11 rounded-lg bg-[#0071e3] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#0077ed] active:bg-[#006adb]"
      >
        开始设置
      </button>
    </div>
  )
}

function StepDimensions({
  dimensions,
  onToggle,
  customName,
  onCustomNameChange,
  onAddCustom,
}: {
  dimensions: PresetDimension[]
  onToggle: (id: string) => void
  customName: string
  onCustomNameChange: (v: string) => void
  onAddCustom: () => void
}) {
  return (
    <div>
      <h2 className="text-[22px] font-bold tracking-[-0.03em] text-[#1d1d1f] text-center">
        选择你的生活维度
      </h2>
      <p className="mt-2 text-[14px] text-black/[0.48] text-center">
        维度帮助你平衡生活的各个方面
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3">
        {dimensions.map((dim) => {
          const IconComp = DIMENSION_ICONS[dim.icon]
          return (
            <button
              key={dim.id}
              onClick={() => onToggle(dim.id)}
              className={`relative flex items-center gap-3 rounded-[12px] border p-4 transition-all duration-200 ${
                dim.selected
                  ? 'border-[#0071e3] bg-[#0071e3]/[0.04]'
                  : 'border-black/[0.08] bg-white hover:border-black/[0.16]'
              }`}
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-[8px] shrink-0"
                style={{ backgroundColor: `${dim.color}15` }}
              >
                {IconComp ? (
                  <IconComp className="h-4.5 w-4.5" style={{ color: dim.color }} />
                ) : (
                  <span className="text-[14px] font-medium" style={{ color: dim.color }}>
                    {dim.name.charAt(0)}
                  </span>
                )}
              </div>
              <span className="text-[14px] font-medium text-[#1d1d1f]">
                {dim.name}
              </span>
              {dim.selected && (
                <div className="absolute top-2.5 right-2.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0071e3]">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Custom dimension */}
      <div className="mt-5 flex gap-2">
        <input
          type="text"
          value={customName}
          onChange={(e) => onCustomNameChange(e.target.value)}
          placeholder="添加自定义维度"
          className="flex-1 h-10 px-3 rounded-lg border border-black/[0.08] bg-white text-[14px] text-[#1d1d1f] placeholder:text-black/[0.24] outline-none transition-colors focus:border-[#0071e3]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customName.trim()) onAddCustom()
          }}
        />
        <button
          onClick={onAddCustom}
          disabled={!customName.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0071e3] text-white transition-colors hover:bg-[#0077ed] disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function StepGoals({
  dimensions,
  goal,
  onGoalChange,
}: {
  dimensions: PresetDimension[]
  goal: GoalDraft
  onGoalChange: (g: GoalDraft) => void
}) {
  const selected = dimensions.filter((d) => d.selected)

  const updateKR = (index: number, patch: Partial<KRDraft>) => {
    const updated = goal.keyResults.map((kr, i) =>
      i === index ? { ...kr, ...patch } : kr
    )
    onGoalChange({ ...goal, keyResults: updated })
  }

  const addKR = () => {
    if (goal.keyResults.length >= 3) return
    onGoalChange({
      ...goal,
      keyResults: [...goal.keyResults, { title: '', targetValue: '', unit: '' }],
    })
  }

  const removeKR = (index: number) => {
    onGoalChange({
      ...goal,
      keyResults: goal.keyResults.filter((_, i) => i !== index),
    })
  }

  return (
    <div>
      <h2 className="text-[22px] font-bold tracking-[-0.03em] text-[#1d1d1f] text-center">
        设定你的第一个目标
      </h2>
      <p className="mt-2 text-[14px] text-black/[0.48] text-center">
        目标让你保持方向感和动力
      </p>

      <div className="mt-8 space-y-5">
        {/* Dimension picker */}
        <div>
          <label className="text-[12px] font-medium text-black/[0.48] mb-1.5 block">
            选择维度
          </label>
          <div className="flex flex-wrap gap-2">
            {selected.map((dim) => (
              <button
                key={dim.id}
                onClick={() => onGoalChange({ ...goal, dimensionId: dim.id })}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all ${
                  goal.dimensionId === dim.id
                    ? 'text-white'
                    : 'bg-black/[0.04] text-black/[0.48] hover:bg-black/[0.08]'
                }`}
                style={
                  goal.dimensionId === dim.id
                    ? { backgroundColor: dim.color }
                    : undefined
                }
              >
                {dim.name}
              </button>
            ))}
          </div>
        </div>

        {/* Goal title */}
        <div>
          <label className="text-[12px] font-medium text-black/[0.48] mb-1.5 block">
            目标标题
          </label>
          <input
            type="text"
            value={goal.title}
            onChange={(e) => onGoalChange({ ...goal, title: e.target.value })}
            placeholder="如：本季度读完 5 本书"
            className="w-full h-10 px-3 rounded-lg border border-black/[0.08] bg-white text-[14px] text-[#1d1d1f] placeholder:text-black/[0.24] outline-none transition-colors focus:border-[#0071e3]"
          />
        </div>

        {/* Key Results */}
        <div>
          <label className="text-[12px] font-medium text-black/[0.48] mb-2 block">
            关键结果 (KR)
          </label>
          <div className="space-y-3">
            {goal.keyResults.map((kr, i) => (
              <div key={i} className="rounded-[10px] border border-black/[0.08] bg-[#f5f5f7] p-3">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={kr.title}
                    onChange={(e) => updateKR(i, { title: e.target.value })}
                    placeholder="KR 标题"
                    className="flex-1 h-8 px-2.5 rounded-md border border-black/[0.08] bg-white text-[13px] text-[#1d1d1f] placeholder:text-black/[0.24] outline-none focus:border-[#0071e3]"
                  />
                  <button
                    onClick={() => removeKR(i)}
                    className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-black/[0.06] transition-colors shrink-0"
                  >
                    <X className="h-3.5 w-3.5 text-black/[0.36]" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={kr.targetValue}
                    onChange={(e) => updateKR(i, { targetValue: e.target.value })}
                    placeholder="目标值"
                    className="w-24 h-8 px-2.5 rounded-md border border-black/[0.08] bg-white text-[13px] text-[#1d1d1f] placeholder:text-black/[0.24] outline-none focus:border-[#0071e3]"
                  />
                  <input
                    type="text"
                    value={kr.unit}
                    onChange={(e) => updateKR(i, { unit: e.target.value })}
                    placeholder="单位（本、小时…）"
                    className="flex-1 h-8 px-2.5 rounded-md border border-black/[0.08] bg-white text-[13px] text-[#1d1d1f] placeholder:text-black/[0.24] outline-none focus:border-[#0071e3]"
                  />
                </div>
              </div>
            ))}
            {goal.keyResults.length < 3 && (
              <button
                onClick={addKR}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-black/[0.12] py-2.5 text-[13px] font-medium text-black/[0.48] transition-colors hover:border-[#0071e3] hover:text-[#0071e3]"
              >
                <Plus className="h-3.5 w-3.5" />
                添加 KR
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StepContent({
  suggested,
  manual,
  onToggleSuggested,
  onManualChange,
  onAddManual,
}: {
  suggested: Record<string, boolean>
  manual: ContentDraft
  onToggleSuggested: (title: string) => void
  onManualChange: (v: ContentDraft) => void
  onAddManual: () => void
}) {
  return (
    <div>
      <h2 className="text-[22px] font-bold tracking-[-0.03em] text-[#1d1d1f] text-center">
        添加你想消费的内容
      </h2>
      <p className="mt-2 text-[14px] text-black/[0.48] text-center">
        书籍、电影、课程……交给调度器来安排
      </p>

      {/* Suggestions */}
      <div className="mt-8 space-y-3">
        <label className="text-[12px] font-medium text-black/[0.48] block">
          推荐内容
        </label>
        {SUGGESTED_CONTENT.map((item) => (
          <button
            key={item.title}
            onClick={() => onToggleSuggested(item.title)}
            className={`flex w-full items-center gap-4 rounded-[12px] border p-4 text-left transition-all ${
              suggested[item.title]
                ? 'border-[#0071e3] bg-[#0071e3]/[0.04]'
                : 'border-black/[0.08] bg-white hover:border-black/[0.16]'
            }`}
          >
            <div className="flex h-12 w-9 items-center justify-center rounded-[4px] bg-[#f5f5f7] shrink-0">
              <BookOpen className="h-4 w-4 text-black/[0.36]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-medium text-[#1d1d1f]">
                {item.title}
              </div>
              <div className="text-[12px] text-black/[0.48] mt-0.5">
                {item.desc}
              </div>
            </div>
            {suggested[item.title] && (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0071e3] shrink-0">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Manual add */}
      <div className="mt-6">
        <label className="text-[12px] font-medium text-black/[0.48] mb-2 block">
          手动添加
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={manual.title}
            onChange={(e) => onManualChange({ ...manual, title: e.target.value })}
            placeholder="标题"
            className="flex-1 h-10 px-3 rounded-lg border border-black/[0.08] bg-white text-[14px] text-[#1d1d1f] placeholder:text-black/[0.24] outline-none focus:border-[#0071e3]"
          />
          <select
            value={manual.type}
            onChange={(e) => onManualChange({ ...manual, type: e.target.value })}
            className="h-10 px-2 rounded-lg border border-black/[0.08] bg-white text-[13px] text-[#1d1d1f] outline-none focus:border-[#0071e3]"
          >
            {CONTENT_TYPES.map((ct) => (
              <option key={ct.value} value={ct.value}>
                {ct.label}
              </option>
            ))}
          </select>
          <button
            onClick={onAddManual}
            disabled={!manual.title.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0071e3] text-white transition-colors hover:bg-[#0077ed] disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function StepComplete({
  stats,
  onFinish,
}: {
  stats: { dimensions: number; goals: number; content: number }
  onFinish: () => void
}) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    setShowConfetti(true)
    const timer = setTimeout(() => setShowConfetti(false), 3500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {showConfetti && <Confetti />}
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#248a3d]/[0.1] mb-8">
          <Check className="h-9 w-9 text-[#248a3d]" />
        </div>
        <h1 className="text-[28px] font-bold tracking-[-0.04em] text-[#1d1d1f]">
          一切就绪！
        </h1>
        <p className="mt-3 text-[16px] text-black/[0.48] max-w-sm leading-relaxed">
          你的第一周建议已生成
        </p>

        {/* Stats */}
        <div className="mt-8 flex gap-6">
          <div className="flex flex-col items-center">
            <span className="text-[32px] font-bold text-[#0071e3] tracking-tight">
              {stats.dimensions}
            </span>
            <span className="text-[12px] text-black/[0.48] mt-0.5">
              个维度
            </span>
          </div>
          <div className="w-px bg-black/[0.08]" />
          <div className="flex flex-col items-center">
            <span className="text-[32px] font-bold text-[#248a3d] tracking-tight">
              {stats.goals}
            </span>
            <span className="text-[12px] text-black/[0.48] mt-0.5">
              个目标
            </span>
          </div>
          <div className="w-px bg-black/[0.08]" />
          <div className="flex flex-col items-center">
            <span className="text-[32px] font-bold text-[#bf4800] tracking-tight">
              {stats.content}
            </span>
            <span className="text-[12px] text-black/[0.48] mt-0.5">
              个内容
            </span>
          </div>
        </div>

        <button
          onClick={onFinish}
          className="mt-10 h-11 rounded-lg bg-[#0071e3] px-8 text-[14px] font-medium text-white transition-colors hover:bg-[#0077ed] active:bg-[#006adb]"
        >
          进入日历
        </button>
      </div>
    </>
  )
}

// ────────────────────────── Main Page ──────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const setNeedsOnboarding = useAuthStore((s) => s.setNeedsOnboarding)

  const [step, setStep] = useState(1)

  // Step 2: Dimensions
  const [dimensions, setDimensions] = useState<PresetDimension[]>(DEFAULT_DIMENSIONS)
  const [customName, setCustomName] = useState('')

  // Step 3: Goals
  const [goal, setGoal] = useState<GoalDraft>({
    dimensionId: 'growth',
    title: '',
    keyResults: [{ title: '', targetValue: '', unit: '' }],
  })

  // Step 4: Content
  const [suggested, setSuggested] = useState<Record<string, boolean>>({})
  const [manualContent, setManualContent] = useState<ContentDraft>({ title: '', type: 'book' })
  const [addedContent, setAddedContent] = useState<ContentDraft[]>([])

  const toggleDimension = useCallback((id: string) => {
    setDimensions((prev) =>
      prev.map((d) => (d.id === id ? { ...d, selected: !d.selected } : d))
    )
  }, [])

  const addCustomDimension = useCallback(() => {
    const trimmed = customName.trim()
    if (!trimmed) return
    const id = `custom-${Date.now()}`
    setDimensions((prev) => [
      ...prev,
      {
        id,
        name: trimmed,
        icon: trimmed.charAt(0),
        color: '#5856d6',
        selected: true,
      },
    ])
    setCustomName('')
  }, [customName])

  const toggleSuggested = useCallback((title: string) => {
    setSuggested((prev) => ({ ...prev, [title]: !prev[title] }))
  }, [])

  const addManualContent = useCallback(() => {
    const trimmed = manualContent.title.trim()
    if (!trimmed) return
    setAddedContent((prev) => [...prev, { title: trimmed, type: manualContent.type }])
    setManualContent({ title: '', type: 'book' })
  }, [manualContent])

  const handleFinish = useCallback(() => {
    setNeedsOnboarding(false)
    router.push('/')
  }, [setNeedsOnboarding, router])

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  const goBack = () => setStep((s) => Math.max(s - 1, 1))

  // Stats for final step
  const selectedDimCount = dimensions.filter((d) => d.selected).length
  const goalCount = goal.title.trim() ? 1 : 0
  const suggestedCount = Object.values(suggested).filter(Boolean).length
  const contentCount = suggestedCount + addedContent.length

  const canSkip = step === 3 || step === 4
  const isLastStep = step === TOTAL_STEPS

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white">
      {/* Top bar */}
      <div className="px-6 pt-6 pb-4">
        <div className="max-w-lg mx-auto">
          <ProgressBar current={step} total={TOTAL_STEPS} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-6 py-6">
          {step === 1 && <StepWelcome onNext={goNext} />}
          {step === 2 && (
            <StepDimensions
              dimensions={dimensions}
              onToggle={toggleDimension}
              customName={customName}
              onCustomNameChange={setCustomName}
              onAddCustom={addCustomDimension}
            />
          )}
          {step === 3 && (
            <StepGoals
              dimensions={dimensions}
              goal={goal}
              onGoalChange={setGoal}
            />
          )}
          {step === 4 && (
            <StepContent
              suggested={suggested}
              manual={manualContent}
              onToggleSuggested={toggleSuggested}
              onManualChange={setManualContent}
              onAddManual={addManualContent}
            />
          )}
          {step === 5 && (
            <StepComplete
              stats={{
                dimensions: selectedDimCount,
                goals: goalCount,
                content: contentCount,
              }}
              onFinish={handleFinish}
            />
          )}
        </div>
      </div>

      {/* Bottom nav */}
      {!isLastStep && step !== 1 && (
        <div className="border-t border-black/[0.06] bg-white px-6 py-4">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <button
              onClick={goBack}
              className="flex items-center gap-1.5 h-10 px-4 rounded-lg text-[13px] font-medium text-black/[0.48] transition-colors hover:bg-black/[0.04]"
            >
              <ArrowLeft className="h-4 w-4" />
              上一步
            </button>

            <div className="flex items-center gap-3">
              {canSkip && (
                <button
                  onClick={goNext}
                  className="h-10 px-4 rounded-lg text-[13px] font-medium text-black/[0.36] transition-colors hover:text-black/[0.56]"
                >
                  稍后再说
                </button>
              )}
              <button
                onClick={goNext}
                className="flex items-center gap-1.5 h-10 px-6 rounded-lg bg-[#0071e3] text-[13px] font-medium text-white transition-colors hover:bg-[#0077ed] active:bg-[#006adb]"
              >
                下一步
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
