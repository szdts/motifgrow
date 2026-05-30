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

function getEnv(): Env {
  if (typeof window !== 'undefined') {
    return {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    } as Env
  }

  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Environment variables missing:', result.error.flatten().fieldErrors)
      return {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'dev-anon-key',
        NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      } as Env
    }
    throw new Error(
      `Environment validation failed: ${JSON.stringify(result.error.flatten().fieldErrors)}`,
    )
  }

  return result.data
}

export const env = getEnv()
