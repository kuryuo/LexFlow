import { CEFR_LEVELS, type StudyLevel } from '@/types'

import { Button } from '../ui/button'

interface LevelSelectorProps {
  selectedLevel: StudyLevel | null
  onSelect: (level: StudyLevel) => void
}

export const LevelSelector = ({
  selectedLevel,
  onSelect,
}: LevelSelectorProps) => (
  <div className='flex flex-wrap justify-center gap-3'>
    <Button
      size='lg'
      variant={selectedLevel === 'all' ? 'default' : 'outline'}
      onClick={() => onSelect('all')}
    >
      Все
    </Button>
    {CEFR_LEVELS.map((level) => (
      <Button
        key={level}
        size='lg'
        className='min-w-16'
        variant={level === selectedLevel ? 'default' : 'outline'}
        onClick={() => onSelect(level)}
      >
        {level}
      </Button>
    ))}
  </div>
)
