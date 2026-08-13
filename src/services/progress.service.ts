import { supabase } from '@/lib/supabase'

interface AnswerWordParams {
  wordId: string
  knew: boolean
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
