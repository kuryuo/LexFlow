import { useState } from 'react'
import { BookOpen, CheckCircle2, Sparkles } from 'lucide-react'

import { LevelSelector } from '@/components/study/LevelSelector'
import { WordCountSelector } from '@/components/study/WordCountSelector'
import { Button } from '@/components/ui/button'
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { StudyLevel, WordCount } from '@/types'

const MODES = [
  { id: 'new', label: 'Изучать новое', icon: Sparkles },
  { id: 'learning', label: 'Повторять', icon: BookOpen },
  { id: 'known', label: 'Повторять изученное', icon: CheckCircle2 },
] as const

export const StartStudyDialog = () => {
  const [level, setLevel] = useState<StudyLevel | null>(null)
  const [mode, setMode] = useState<string | null>(null)
  const [count, setCount] = useState<WordCount | null>(null)

  return (
    <DialogContent className='sm:max-w-2xl' showCloseButton>
      <DialogHeader>
        <DialogTitle>Карточки</DialogTitle>
      </DialogHeader>

      <div className='flex flex-col gap-6'>
        <div className='flex flex-col gap-3'>
          <p className='text-center text-sm font-medium'>Уровень</p>
          <LevelSelector selectedLevel={level} onSelect={setLevel} />
        </div>

        <div className='flex flex-col gap-3'>
          <p className='text-center text-sm font-medium'>Режим</p>
          <div className='grid grid-cols-3 gap-3'>
            {MODES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type='button'
                className={`flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-colors ${
                  mode === id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 hover:bg-muted'
                }`}
                onClick={() => setMode(id)}
              >
                <Icon className='size-4' />
                <span className='text-xs leading-tight'>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className='flex flex-col gap-3'>
          <p className='text-center text-sm font-medium'>Количество карточек</p>
          <WordCountSelector selectedCount={count} onSelect={setCount} />
        </div>
      </div>

      <DialogFooter>
        <Button size='lg' className='w-full' disabled>
          Начать
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
