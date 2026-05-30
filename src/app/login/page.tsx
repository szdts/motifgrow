'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
    </svg>
  )
}

function Spinner() {
  return (
    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
  )
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

interface FormErrors {
  email?: string
  password?: string
}

function validateEmail(email: string): string | undefined {
  if (!email.trim()) return '请输入邮箱地址'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '请输入有效的邮箱地址'
  return undefined
}

function validatePassword(password: string): string | undefined {
  if (!password) return '请输入密码'
  if (password.length < 6) return '密码至少需要 6 位'
  return undefined
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const login = useAuthStore((s) => s.login)
  const isLoading = useAuthStore((s) => s.isLoading)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    const newErrors: FormErrors = {}
    if (emailError) newErrors.email = emailError
    if (passwordError) newErrors.password = passwordError

    setErrors(newErrors)
    setTouched({ email: true, password: true })

    if (Object.keys(newErrors).length > 0) return

    const result = await login(email, password)
    if (result.success) {
      router.replace('/')
    } else if (result.error) {
      setErrors({ email: result.error })
    }
  }

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    if (field === 'email') {
      const err = validateEmail(email)
      setErrors((prev) => ({ ...prev, email: err }))
    } else {
      const err = validatePassword(password)
      setErrors((prev) => ({ ...prev, password: err }))
    }
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
            一个不会让你失败的生活调度器
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white border border-black/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6">
          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="mb-4">
              <label htmlFor="login-email" className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
                邮箱
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="name@example.com"
                autoComplete="email"
                className={`w-full h-10 px-3 rounded-lg border text-[14px] text-[#1d1d1f] placeholder:text-[#aeaeb2] outline-none transition-all duration-200 ${
                  touched.email && errors.email
                    ? 'border-[#ff3b30] focus:border-[#ff3b30] focus:ring-2 focus:ring-[#ff3b30]/20'
                    : 'border-black/[0.08] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20'
                }`}
              />
              {touched.email && errors.email && (
                <p className="mt-1 text-[12px] text-[#ff3b30]">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-5">
              <label htmlFor="login-password" className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
                密码
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="至少 6 位"
                  autoComplete="current-password"
                  className={`w-full h-10 px-3 pr-10 rounded-lg border text-[14px] text-[#1d1d1f] placeholder:text-[#aeaeb2] outline-none transition-all duration-200 ${
                    touched.password && errors.password
                      ? 'border-[#ff3b30] focus:border-[#ff3b30] focus:ring-2 focus:ring-[#ff3b30]/20'
                      : 'border-black/[0.08] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded text-[#aeaeb2] hover:text-[#86868b] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="mt-1 text-[12px] text-[#ff3b30]">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 rounded-lg bg-[#0071e3] text-white text-[14px] font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:bg-[#0077ed] active:bg-[#006adb] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? <Spinner /> : '登录'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-black/[0.08]" />
            <span className="text-[12px] text-[#aeaeb2]">或</span>
            <div className="flex-1 h-px bg-black/[0.08]" />
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            className="w-full h-10 rounded-lg border border-black/[0.08] bg-white text-[14px] font-medium text-[#1d1d1f] flex items-center justify-center gap-2.5 transition-all duration-200 hover:bg-black/[0.02] active:bg-black/[0.04]"
          >
            <GoogleIcon />
            使用 Google 账号登录
          </button>
        </div>

        {/* Footer links */}
        <div className="mt-5 text-center space-y-2">
          <p className="text-[13px] text-[#86868b]">
            还没有账号？{' '}
            <Link href="/register" className="text-[#0071e3] hover:underline font-medium">
              注册
            </Link>
          </p>
          <p>
            <Link href="/forgot-password" className="text-[13px] text-[#86868b] hover:text-[#0071e3] transition-colors">
              忘记密码？
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
