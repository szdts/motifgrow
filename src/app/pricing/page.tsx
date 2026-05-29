'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import {
  ArrowLeft,
  Check,
  X,
  ChevronDown,
  Sparkles,
} from 'lucide-react'

// ────────────────────────── Types ──────────────────────────

interface PlanFeature {
  label: string
  free: string | boolean
  pro: string | boolean
  team: string | boolean
}

interface FaqItem {
  question: string
  answer: string
}

// ────────────────────────── Data ──────────────────────────

const FEATURES: PlanFeature[] = [
  { label: '维度数量', free: '4 个', pro: '无限制', team: '无限制' },
  { label: '媒体库条目', free: '20 个', pro: '无限制', team: '无限制' },
  { label: 'AI 对话', free: '10 次/天', pro: '无限制', team: '无限制' },
  { label: '语音输入', free: false, pro: true, team: true },
  { label: '日历源导入', free: '1 个', pro: '5 个', team: '无限制' },
  { label: '季度 Wrapped', free: false, pro: true, team: true },
  { label: '团队共享', free: false, pro: false, team: true },
  { label: '优先支持', free: false, pro: false, team: true },
]

const FAQ_ITEMS: FaqItem[] = [
  {
    question: '可以随时取消订阅吗？',
    answer:
      '当然可以。你可以随时在设置中取消订阅，取消后当前计费周期结束前你仍可使用 Pro 功能。取消后账号会自动降级为 Free 计划。',
  },
  {
    question: '支持哪些支付方式？',
    answer:
      '目前支持微信支付和支付宝。未来会增加银行卡和 Apple Pay 等更多支付方式。',
  },
  {
    question: 'Free 计划的数据会丢失吗？',
    answer:
      '不会。降级到 Free 后，已有数据全部保留，只是超出 Free 限额的部分将变为只读状态，你可以随时升级恢复完整访问。',
  },
]

// ────────────────────────── Feature Cell ──────────────────────────

function FeatureValue({ value }: { value: string | boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-4 w-4 text-[#248a3d]" />
    ) : (
      <X className="h-4 w-4 text-black/[0.2]" />
    )
  }
  return <span className="text-[13px] text-[#1d1d1f]">{value}</span>
}

// ────────────────────────── FAQ Accordion ──────────────────────────

function FaqAccordion({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-black/[0.06] last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-left transition-colors hover:text-[#0071e3]"
      >
        <span className="text-[14px] font-medium text-[#1d1d1f]">
          {item.question}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-black/[0.36] shrink-0 ml-4 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          open ? 'max-h-40 pb-4' : 'max-h-0'
        }`}
      >
        <p className="text-[13px] leading-relaxed text-black/[0.56]">
          {item.answer}
        </p>
      </div>
    </div>
  )
}

// ────────────────────────── Toast ──────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-bottom-4 duration-300"
      onAnimationEnd={() => {
        setTimeout(onDone, 2000)
      }}
    >
      <div className="rounded-full bg-[#1d1d1f] px-5 py-2.5 text-[13px] text-white shadow-lg">
        {message}
      </div>
    </div>
  )
}

// ────────────────────────── Main Page ──────────────────────────

export default function PricingPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const currentPlan = user?.plan ?? 'free'
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => setToast(msg)

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#f5f5f7]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#f5f5f7]/80 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="mx-auto max-w-4xl flex items-center gap-3 px-6 h-14">
          <button
            onClick={() => router.back()}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-black/[0.06]"
          >
            <ArrowLeft className="h-4 w-4 text-[#1d1d1f]" />
          </button>
          <span className="text-[15px] font-semibold text-[#1d1d1f] tracking-[-0.02em]">
            Motifgrow
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-[32px] font-bold tracking-[-0.04em] text-[#1d1d1f]">
            选择适合你的计划
          </h1>
          <p className="mt-2 text-[16px] text-black/[0.48]">
            从免费开始，随时升级解锁更多功能
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {/* Free */}
          <div className="rounded-[12px] bg-white border border-black/[0.08] p-6 flex flex-col">
            <div className="mb-6">
              <h3 className="text-[18px] font-semibold text-[#1d1d1f]">Free</h3>
              <div className="mt-2">
                <span className="text-[28px] font-bold text-[#1d1d1f] tracking-tight">
                  免费
                </span>
              </div>
              <p className="mt-1.5 text-[13px] text-black/[0.48]">
                适合个人体验基础功能
              </p>
            </div>

            <div className="space-y-3 flex-1 mb-6">
              {FEATURES.map((f) => (
                <div key={f.label} className="flex items-center justify-between">
                  <span className="text-[13px] text-black/[0.56]">{f.label}</span>
                  <FeatureValue value={f.free} />
                </div>
              ))}
            </div>

            {currentPlan === 'free' ? (
              <button
                disabled
                className="w-full h-10 rounded-lg bg-black/[0.06] text-[13px] font-medium text-black/[0.36] cursor-not-allowed"
              >
                当前计划
              </button>
            ) : (
              <div className="h-10" />
            )}
          </div>

          {/* Pro (recommended) */}
          <div className="rounded-[12px] bg-white border-2 border-[#0071e3] p-6 flex flex-col relative md:scale-[1.02] md:-my-1 shadow-[0_4px_24px_rgba(0,113,227,0.1)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#0071e3] px-3 py-1 text-[11px] font-medium text-white">
                <Sparkles className="h-3 w-3" />
                推荐
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-[18px] font-semibold text-[#1d1d1f]">Pro</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-[28px] font-bold text-[#1d1d1f] tracking-tight">
                  ¥29
                </span>
                <span className="text-[14px] text-black/[0.48]">/月</span>
              </div>
              <p className="mt-1.5 text-[13px] text-black/[0.48]">
                解锁全部功能，专注提升自我
              </p>
            </div>

            <div className="space-y-3 flex-1 mb-6">
              {FEATURES.map((f) => (
                <div key={f.label} className="flex items-center justify-between">
                  <span className="text-[13px] text-black/[0.56]">{f.label}</span>
                  <FeatureValue value={f.pro} />
                </div>
              ))}
            </div>

            <button
              onClick={() => showToast('支付功能开发中，敬请期待')}
              className="w-full h-10 rounded-lg bg-[#0071e3] text-[13px] font-medium text-white transition-colors hover:bg-[#0077ed] active:bg-[#006adb]"
            >
              升级 Pro
            </button>
          </div>

          {/* Team */}
          <div className="rounded-[12px] bg-white border border-black/[0.08] p-6 flex flex-col">
            <div className="mb-6">
              <h3 className="text-[18px] font-semibold text-[#1d1d1f]">Team</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-[28px] font-bold text-[#1d1d1f] tracking-tight">
                  ¥99
                </span>
                <span className="text-[14px] text-black/[0.48]">/月</span>
              </div>
              <p className="mt-1.5 text-[13px] text-black/[0.48]">
                团队协作，共同成长
              </p>
            </div>

            <div className="space-y-3 flex-1 mb-6">
              {FEATURES.map((f) => (
                <div key={f.label} className="flex items-center justify-between">
                  <span className="text-[13px] text-black/[0.56]">{f.label}</span>
                  <FeatureValue value={f.team} />
                </div>
              ))}
            </div>

            <button
              onClick={() => showToast('团队版即将上线，请联系 hi@motifgrow.com')}
              className="w-full h-10 rounded-lg border border-black/[0.12] bg-white text-[13px] font-medium text-[#1d1d1f] transition-colors hover:bg-black/[0.03] active:bg-black/[0.06]"
            >
              联系我们
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-[20px] font-semibold text-[#1d1d1f] mb-6 text-center">
            常见问题
          </h2>
          <div className="rounded-[12px] bg-white px-6">
            {FAQ_ITEMS.map((item) => (
              <FaqAccordion key={item.question} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast !== null && (
        <Toast message={toast} onDone={() => setToast(null)} />
      )}
    </div>
  )
}
