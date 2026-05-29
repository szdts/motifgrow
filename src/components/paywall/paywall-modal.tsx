'use client'

import { useRouter } from 'next/navigation'
import {
  Lock,
  Zap,
  Layers,
  Mic,
  BarChart3,
} from 'lucide-react'

// ────────────────────────── Types ──────────────────────────

interface PaywallModalProps {
  feature: string
  onClose: () => void
}

// ────────────────────────── Highlights ──────────────────────────

const PRO_HIGHLIGHTS = [
  { icon: Zap, text: '无限制 AI 对话' },
  { icon: Layers, text: '无限维度与媒体库' },
  { icon: Mic, text: '语音输入支持' },
  { icon: BarChart3, text: '季度 Wrapped 报告' },
] as const

// ────────────────────────── Component ──────────────────────────

export function PaywallModal({ feature, onClose }: PaywallModalProps) {
  const router = useRouter()

  const handleUpgrade = () => {
    onClose()
    router.push('/pricing')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="w-[420px] max-w-[calc(100vw-32px)] rounded-2xl bg-white p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0071e3]/[0.1]">
            <Lock className="h-6 w-6 text-[#0071e3]" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-[20px] font-semibold text-[#1d1d1f] text-center tracking-[-0.02em]">
          升级 Pro 解锁此功能
        </h2>

        {/* Feature description */}
        <p className="mt-2 text-[14px] text-black/[0.48] text-center leading-relaxed">
          「{feature}」是 Pro 版专属功能，升级后即可使用
        </p>

        {/* Highlights */}
        <div className="mt-6 space-y-3 rounded-[10px] bg-[#f5f5f7] p-4">
          {PRO_HIGHLIGHTS.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <Icon className="h-4 w-4 text-[#0071e3] shrink-0" />
              <span className="text-[13px] text-[#1d1d1f]">{text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleUpgrade}
          className="mt-6 w-full h-11 rounded-lg bg-[#0071e3] text-[14px] font-medium text-white transition-colors hover:bg-[#0077ed] active:bg-[#006adb]"
        >
          升级 Pro — ¥29/月
        </button>

        {/* Dismiss */}
        <button
          onClick={onClose}
          className="mt-3 w-full h-9 text-[13px] text-black/[0.36] transition-colors hover:text-black/[0.56]"
        >
          稍后再说
        </button>
      </div>
    </div>
  )
}
