import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs/promises'
import path from 'node:path'
import { loadEnvFile } from 'node:process'
import { fileURLToPath } from 'node:url'

interface Translation {
  partOfSpeech: string
  values: string[]
}

interface TranslatedWord {
  id: string
  word: string
  senseHint: string | null
  level: string
  source: string
  transcription: string
  translations: Translation[]
}

interface DictionaryWordRow {
  id: string
  word: string
  sense_hint: string | null
  level: string
  source: string
  transcription: string
}

interface WordMeaningRow {
  word_id: string
  part_of_speech: string
  translation_values: string[]
}

const BATCH_SIZE = 250

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootPath = path.resolve(__dirname, '..')
const wordsPath = path.join(__dirname, 'data', 'words.translated.json')

loadEnvFile(path.join(rootPath, '.env.scripts.local'))

const supabaseUrl = process.env.SUPABASE_URL
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error('Не заданы SUPABASE_URL или SUPABASE_SECRET_KEY')
}

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function main(): Promise<void> {
  const content = await fs.readFile(wordsPath, 'utf8')
  const parsed: unknown = JSON.parse(content)

  if (!Array.isArray(parsed)) {
    throw new Error('Ожидался массив слов')
  }

  const words = parsed as TranslatedWord[]

  const wordRows: DictionaryWordRow[] = words.map((word) => ({
    id: word.id,
    word: word.word,
    sense_hint: word.senseHint,
    level: word.level,
    source: word.source,
    transcription: word.transcription,
  }))

  const meaningRows: WordMeaningRow[] = words.flatMap((word) =>
    word.translations.map((translation) => ({
      word_id: word.id,
      part_of_speech: translation.partOfSpeech,
      translation_values: translation.values,
    })),
  )

  console.log(`Подготовлено слов: ${wordRows.length}`)
  console.log(`Подготовлено значений: ${meaningRows.length}`)

  for (let offset = 0; offset < wordRows.length; offset += BATCH_SIZE) {
    const batch = wordRows.slice(offset, offset + BATCH_SIZE)

    const { error } = await supabase
      .from('dictionary_words')
      .upsert(batch, { onConflict: 'id' })

    if (error) {
      throw new Error(`Ошибка импорта слов: ${error.message}`)
    }

    console.log(
      `Загружено слов: ${Math.min(offset + BATCH_SIZE, wordRows.length)}`,
    )
  }

  for (let offset = 0; offset < meaningRows.length; offset += BATCH_SIZE) {
    const batch = meaningRows.slice(offset, offset + BATCH_SIZE)

    const { error } = await supabase
      .from('word_meanings')
      .upsert(batch, { onConflict: 'word_id,part_of_speech' })

    if (error) {
      throw new Error(`Ошибка импорта значений: ${error.message}`)
    }

    console.log(
      `Загружено значений: ${Math.min(offset + BATCH_SIZE, meaningRows.length)}`,
    )
  }

  const { count: wordsCount, error: wordsCountError } = await supabase
    .from('dictionary_words')
    .select('*', { count: 'exact', head: true })

  if (wordsCountError) {
    throw wordsCountError
  }

  const { count: meaningsCount, error: meaningsCountError } = await supabase
    .from('word_meanings')
    .select('*', { count: 'exact', head: true })

  if (meaningsCountError) {
    throw meaningsCountError
  }

  console.log('Импорт завершён')
  console.log(`Слов в базе: ${wordsCount ?? 0}`)
  console.log(`Значений в базе: ${meaningsCount ?? 0}`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
