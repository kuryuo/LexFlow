import { supabase } from '@/lib/supabase'

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const

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

interface DictionaryWordRow {
  id: string
  word: string
  sense_hint: string | null
  level: CefrLevel
  source: string
  transcription: string
  word_meanings: Array<{
    id: number
    part_of_speech: string
    translation_values: string[]
  }>
}

interface GetDictionaryWordsParams {
  level: CefrLevel
  page?: number
  pageSize?: number
}

interface GetDictionaryWordsResult {
  words: DictionaryWord[]
  total: number
}

export async function getDictionaryWords({
  level,
  page = 1,
  pageSize = 20,
}: GetDictionaryWordsParams): Promise<GetDictionaryWordsResult> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await supabase
    .from('dictionary_words')
    .select(
      `
        id,
        word,
        sense_hint,
        level,
        source,
        transcription,
        word_meanings (
          id,
          part_of_speech,
          translation_values
        )
      `,
      { count: 'exact' },
    )
    .eq('level', level)
    .order('word')
    .range(from, to)

  if (error) {
    throw new Error(`Не удалось получить словарь: ${error.message}`)
  }

  const rows = (data ?? []) as DictionaryWordRow[]

  return {
    words: rows.map((row) => ({
      id: row.id,
      word: row.word,
      senseHint: row.sense_hint,
      level: row.level,
      source: row.source,
      transcription: row.transcription,
      meanings: row.word_meanings.map((meaning) => ({
        id: meaning.id,
        partOfSpeech: meaning.part_of_speech,
        translations: meaning.translation_values,
      })),
    })),
    total: count ?? 0,
  }
}
