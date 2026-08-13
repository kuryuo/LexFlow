export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const

export const WORD_STATUSES = ['learning', 'known'] as const

export type WordStatus = (typeof WORD_STATUSES)[number]

export interface UserWordProgress {
  id: string
  userId: string
  wordId: string
  status: WordStatus
  correctCount: number
  updatedAt: string
  createdAt: string
}

export type CefrLevel = (typeof CEFR_LEVELS)[number]

export interface DictionaryMeaning {
  id: number
  partOfSpeech: string
  translations: string[]
}

export interface DictionaryWord {
  id: string
  word: string
  senseHint: string | null
  level: CefrLevel
  source: string
  transcription: string
  meanings: DictionaryMeaning[]
}

export interface LevelStats {
  level: CefrLevel | 'all'
  newCount: number
  learningCount: number
  knownCount: number
  totalCount: number
}
