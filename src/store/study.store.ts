import { create } from 'zustand'

import { getDictionaryWords } from '@/services/dictionary.service'
import type { CefrLevel, DictionaryWord } from '@/types'

interface StudyState {
  words: DictionaryWord[]
  currentIndex: number
  isLoading: boolean
  loadWords: (level: CefrLevel) => Promise<void>
  error: string | null
}

export const useStudyStore = create<StudyState>((set) => ({
  words: [],
  currentIndex: 0,
  isLoading: false,
  loadWords: async (level) => {
    set({ isLoading: true, error: null })

    try {
      const result = await getDictionaryWords({ level })
      set({
        words: result.words,
        currentIndex: 0,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      })
    } finally {
      set({ isLoading: false })
    }
  },
  error: null,
}))
