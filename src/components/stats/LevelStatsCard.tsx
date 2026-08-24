import { BookOpen, CheckCircle2, Sparkles } from 'lucide-react'

import type { LevelStats } from '@/types'

import { Badge } from '../ui/badge'
import { Card } from '../ui/card'
import { Dialog, DialogTrigger } from '../ui/dialog'
import { Progress, ProgressLabel, ProgressValue } from '../ui/progress'

import { WordStatsDialog } from './WordStatsDialog'

interface LevelStatsCardProps {
  stats: LevelStats
}

export const LevelStatsCard = ({ stats }: LevelStatsCardProps) => {
  const { level, newCount, learningCount, knownCount, totalCount } = stats
  const knownPercent =
    totalCount === 0 ? 0 : Number(((knownCount / totalCount) * 100).toFixed(3))

  return (
    <Card className='gap-4 p-5'>
      <div className='flex items-center justify-between'>
        <Badge variant='secondary'>
          {level === 'all' ? 'Все уровни' : level}
        </Badge>
        <span className='text-sm text-muted-foreground'>
          Всего:{' '}
          <span className='font-medium text-foreground'>{totalCount}</span>
        </span>
      </div>

      <Progress value={knownPercent}>
        <ProgressLabel>Изучено</ProgressLabel>
        <ProgressValue />
      </Progress>

      <div className='grid grid-cols-3 gap-3'>
        <Dialog>
          <DialogTrigger className='flex flex-col items-center gap-1 rounded-xl bg-muted/50 p-3 text-center transition-colors hover:bg-muted'>
            <Sparkles className='size-4 text-muted-foreground' />
            <span className='text-lg font-semibold tabular-nums'>
              {newCount}
            </span>
            <span className='text-xs text-muted-foreground'>Новые</span>
          </DialogTrigger>
          <WordStatsDialog title='Новые' />
        </Dialog>

        <Dialog>
          <DialogTrigger className='flex flex-col items-center gap-1 rounded-xl bg-muted/50 p-3 text-center transition-colors hover:bg-muted'>
            <BookOpen className='size-4 text-muted-foreground' />
            <span className='text-lg font-semibold tabular-nums'>
              {learningCount}
            </span>
            <span className='text-xs text-muted-foreground'>Учу</span>
          </DialogTrigger>
          <WordStatsDialog title='Учу' />
        </Dialog>

        <Dialog>
          <DialogTrigger className='flex flex-col items-center gap-1 rounded-xl bg-muted/50 p-3 text-center transition-colors hover:bg-muted'>
            <CheckCircle2 className='size-4 text-muted-foreground' />
            <span className='text-lg font-semibold tabular-nums'>
              {knownCount}
            </span>
            <span className='text-xs text-muted-foreground'>Знаю</span>
          </DialogTrigger>
          <WordStatsDialog title='Знаю' />
        </Dialog>
      </div>
    </Card>
  )
}
