import { useEffect } from 'react'

import { useStudyStore } from '@/store/study.store'
import type { CefrLevel, WordCount } from '@/types'

import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Skeleton } from '../ui/skeleton'

import { Flashcard } from './Flashcard'

interface StudySessionProps {
  wordCount: WordCount
  wordLevel: CefrLevel
}

export const StudySession = ({ wordCount, wordLevel }: StudySessionProps) => {
  const {
    words,
    currentIndex,
    isLoading,
    error,
    submitAnswer,
    isSubmitting,
    loadWords,
  } = useStudyStore()

  const currentWord = words[currentIndex]

  useEffect(() => {
    void loadWords(wordLevel, wordCount)
  }, [])

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
      current={currentIndex}
      total={wordCount}
    />
  )
}
