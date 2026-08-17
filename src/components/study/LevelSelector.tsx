import { CEFR_LEVELS, type CefrLevel } from '@/types'

import { Button } from '../ui/button'

interface LevelSelectorProps {
  selectedLevel: CefrLevel | null
  onSelect: (level: CefrLevel) => void
}

export const LevelSelector = ({
  selectedLevel,
  onSelect,
}: LevelSelectorProps) => (
  <div className='flex flex-wrap justify-center gap-3'>
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
