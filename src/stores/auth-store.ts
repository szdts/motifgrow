import { create } from 'zustand'
import type { User } from '@/types'
import { createClient } from '@/lib/supabase/client'

interface AuthState {
  user: User | null
  isLoading: boolean
  needsOnboarding: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  setNeedsOnboarding: (v: boolean) => void
  initialize: () => Promise<void>
}

function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'http://localhost:54321'
  )
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  needsOnboarding: false,

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient()
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          set({ isLoading: false })
          return { success: false, error: error.message }
        }
        const user: User = {
          id: data.user.id,
          email: data.user.email ?? email,
          name: data.user.user_metadata?.name ?? email.split('@')[0],
          avatarUrl: data.user.user_metadata?.avatar_url ?? null,
          plan: 'free',
          createdAt: data.user.created_at,
        }
        set({ user, isLoading: false })
        return { success: true }
      }

      // Mock mode
      await new Promise((r) => setTimeout(r, 500))
      set({
        user: {
          id: crypto.randomUUID(),
          email,
          name: email.split('@')[0],
          avatarUrl: null,
          plan: 'free',
          createdAt: new Date().toISOString(),
        },
        isLoading: false,
      })
      return { success: true }
    } catch {
      set({ isLoading: false })
      return { success: false, error: '登录失败，请重试' }
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true })
    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient()
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        })
        if (error) {
          set({ isLoading: false })
          return { success: false, error: error.message }
        }
        if (data.user) {
          const user: User = {
            id: data.user.id,
            email: data.user.email ?? email,
            name,
            avatarUrl: null,
            plan: 'free',
            createdAt: data.user.created_at,
          }
          set({ user, isLoading: false, needsOnboarding: true })
        }
        return { success: true }
      }

      // Mock mode
      await new Promise((r) => setTimeout(r, 500))
      set({
        user: {
          id: crypto.randomUUID(),
          email,
          name,
          avatarUrl: null,
          plan: 'free',
          createdAt: new Date().toISOString(),
        },
        isLoading: false,
        needsOnboarding: true,
      })
      return { success: true }
    } catch {
      set({ isLoading: false })
      return { success: false, error: '注册失败，请重试' }
    }
  },

  logout: async () => {
    if (isSupabaseConfigured()) {
      const supabase = createClient()
      await supabase.auth.signOut()
    }
    set({ user: null, needsOnboarding: false })
  },

  setUser: (user) => set({ user }),
  setNeedsOnboarding: (v) => set({ needsOnboarding: v }),

  initialize: async () => {
    if (isSupabaseConfigured()) {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        set({
          user: {
            id: session.user.id,
            email: session.user.email ?? '',
            name: session.user.user_metadata?.name ?? session.user.email?.split('@')[0] ?? '',
            avatarUrl: session.user.user_metadata?.avatar_url ?? null,
            plan: 'free',
            createdAt: session.user.created_at,
          },
        })
      }

      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          set({ user: null })
        } else if (session?.user) {
          set({
            user: {
              id: session.user.id,
              email: session.user.email ?? '',
              name: session.user.user_metadata?.name ?? '',
              avatarUrl: session.user.user_metadata?.avatar_url ?? null,
              plan: 'free',
              createdAt: session.user.created_at,
            },
          })
        }
      })
    }
  },
}))
