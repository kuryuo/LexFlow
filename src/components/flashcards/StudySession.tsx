import { useEffect } from 'react'

import { useStudyStore } from '@/store/study.store'

import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Skeleton } from '../ui/skeleton'

import { Flashcard } from './Flashcard'

export function StudySession() {
  const {
    words,
    currentIndex,
    isLoading,
    error,
    loadWords,
    submitAnswer,
    isSubmitting,
  } = useStudyStore()

  const currentWord = words[currentIndex]

  useEffect(() => {
    void loadWords('A1')
  }, [loadWords])

  if (isLoading) {
    return <Skeleton className='h-64 w-full max-w-sm' />
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertTitle>Не удалось загрузить слова</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!currentWord) {
    return <p>Слова не найдены</p>
  }

  const translation =
    currentWord.meanings
      .flatMap((meaning) => meaning.translations)
      .join(', ') || 'Перевод отсутствует'

  return (
    <Flashcard
      level={currentWord.level}
      front={currentWord.word}
      transcription={currentWord.transcription}
      back={translation}
      onKnow={() => void submitAnswer({ knew: true })}
      onUnknown={() => void submitAnswer({ knew: false })}
      isDisabled={isSubmitting}
    />
  )
}
