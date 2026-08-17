import { useState } from 'react'

import { LevelSelector } from '@/components/study/LevelSelector'
import { StudySession } from '@/components/study/StudySession'
import { WordCountSelector } from '@/components/study/WordCountSelector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CefrLevel, WordCount } from '@/types'

export function StudyPage() {
  const [selectedLevel, setSelectedLevel] = useState<CefrLevel | null>(null)
  const [selectedCount, setSelectedCount] = useState<WordCount | null>(null)
  const [hasStarted, setHasStarted] = useState(false)

  return (
    <div className='flex min-h-[calc(100vh-4.5rem)] justify-center px-6 py-16'>
      <div className='flex w-full max-w-2xl flex-col items-center gap-8'>
        {hasStarted && selectedLevel && selectedCount ? (
          <StudySession wordCount={selectedCount} wordLevel={selectedLevel} />
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

            <Card className='w-full py-8'>
              <CardHeader className='items-center text-center'>
                <CardTitle>Количество карточек</CardTitle>
              </CardHeader>
              <CardContent>
                <WordCountSelector
                  selectedCount={selectedCount}
                  onSelect={setSelectedCount}
                />
              </CardContent>
            </Card>

            <Button
              size='lg'
              className='min-w-48'
              disabled={!selectedLevel || !selectedCount}
              onClick={() => setHasStarted(true)}
            >
              Начать
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
