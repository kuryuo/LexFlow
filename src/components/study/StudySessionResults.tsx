import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { CefrLevel } from '@/types'

interface StudySessionResultsProps {
  level: CefrLevel
  correctCount: number
  total: number
  onRetry: () => void
  onBack: () => void
}

export const StudySessionResults = ({
  level,
  correctCount,
  total,
  onRetry,
  onBack,
}: StudySessionResultsProps) => {
  return (
    <Card className='relative w-full max-w-sm p-8 text-center'>
      <Badge className='absolute top-4 left-4' variant='secondary'>
        {level}
      </Badge>

      <p className='mt-6 text-sm text-muted-foreground'>Правильных ответов</p>
      <p className='mt-2 text-4xl font-semibold tabular-nums'>
        {correctCount} из {total}
      </p>

      <div className='mt-8 flex justify-center gap-2'>
        <Button size='lg' onClick={onRetry}>
          Ещё раз
        </Button>
        <Button size='lg' onClick={onBack} variant='outline'>
          Назад
        </Button>
      </div>
    </Card>
  )
}
