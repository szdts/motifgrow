'use client'

import { useState } from 'react'
import Link from 'next/link'

function validateEmail(email: string): string | undefined {
  if (!email.trim()) return '请输入邮箱地址'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '请输入有效的邮箱地址'
  return undefined
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [touched, setTouched] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const emailError = validateEmail(email)
    setError(emailError)
    setTouched(true)

    if (emailError) return

    setIsLoading(true)
    // Mock API delay
    await new Promise((r) => setTimeout(r, 800))
    setIsLoading(false)
    setSubmitted(true)
  }

  const handleBlur = () => {
    setTouched(true)
    setError(validateEmail(email))
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#f5f5f7]">
      <div className="w-full max-w-[400px] px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">
            Motifgrow
          </h1>
          <p className="text-[15px] text-[#86868b] mt-1.5 tracking-[-0.01em]">
            重置密码
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white border border-black/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-[#248a3d]/10 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#248a3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-[16px] font-semibold text-[#1d1d1f] mb-2">
                重置链接已发送
              </h2>
              <p className="text-[14px] text-[#86868b] leading-relaxed">
                重置链接已发送到你的邮箱 <span className="font-medium text-[#1d1d1f]">{email}</span>，请查收并按照邮件中的指引重置密码。
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <p className="text-[14px] text-[#86868b] mb-5 leading-relaxed">
                输入你的注册邮箱，我们会发送一封包含重置链接的邮件。
              </p>

              {/* Email */}
              <div className="mb-5">
                <label htmlFor="forgot-email" className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
                  邮箱
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleBlur}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className={`w-full h-10 px-3 rounded-lg border text-[14px] text-[#1d1d1f] placeholder:text-[#aeaeb2] outline-none transition-all duration-200 ${
                    touched && error
                      ? 'border-[#ff3b30] focus:border-[#ff3b30] focus:ring-2 focus:ring-[#ff3b30]/20'
                      : 'border-black/[0.08] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20'
                  }`}
                />
                {touched && error && (
                  <p className="mt-1 text-[12px] text-[#ff3b30]">{error}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 rounded-lg bg-[#0071e3] text-white text-[14px] font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:bg-[#0077ed] active:bg-[#006adb] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  '发送重置链接'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 text-center">
          <Link href="/login" className="text-[13px] text-[#0071e3] hover:underline font-medium">
            返回登录
          </Link>
        </div>
      </div>
    </div>
  )
}
