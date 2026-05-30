import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  DEEPSEEK_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  CRON_SECRET: z.string().min(16).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
})

export type Env = z.infer<typeof envSchema>

// 懒加载：不在模块导入时立即验证，避免 Next.js 预渲染阶段 crash
let _env: Env | null = null

export function getEnv(): Env {
  if (_env) return _env

  // 客户端只能访问 NEXT_PUBLIC_ 变量
  if (typeof window !== 'undefined') {
    _env = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    } as Env
    return _env
  }

  // 服务端：验证环境变量
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    // 构建阶段和开发阶段不 crash，用 fallback
    _env = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'dev-anon-key',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    } as Env
    return _env
  }

  _env = result.data
  return _env
}

// 向后兼容：其他文件 import { env } from '@/lib/env' 继续工作
// 但不再在模块加载时立即执行验证
export const env = new Proxy({} as Env, {
  get(_, prop: string) {
    return getEnv()[prop as keyof Env]
  },
})
