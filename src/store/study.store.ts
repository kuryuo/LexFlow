import { create } from 'zustand'

import { getDictionaryWords } from '@/services/dictionary.service'
import { answerWord } from '@/services/progress.service'
import type { CefrLevel, DictionaryWord, WordCount } from '@/types'

interface SubmitAnswerParams {
  knew: boolean
}

interface StudyState {
  words: DictionaryWord[]
  currentIndex: number
  isLoading: boolean
  loadWords: (level: CefrLevel, count: WordCount) => Promise<void>
  submitAnswer: ({ knew }: SubmitAnswerParams) => Promise<void>
  error: string | null
  isSubmitting: boolean
}

export const useStudyStore = create<StudyState>((set, get) => ({
  words: [],
  currentIndex: 0,
  isLoading: false,
  isSubmitting: false,
  loadWords: async (level, count) => {
    set({ isLoading: true, error: null })

    try {
      const result = await getDictionaryWords({ level, pageSize: count })
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
  submitAnswer: async ({ knew }) => {
    const { words, currentIndex, isSubmitting } = get()
    const currentWord = words[currentIndex]

    if (!currentWord || isSubmitting) {
      return
    }

    set({ error: null, isSubmitting: true })

    try {
      await answerWord({
        wordId: currentWord.id,
        knew,
      })

      set({ currentIndex: currentIndex + 1 })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      })
    } finally {
      set({ isSubmitting: false })
    }
  },
  error: null,
}))
