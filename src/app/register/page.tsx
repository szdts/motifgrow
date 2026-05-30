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
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

function validateName(name: string): string | undefined {
  if (!name.trim()) return '请输入用户名'
  return undefined
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

function validateConfirmPassword(password: string, confirm: string): string | undefined {
  if (!confirm) return '请确认密码'
  if (password !== confirm) return '两次密码不一致'
  return undefined
}

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const register = useAuthStore((s) => s.register)
  const isLoading = useAuthStore((s) => s.isLoading)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: FormErrors = {}
    const nameError = validateName(name)
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    const confirmError = validateConfirmPassword(password, confirmPassword)

    if (nameError) newErrors.name = nameError
    if (emailError) newErrors.email = emailError
    if (passwordError) newErrors.password = passwordError
    if (confirmError) newErrors.confirmPassword = confirmError

    setErrors(newErrors)
    setTouched({ name: true, email: true, password: true, confirmPassword: true })

    if (Object.keys(newErrors).length > 0) return

    const result = await register(name, email, password)
    if (result.success) {
      router.replace('/onboarding')
    } else if (result.error) {
      setErrors({ email: result.error })
    }
  }

  const handleBlur = (field: keyof FormErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const newErrors = { ...errors }

    switch (field) {
      case 'name':
        newErrors.name = validateName(name)
        break
      case 'email':
        newErrors.email = validateEmail(email)
        break
      case 'password':
        newErrors.password = validatePassword(password)
        break
      case 'confirmPassword':
        newErrors.confirmPassword = validateConfirmPassword(password, confirmPassword)
        break
    }

    setErrors(newErrors)
  }

  const inputClass = (field: keyof FormErrors) =>
    `w-full h-10 px-3 rounded-lg border text-[14px] text-[#1d1d1f] placeholder:text-[#aeaeb2] outline-none transition-all duration-200 ${
      touched[field] && errors[field]
        ? 'border-[#ff3b30] focus:border-[#ff3b30] focus:ring-2 focus:ring-[#ff3b30]/20'
        : 'border-black/[0.08] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20'
    }`

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#f5f5f7] overflow-y-auto">
      <div className="w-full max-w-[400px] px-6 py-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">
            Motifgrow
          </h1>
          <p className="text-[15px] text-[#86868b] mt-1.5 tracking-[-0.01em]">
            创建你的账号
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white border border-black/[0.08] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6">
          <form onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <div className="mb-4">
              <label htmlFor="reg-name" className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
                用户名
              </label>
              <input
                id="reg-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleBlur('name')}
                placeholder="你的名字"
                autoComplete="name"
                className={inputClass('name')}
              />
              {touched.name && errors.name && (
                <p className="mt-1 text-[12px] text-[#ff3b30]">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="mb-4">
              <label htmlFor="reg-email" className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
                邮箱
              </label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="name@example.com"
                autoComplete="email"
                className={inputClass('email')}
              />
              {touched.email && errors.email && (
                <p className="mt-1 text-[12px] text-[#ff3b30]">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label htmlFor="reg-password" className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
                密码
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="至少 6 位"
                  autoComplete="new-password"
                  className={`${inputClass('password')} pr-10`}
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

            {/* Confirm Password */}
            <div className="mb-5">
              <label htmlFor="reg-confirm" className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
                确认密码
              </label>
              <div className="relative">
                <input
                  id="reg-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="再次输入密码"
                  autoComplete="new-password"
                  className={`${inputClass('confirmPassword')} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded text-[#aeaeb2] hover:text-[#86868b] transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="mt-1 text-[12px] text-[#ff3b30]">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 rounded-lg bg-[#0071e3] text-white text-[14px] font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:bg-[#0077ed] active:bg-[#006adb] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? <Spinner /> : '创建账号'}
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
            使用 Google 账号注册
          </button>
        </div>

        {/* Footer links */}
        <div className="mt-5 text-center">
          <p className="text-[13px] text-[#86868b]">
            已有账号？{' '}
            <Link href="/login" className="text-[#0071e3] hover:underline font-medium">
              登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
