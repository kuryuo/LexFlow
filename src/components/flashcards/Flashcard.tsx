import { useState } from 'react'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card } from '../ui/card'

interface FlashcardProps {
  level: string
  front: string
  back: string
  transcription: string
}

export const Flashcard = ({
  level,
  front,
  back,
  transcription,
}: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false)

  function handleClick() {
    setIsFlipped((prev) => !prev)
  }

  return (
    <div className='w-full max-w-sm [perspective:1000px]'>
      <div
        className={`relative min-h-64 transform-3d transition-transform duration-500 ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={handleClick}
      >
        <Card className='absolute inset-0 backface-hidden flex flex-col items-center justify-center'>
          <Badge className='absolute top-4 left-4' variant='secondary'>
            {level}
          </Badge>
          <p className='text-3xl font-semibold'>{front}</p>
        </Card>

        <Card className='absolute inset-0 backface-hidden flex rotate-y-180 flex-col items-center justify-center'>
          <Badge className='absolute top-4 left-4' variant='secondary'>
            {level}
          </Badge>
          <div className='text-center'>
            <p className='text-3xl font-semibold'>{back}</p>
            <p className='text-muted-foreground'>{transcription}</p>
          </div>
          <div className='absolute bottom-4 flex gap-2'>
            <Button variant='outline' onClick={(e) => e.stopPropagation()}>
              Не знаю
            </Button>
            <Button onClick={(e) => e.stopPropagation()}>Знаю</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
