import { supabase } from '@/lib/supabase'
import type { CefrLevel, LevelStats } from '@/types'

interface AnswerWordParams {
  wordId: string
  knew: boolean
}

export async function getLevelStats(level: CefrLevel): Promise<LevelStats> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error(
      `Не удалось определить пользователя: ${error?.message ?? 'нет сессии'}`,
    )
  }

  const { count: totalCount, error: totalError } = await supabase
    .from('dictionary_words')
    .select('*', { count: 'exact', head: true })
    .eq('level', level)

  if (totalError) {
    throw new Error(
      `Не удалось получить количество слов: ${totalError.message}`,
    )
  }

  const { data: progressRows, error: progressError } = await supabase
    .from('user_word_progress')
    .select('status, dictionary_words!inner(level)')
    .eq('user_id', user.id)
    .eq('dictionary_words.level', level)

  if (progressError) {
    throw new Error(
      `Не удалось получить прогресс по уровню: ${progressError.message}`,
    )
  }

  const rows = progressRows ?? []
  const knownCount = rows.filter((row) => row.status === 'known').length
  const learningCount = rows.filter((row) => row.status === 'learning').length
  const safeTotalCount = totalCount ?? 0
  const newCount = safeTotalCount - knownCount - learningCount

  return {
    level,
    newCount,
    learningCount,
    knownCount,
    totalCount: safeTotalCount,
  }
}

export async function answerWord({ wordId, knew }: AnswerWordParams) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error(
      `Не удалось определить пользователя: ${error?.message ?? 'нет сессии'}`,
    )
  }

  const { data, error: fetchError } = await supabase
    .from('user_word_progress')
    .select('correct_count, status')
    .eq('user_id', user.id)
    .eq('word_id', wordId)
    .maybeSingle()
  if (fetchError) {
    throw new Error(
      `Не удалось получить прогресс: ${fetchError?.message ?? 'ошибка'}`,
    )
  }

  let nextCount: number

  if (!data) {
    nextCount = knew ? 1 : 0
  } else {
    nextCount = knew
      ? data.correct_count + 1
      : Math.max(0, data.correct_count - 1)
  }

  const nextStatus = nextCount >= 4 ? 'known' : 'learning'

  const { data: saved, error: upsertError } = await supabase
    .from('user_word_progress')
    .upsert(
      {
        user_id: user.id,
        word_id: wordId,
        status: nextStatus,
        correct_count: nextCount,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,word_id' },
    )
    .select()
    .single()
  if (upsertError) {
    throw new Error(`Не удалось сохранить прогресс: ${upsertError.message}`)
  }

  return {
    id: saved.id,
    userId: saved.user_id,
    wordId: saved.word_id,
    status: saved.status,
    correctCount: saved.correct_count,
    updatedAt: saved.updated_at,
    createdAt: saved.created_at,
  }
}
