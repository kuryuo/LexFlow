import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

interface RawWord {
  word: string
  partOfSpeech: string
  level: CefrLevel
  source: Source
}

interface PreparedWord {
  id: string
  word: string
  originalWord: string
  senseHint: string | null
  partsOfSpeech: string[]
  level: CefrLevel
  source: Source
}

type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
type Source = 'oxford_3000' | 'oxford_5000'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDirectory = path.join(dirname, 'data')
const inputPath = path.join(dataDirectory, 'words.raw.json')
const outputPath = path.join(dataDirectory, 'words.prepared.json')

const OXFORD_SENSE_HINTS: Record<string, string> = {
  used1: 'familiar with something because it is experienced often',
  used2: 'previously owned or used; second-hand',
}

function splitWord(originalWord: string): {
  word: string
  senseHint: string | null
} {
  const match = originalWord.match(/^(.*?)\s+\(([^()]*)\)$/)

  const wordWithMarker = match?.[1] ?? originalWord
  const senseHint =
    match?.[2]?.trim() ?? OXFORD_SENSE_HINTS[originalWord] ?? null

  // Oxford uses markers such as last1 and second1.
  const word = wordWithMarker.replace(/([a-z])\d+$/i, '$1').trim()

  return { word, senseHint }
}

function splitPartsOfSpeech(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

function createId(word: Omit<PreparedWord, 'id'>): string {
  const source = [
    word.word.toLowerCase(),
    word.senseHint?.toLowerCase() ?? '',
    word.partsOfSpeech.join(','),
    word.level,
    word.source,
  ].join('|')

  return createHash('sha256').update(source).digest('hex').slice(0, 16)
}

async function main() {
  const raw = JSON.parse(await fs.readFile(inputPath, 'utf8')) as RawWord[]

  const prepared = raw.map((item): PreparedWord => {
    const { word, senseHint } = splitWord(item.word)

    const withoutId: Omit<PreparedWord, 'id'> = {
      word,
      originalWord: item.word,
      senseHint,
      partsOfSpeech: splitPartsOfSpeech(item.partOfSpeech),
      level: item.level,
      source: item.source,
    }

    return {
      id: createId(withoutId),
      ...withoutId,
    }
  })

  const uniqueIds = new Set(prepared.map((item) => item.id))

  if (uniqueIds.size !== prepared.length) {
    throw new Error(`Duplicate IDs: ${prepared.length - uniqueIds.size}`)
  }

  await fs.writeFile(outputPath, JSON.stringify(prepared, null, 2), 'utf8')

  console.log(`Prepared: ${prepared.length}`)
  console.log(`Saved: ${outputPath}`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
