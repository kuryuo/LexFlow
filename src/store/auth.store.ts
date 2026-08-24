import type { User } from '@supabase/supabase-js'
import { create } from 'zustand'

interface AuthState {
  user: User | null
  isAuthLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (isAuthLoading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isAuthLoading) => set({ isAuthLoading }),
}))
