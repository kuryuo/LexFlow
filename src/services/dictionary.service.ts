import { supabase } from '@/lib/supabase'
import type {
  CefrLevel,
  DictionaryWord,
  StudyCandidate,
  StudyLevel,
  UserWordProgress,
  WordStatus,
} from '@/types'

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

interface ProgressRow {
  id: string
  user_id: string
  word_id: string
  status: WordStatus
  correct_count: number
  updated_at: string
  created_at: string
}

interface GetDictionaryWordsParams {
  level: StudyLevel
  page?: number
  pageSize?: number
}

interface GetDictionaryWordsResult {
  words: DictionaryWord[]
  total: number
}

function mapWord(row: DictionaryWordRow): DictionaryWord {
  return {
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
  }
}

function mapProgress(row: ProgressRow): UserWordProgress {
  return {
    id: row.id,
    userId: row.user_id,
    wordId: row.word_id,
    status: row.status,
    correctCount: row.correct_count,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  }
}

export async function getDictionaryWords({
  level,
  page = 1,
  pageSize = 20,
}: GetDictionaryWordsParams): Promise<GetDictionaryWordsResult> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase.from('dictionary_words').select(
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

  if (level !== 'all') {
    query = query.eq('level', level)
  }

  const { data, count, error } = await query.order('word').range(from, to)

  if (error) {
    throw new Error(`Не удалось получить словарь: ${error.message}`)
  }

  const rows = (data ?? []) as DictionaryWordRow[]

  return {
    words: rows.map(mapWord),
    total: count ?? 0,
  }
}

export async function getStudyCandidates(
  level: StudyLevel,
): Promise<StudyCandidate[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error(
      `Не удалось определить пользователя: ${userError?.message ?? 'нет сессии'}`,
    )
  }

  let wordsQuery = supabase.from('dictionary_words').select(
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
  )

  if (level !== 'all') {
    wordsQuery = wordsQuery.eq('level', level)
  }

  const { data: wordsData, error: wordsError } = await wordsQuery

  if (wordsError) {
    throw new Error(`Не удалось получить слова: ${wordsError.message}`)
  }

  const wordRows = (wordsData ?? []) as DictionaryWordRow[]
  const wordIds = wordRows.map((row) => row.id)

  if (wordIds.length === 0) {
    return []
  }

  const { data: progressData, error: progressError } = await supabase
    .from('user_word_progress')
    .select(
      'id, user_id, word_id, status, correct_count, updated_at, created_at',
    )
    .eq('user_id', user.id)
    .in('word_id', wordIds)

  if (progressError) {
    throw new Error(`Не удалось получить прогресс: ${progressError.message}`)
  }

  const progressByWordId = new Map(
    ((progressData ?? []) as ProgressRow[]).map((row) => [
      row.word_id,
      mapProgress(row),
    ]),
  )

  return wordRows.map((row) => ({
    word: mapWord(row),
    progress: progressByWordId.get(row.id) ?? null,
  }))
}
