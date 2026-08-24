import { create } from 'zustand'

import { pickSessionWords } from '@/lib/study-weight'
import { getStudyCandidates } from '@/services/dictionary.service'
import { answerWord } from '@/services/progress.service'
import type { DictionaryWord, StudyLevel, WordCount } from '@/types'

interface SubmitAnswerParams {
  knew: boolean
}

interface StudyState {
  words: DictionaryWord[]
  currentIndex: number
  isWordsLoading: boolean
  wordsError: string | null
  isSubmitting: boolean
  correctCount: number
  loadWords: (level: StudyLevel, count: WordCount) => Promise<void>
  submitAnswer: ({ knew }: SubmitAnswerParams) => Promise<void>
}

export const useStudyStore = create<StudyState>((set, get) => ({
  words: [],
  currentIndex: 0,
  isWordsLoading: false,
  wordsError: null,
  isSubmitting: false,
  correctCount: 0,
  loadWords: async (level, count) => {
    set({ isWordsLoading: true, wordsError: null })

    try {
      const candidates = await getStudyCandidates(level)
      const words = pickSessionWords(candidates, count)

      set({
        words,
        currentIndex: 0,
        correctCount: 0,
      })
    } catch (error) {
      set({
        wordsError:
          error instanceof Error ? error.message : 'Неизвестная ошибка',
      })
    } finally {
      set({ isWordsLoading: false })
    }
  },
  submitAnswer: async ({ knew }) => {
    const { words, currentIndex, isSubmitting, correctCount } = get()
    const currentWord = words[currentIndex]

    if (!currentWord || isSubmitting) {
      return
    }

    set({ wordsError: null, isSubmitting: true })

    try {
      await answerWord({
        wordId: currentWord.id,
        knew,
      })

      set({
        currentIndex: currentIndex + 1,
        correctCount: knew ? correctCount + 1 : correctCount,
      })
    } catch (error) {
      set({
        wordsError:
          error instanceof Error ? error.message : 'Неизвестная ошибка',
      })
    } finally {
      set({ isSubmitting: false })
    }
  },
}))
