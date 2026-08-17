import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFParse } from 'pdf-parse'

type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
const LEVELS = new Set<CefrLevel>(['A1', 'A2', 'B1', 'B2', 'C1'])

type Source = 'oxford_3000' | 'oxford_5000'

interface RawWord {
  word: string
  partOfSpeech: string
  level: CefrLevel
  source: Source
}

const POS_TOKENS = [
  'indefinite article',
  'auxiliary v.',
  'modal v.',
  'det./pron.',
  'number',
  'exclam.',
  'prep.',
  'conj.',
  'det.',
  'pron.',
  'adj.',
  'adv.',
  'n.',
  'v.',
] as const

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const WORDS_DIR = path.join(ROOT, 'src/assets/words')
const OUT_DIR = path.join(ROOT, 'scripts/data')

async function extractText(pdfPath: string): Promise<string> {
  const data = await fs.readFile(pdfPath)
  const parser = new PDFParse({ data })
  const result = await parser.getText()
  await parser.destroy()
  return result.text
}

function isNoiseLine(line: string): boolean {
  if (!line) return true
  if (LEVELS.has(line as CefrLevel)) return false
  if (/oxford university press/i.test(line)) return true
  if (/the oxford (3000|5000)/i.test(line)) return true
  if (/^\d+\s*\/\s*\d+$/.test(line)) return true
  if (/^©/.test(line)) return true
  if (/is the list of/i.test(line)) return true
  if (/is an expanded core/i.test(line)) return true
  if (/as well as the oxford/i.test(line)) return true
  if (/which are listed here/i.test(line)) return true
  return false
}

function extractPosTail(
  line: string,
): { word: string; partOfSpeech: string } | null {
  let rest = line.trim()
  const found: string[] = []

  while (rest.length > 0) {
    let matched: string | null = null

    for (const token of POS_TOKENS) {
      const re = new RegExp(`(?:,\\s*)?${escapeRegExp(token)}$`, 'i')
      if (re.test(rest)) {
        matched = token
        rest = rest.replace(re, '').trim()
        break
      }
    }

    if (!matched) break
    found.unshift(matched)
  }

  const word = rest.replace(/\s+/g, ' ').trim()
  if (!word || found.length === 0) return null
  if (!/^[a-z]/.test(word)) return null

  return {
    word,
    partOfSpeech: found.join(', '),
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function parseOxfordText(text: string, source: Source): RawWord[] {
  const words: RawWord[] = []
  let level: CefrLevel | null = null

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/\u00a0/g, ' ').trim()
    if (!line) continue

    if (LEVELS.has(line as CefrLevel)) {
      level = line as CefrLevel
      continue
    }

    if (isNoiseLine(line) || !level) continue

    const parsed = extractPosTail(line)
    if (!parsed) continue

    words.push({
      word: parsed.word,
      partOfSpeech: parsed.partOfSpeech,
      level,
      source,
    })
  }

  return words
}

function dedupe(words: RawWord[]): RawWord[] {
  const map = new Map<string, RawWord>()

  for (const item of words) {
    const key = `${item.word.toLowerCase()}|${item.partOfSpeech.toLowerCase()}`
    if (!map.has(key) || item.source === 'oxford_3000') {
      map.set(key, item)
    }
  }

  return [...map.values()].sort((a, b) => {
    const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1']
    const byLevel = levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level)
    if (byLevel !== 0) return byLevel
    return a.word.localeCompare(b.word)
  })
}

function printStats(words: RawWord[]) {
  const byLevel = Object.fromEntries(
    (['A1', 'A2', 'B1', 'B2', 'C1'] as CefrLevel[]).map((level) => [
      level,
      words.filter((w) => w.level === level).length,
    ]),
  )

  console.log('Total:', words.length)
  console.log('By level:', byLevel)
  console.log(
    'By source:',
    Object.fromEntries(
      (['oxford_3000', 'oxford_5000'] as Source[]).map((source) => [
        source,
        words.filter((w) => w.source === source).length,
      ]),
    ),
  )
}

async function main() {
  const files: Array<{ file: string; source: Source }> = [
    { file: 'The_Oxford_3000_by_CEFR_level.pdf', source: 'oxford_3000' },
    { file: 'The_Oxford_5000_by_CEFR_level.pdf', source: 'oxford_5000' },
  ]

  const all: RawWord[] = []

  for (const { file, source } of files) {
    const pdfPath = path.join(WORDS_DIR, file)
    console.log('Parsing', file)
    const text = await extractText(pdfPath)
    const parsed = parseOxfordText(text, source)
    console.log(`  → ${parsed.length} entries`)
    all.push(...parsed)
  }

  const words = dedupe(all)
  printStats(words)

  await fs.mkdir(OUT_DIR, { recursive: true })
  const outPath = path.join(OUT_DIR, 'words.raw.json')
  await fs.writeFile(outPath, JSON.stringify(words, null, 2), 'utf8')
  console.log('Saved:', outPath)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
