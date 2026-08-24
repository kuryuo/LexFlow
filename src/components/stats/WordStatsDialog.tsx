import { useEffect } from 'react'

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
import { useStatsStore } from '@/store/stats.store'
import type { StudyLevel } from '@/types'

import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Skeleton } from '../ui/skeleton'

interface WordStatsDialogProps {
  title: string
  count: number
  level: StudyLevel
}

export const WordStatsDialog = ({
  title,
  level,
  count,
}: WordStatsDialogProps) => {
  const { candidates, isCandidatesLoading, candidatesError, loadCandidates } =
    useStatsStore()

  useEffect(() => {
    void loadCandidates(level)
  }, [level, loadCandidates])

  if (isCandidatesLoading) {
    return <Skeleton className='h-48 w-full' />
  }

  if (candidatesError) {
    return (
      <Alert variant='destructive'>
        <AlertTitle>Не удалось загрузить статистику</AlertTitle>
        <AlertDescription>{candidatesError}</AlertDescription>
      </Alert>
    )
  }

  const words = candidates.filter((candidate) => {
    if (title === 'Новые') return candidate.progress === null
    if (title === 'Учу') return candidate.progress?.status === 'learning'
    if (title === 'Знаю') return candidate.progress?.status === 'known'
    return false
  })

  return (
    <DialogContent className='sm:max-w-2xl' showCloseButton>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{count} слов</DialogDescription>
      </DialogHeader>

      <ScrollArea className='max-h-80'>
        <div className='flex flex-col gap-2 p-1 pr-3'>
          {words.map((candidate) => (
            <Card
              key={candidate.word.id}
              size='sm'
              className='rounded-xl py-2 shadow-none'
            >
              <div className='flex items-center gap-3 px-4'>
                <Badge variant='secondary'>{candidate.word.level}</Badge>

                <div className='min-w-0 flex-1'>
                  <p className='truncate font-medium'>{candidate.word.word}</p>
                  <p className='truncate text-xs text-muted-foreground'>
                    {candidate.word.meanings
                      .flatMap((m) => m.translations)
                      .join(', ')}
                  </p>
                </div>

                <Progress
                  value={((candidate.progress?.correctCount ?? 0) / 4) * 100}
                  className='w-20 shrink-0 items-center gap-1'
                >
                  <span className='text-xs tabular-nums text-muted-foreground'>
                    {candidate.progress?.correctCount ?? 0}/4
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
}
