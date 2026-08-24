import { useState } from 'react'

import { StatsOverview } from '@/components/stats/StatsOverview'
import { LevelSelector } from '@/components/study/LevelSelector'
import { StartStudyDialog } from '@/components/study/StartStudyDialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import type { StudyLevel } from '@/types'

export function StudyPage() {
  const [selectedLevel, setSelectedLevel] = useState<StudyLevel | null>(null)

  return (
    <div className='flex min-h-[calc(100vh-4.5rem)] justify-center px-6 py-16'>
      <div className='flex w-full max-w-2xl flex-col items-center gap-8'>
        <Card className='w-full py-8'>
          <CardHeader className='items-center text-center'>
            <CardTitle>Выберите уровень</CardTitle>
          </CardHeader>
          <CardContent>
            <LevelSelector
              selectedLevel={selectedLevel}
              onSelect={setSelectedLevel}
            />
          </CardContent>
        </Card>

        {selectedLevel && <StatsOverview selectedLevel={selectedLevel} />}

        <Dialog>
          <DialogTrigger
            className='w-full'
            render={
              <Card className='w-full cursor-pointer py-6 transition-colors hover:bg-muted/40' />
            }
          >
            <CardHeader className='items-center text-center'>
              <CardTitle>Карточки</CardTitle>
              <CardDescription>Выберите режим и начните сессию</CardDescription>
            </CardHeader>
          </DialogTrigger>
          <StartStudyDialog />
        </Dialog>
      </div>
    </div>
  )
}
