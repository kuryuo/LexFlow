import { WORD_COUNTS, type WordCount } from '@/types'

import { Button } from '../ui/button'

interface WordCountSelectorProps {
  selectedCount: WordCount | null
  onSelect: (count: WordCount) => void
}

export const WordCountSelector = ({
  selectedCount,
  onSelect,
}: WordCountSelectorProps) => (
  <div className='flex flex-wrap justify-center gap-3'>
    {WORD_COUNTS.map((count) => (
      <Button
        key={count}
        variant={count === selectedCount ? 'default' : 'outline'}
        onClick={() => onSelect(count)}
      >
        {count}
      </Button>
    ))}
  </div>
)
