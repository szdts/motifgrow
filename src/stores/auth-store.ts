import { create } from 'zustand'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  isLoading: boolean
  needsOnboarding: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  setNeedsOnboarding: (v: boolean) => void
}

// V1: mock auth, 后续替换为 Supabase
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  needsOnboarding: false,
  login: async (email: string) => {
    set({ isLoading: true })
    await new Promise((r) => setTimeout(r, 800))
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
  },
  register: async (name: string, email: string) => {
    set({ isLoading: true })
    await new Promise((r) => setTimeout(r, 800))
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
  },
  logout: () => set({ user: null, needsOnboarding: false }),
  setUser: (user) => set({ user }),
  setNeedsOnboarding: (v) => set({ needsOnboarding: v }),
}))
