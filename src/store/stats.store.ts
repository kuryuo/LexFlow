import { create } from 'zustand'

import { getStudyCandidates } from '@/services/dictionary.service'
import { getLevelStats } from '@/services/progress.service'
import type { LevelStats, StudyCandidate, StudyLevel } from '@/types'

interface StatsState {
  stats: LevelStats | null
  candidates: StudyCandidate[]
  isStatsLoading: boolean
  statsError: string | null
  isCandidatesLoading: boolean
  candidatesError: string | null
  loadStats: (level: StudyLevel) => Promise<void>
  loadCandidates: (level: StudyLevel) => Promise<void>
}

export const useStatsStore = create<StatsState>((set) => ({
  stats: null,
  candidates: [],
  isStatsLoading: false,
  statsError: null,
  isCandidatesLoading: false,
  candidatesError: null,
  loadStats: async (level) => {
    set({ isStatsLoading: true, statsError: null })

    try {
      set({ stats: await getLevelStats(level) })
    } catch (error) {
      set({
        statsError:
          error instanceof Error ? error.message : 'Неизвестная ошибка',
      })
    } finally {
      set({ isStatsLoading: false })
    }
  },
  loadCandidates: async (level) => {
    set({ isCandidatesLoading: true, candidatesError: null })

    try {
      set({ candidates: await getStudyCandidates(level) })
    } catch (error) {
      set({
        candidatesError:
          error instanceof Error ? error.message : 'Неизвестная ошибка',
      })
    } finally {
      set({ isCandidatesLoading: false })
    }
  },
}))
