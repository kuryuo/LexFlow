import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const
const SOURCES = ['oxford_3000', 'oxford_5000'] as const

type CefrLevel = (typeof LEVELS)[number]

const levelSet = new Set<string>(LEVELS)
const sourceSet = new Set<string>(SOURCES)

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const wordsPath = path.join(__dirname, 'data', 'words.translated.json')

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isNonEmptyStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.length > 0 && value.every(isNonEmptyString)
  )
}

function hasValidTranslations(value: unknown): boolean {
  if (!Array.isArray(value) || value.length === 0) {
    return false
  }

  return value.every((translation) => {
    if (!isRecord(translation)) {
      return false
    }

    return (
      isNonEmptyString(translation.partOfSpeech) &&
      isNonEmptyStringArray(translation.values)
    )
  })
}

async function main(): Promise<void> {
  const content = await fs.readFile(wordsPath, 'utf8')
  const data: unknown = JSON.parse(content)

  if (!Array.isArray(data)) {
    throw new Error('Ожидался массив слов')
  }

  const seenIds = new Set<string>()

  const wordsByLevel: Record<CefrLevel, number> = {
    A1: 0,
    A2: 0,
    B1: 0,
    B2: 0,
    C1: 0,
  }

  let invalidRecordsCount = 0
  let invalidRequiredFieldsCount = 0
  let invalidLevelsCount = 0
  let invalidSourcesCount = 0
  let invalidPartsOfSpeechCount = 0
  let invalidTranscriptionsCount = 0
  let invalidTranslationsCount = 0
  let duplicateIdsCount = 0

  for (const item of data) {
    if (!isRecord(item)) {
      invalidRecordsCount += 1
      continue
    }

    if (!isNonEmptyString(item.id) || !isNonEmptyString(item.word)) {
      invalidRequiredFieldsCount += 1
    }

    if (isNonEmptyString(item.id)) {
      if (seenIds.has(item.id)) {
        duplicateIdsCount += 1
      } else {
        seenIds.add(item.id)
      }
    }

    if (typeof item.level !== 'string' || !levelSet.has(item.level)) {
      invalidLevelsCount += 1
    } else {
      wordsByLevel[item.level as CefrLevel] += 1
    }

    if (typeof item.source !== 'string' || !sourceSet.has(item.source)) {
      invalidSourcesCount += 1
    }

    if (!isNonEmptyStringArray(item.partsOfSpeech)) {
      invalidPartsOfSpeechCount += 1
    }

    if (!isNonEmptyString(item.transcription)) {
      invalidTranscriptionsCount += 1
    }

    if (!hasValidTranslations(item.translations)) {
      invalidTranslationsCount += 1
    }
  }

  console.log(`Всего записей: ${data.length}`)
  console.log(`Уникальных ID: ${seenIds.size}`)
  console.log(`Повторяющихся ID: ${duplicateIdsCount}`)
  console.log(`Некорректных объектов: ${invalidRecordsCount}`)
  console.log(`Некорректных обязательных полей: ${invalidRequiredFieldsCount}`)
  console.log(`Некорректных уровней: ${invalidLevelsCount}`)
  console.log(`Некорректных источников: ${invalidSourcesCount}`)
  console.log(`Некорректных частей речи: ${invalidPartsOfSpeechCount}`)
  console.log(`Некорректных транскрипций: ${invalidTranscriptionsCount}`)
  console.log(`Некорректных переводов: ${invalidTranslationsCount}`)
  console.log('Количество слов по уровням:', wordsByLevel)

  const errorsCount =
    invalidRecordsCount +
    invalidRequiredFieldsCount +
    invalidLevelsCount +
    invalidSourcesCount +
    invalidPartsOfSpeechCount +
    invalidTranscriptionsCount +
    invalidTranslationsCount +
    duplicateIdsCount

  if (errorsCount > 0) {
    process.exitCode = 1
  }
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
