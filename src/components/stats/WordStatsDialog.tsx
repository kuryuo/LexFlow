import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { StudyLevel } from '@/types'

interface WordStatsDialogProps {
  title: string
  level: StudyLevel
}

const MOCK_WORDS = [
  { level: 'A1', word: 'apple', translation: 'яблоко', correctCount: 1 },
  { level: 'A2', word: 'although', translation: 'хотя', correctCount: 2 },
  { level: 'B1', word: 'achieve', translation: 'достигать', correctCount: 3 },
  { level: 'B2', word: 'abandon', translation: 'покидать', correctCount: 4 },
]

export const WordStatsDialog = ({ title }: WordStatsDialogProps) => (
  <DialogContent className='sm:max-w-lg' showCloseButton>
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>4 слова</DialogDescription>
    </DialogHeader>

    <ScrollArea className='max-h-80'>
      <div className='flex flex-col gap-2 p-1 pr-3'>
        {MOCK_WORDS.map((item) => (
          <Card
            key={item.word}
            size='sm'
            className='rounded-xl py-2 shadow-none'
          >
            <div className='flex items-center gap-3 px-4'>
              <Badge variant='secondary'>{item.level}</Badge>

              <div className='min-w-0 flex-1'>
                <p className='truncate font-medium'>{item.word}</p>
                <p className='truncate text-xs text-muted-foreground'>
                  {item.translation}
                </p>
              </div>

              <Progress
                value={(item.correctCount / 4) * 100}
                className='w-20 shrink-0 items-center gap-1'
              >
                <span className='text-xs tabular-nums text-muted-foreground'>
                  {item.correctCount}/4
                </span>
              </Progress>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>

    <DialogFooter>
      <Button size='lg' className='w-full sm:w-auto'>
        Повторение
      </Button>
    </DialogFooter>
  </DialogContent>
)
