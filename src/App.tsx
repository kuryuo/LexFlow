import { useQuery } from '@tanstack/react-query'

import { getDictionaryWords } from '@/services/dictionary.service'

function App() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['dictionary-words', 'A1', 1],
    queryFn: () =>
      getDictionaryWords({
        level: 'A1',
        page: 1,
        pageSize: 20,
      }),
  })

  if (isLoading) {
    return <main className='p-8'>Загрузка слов...</main>
  }

  if (error) {
    return (
      <main className='p-8 text-red-500'>
        {error instanceof Error ? error.message : 'Неизвестная ошибка'}
      </main>
    )
  }

  return (
    <main className='mx-auto max-w-3xl p-8'>
      <h1 className='mb-2 text-3xl font-bold'>Слова уровня A1</h1>
      <p className='mb-6 text-muted-foreground'>
        Всего слов: {data?.total ?? 0}
      </p>

      <div className='space-y-4'>
        {data?.words.map((word) => (
          <article key={word.id} className='rounded-lg border p-4'>
            <div className='flex items-baseline gap-3'>
              <h2 className='text-xl font-semibold'>{word.word}</h2>
              <span className='text-muted-foreground'>
                {word.transcription}
              </span>
            </div>

            {word.meanings.map((meaning) => (
              <div key={meaning.id} className='mt-2'>
                <span className='font-medium'>{meaning.partOfSpeech}: </span>
                <span>{meaning.translations.join(', ')}</span>
              </div>
            ))}
          </article>
        ))}
      </div>
    </main>
  )
}

export default App
