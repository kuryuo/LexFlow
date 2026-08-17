import { useState } from 'react'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Progress } from '../ui/progress'

interface FlashcardProps {
  level: string
  front: string
  back: string
  transcription: string
  isDisabled: boolean
  current: number
  total: number
  onKnow: () => void
  onUnknown: () => void
}

export const Flashcard = ({
  level,
  front,
  back,
  transcription,
  onKnow,
  onUnknown,
  isDisabled,
  current,
  total,
}: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false)

  function handleAnswer(onAnswer: () => void) {
    setIsFlipped(false)
    onAnswer()
  }

  function handleClick() {
    setIsFlipped((prev) => !prev)
  }

  const progressValue = total === 0 ? 0 : (current / total) * 100

  return (
    <div className='flex w-full max-w-sm flex-col gap-3'>
      <Progress value={progressValue} className='w-full items-center'>
        <span className='shrink-0 text-sm tabular-nums text-muted-foreground'>
          {current} / {total}
        </span>
      </Progress>

      <div className='[perspective:1000px]'>
        <div
          className={`relative min-h-64 transform-3d transition-transform duration-500 ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={handleClick}
        >
          <Card className='absolute inset-0 flex flex-col items-center justify-center backface-hidden'>
            <Badge className='absolute top-4 left-4' variant='secondary'>
              {level}
            </Badge>
            <div
              className={`text-center transition-opacity duration-150 ${
                isDisabled ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <p className='text-3xl font-semibold'>{front}</p>
              <p className='text-muted-foreground'>{transcription}</p>
            </div>
          </Card>

          <Card className='absolute inset-0 flex rotate-y-180 flex-col items-center justify-center backface-hidden'>
            <Badge className='absolute top-4 left-4' variant='secondary'>
              {level}
            </Badge>
            <div className='text-center'>
              <p className='text-3xl font-semibold'>{back}</p>
            </div>
            <div className='absolute bottom-4 flex gap-2'>
              <Button
                disabled={isDisabled}
                variant='outline'
                onClick={(event) => {
                  event.stopPropagation()
                  handleAnswer(onUnknown)
                }}
              >
                Не знаю
              </Button>
              <Button
                disabled={isDisabled}
                onClick={(event) => {
                  event.stopPropagation()
                  handleAnswer(onKnow)
                }}
              >
                Знаю
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
