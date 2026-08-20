import { create } from 'zustand'

import { getLevelStats } from '@/services/progress.service'
import type { CefrLevel, LevelStats } from '@/types'

interface StatsState {
  stats: LevelStats | null
  isLoading: boolean
  error: string | null
  loadStats: (level: CefrLevel) => Promise<void>
}

export const useStatsStore = create<StatsState>((set) => ({
  stats: null,
  isLoading: false,
  error: null,
  loadStats: async (level) => {
    set({ isLoading: true, error: null })

    try {
      const result = await getLevelStats(level)
      set({ stats: result })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      })
    } finally {
      set({ isLoading: false })
    }
  },
}))
