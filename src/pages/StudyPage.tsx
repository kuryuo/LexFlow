import { useState } from 'react'

import { StatsOverview } from '@/components/stats/StatsOverview'
import { LevelSelector } from '@/components/study/LevelSelector'
import { StartStudyDialog } from '@/components/study/StartStudyDialog'
import { StudySession } from '@/components/study/StudySession'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import type { StudyLevel, WordCount } from '@/types'

export function StudyPage() {
  const [selectedLevel, setSelectedLevel] = useState<StudyLevel | null>(null)
  const [selectedCount, setSelectedCount] = useState<WordCount | null>(null)
  const [hasStarted, setHasStarted] = useState(false)

  return (
    <div className='flex min-h-[calc(100vh-4.5rem)] justify-center px-6 py-16'>
      <div className='flex w-full max-w-2xl flex-col items-center gap-8'>
        {hasStarted && selectedLevel && selectedCount ? (
          <StudySession
            wordLevel={selectedLevel}
            wordCount={selectedCount}
            onBack={() => setHasStarted(false)}
          />
        ) : (
          <>
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
                nativeButton={false}
                className='w-full'
                render={
                  <Card className='w-full cursor-pointer py-6 transition-colors hover:bg-muted/40' />
                }
              >
                <CardHeader className='items-center text-center'>
                  <CardTitle>Карточки</CardTitle>
                  <CardDescription>
                    Выберите режим и начните сессию
                  </CardDescription>
                </CardHeader>
              </DialogTrigger>
              <StartStudyDialog
                selectedLevel={selectedLevel}
                onSelectLevel={setSelectedLevel}
                selectedCount={selectedCount}
                onSelectCount={setSelectedCount}
                onStart={() => setHasStarted(true)}
              />
            </Dialog>
          </>
        )}
      </div>
    </div>
  )
}
