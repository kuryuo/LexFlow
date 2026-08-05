import { GoogleGenAI } from '@google/genai'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'

const translationSchema = z.object({
  partOfSpeech: z.string().min(1),
  values: z.array(z.string().min(1)).min(1).max(3),
})

const translatedResponseSchema = z.array(
  z.object({
    id: z.string().min(1),
    translations: z.array(translationSchema).min(1),
  }),
)

interface PreparedWord {
  id: string
  word: string
  originalWord: string
  senseHint: string | null
  partsOfSpeech: string[]
  level: CefrLevel
  source: Source
}

interface TranslatedWord extends PreparedWord {
  translations: Array<{
    partOfSpeech: string
    values: string[]
  }>
  translationSource: 'gemini'
}

type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
type Source = 'oxford_3000' | 'oxford_5000'

const responseJsonSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'The unchanged input ID',
      },
      translations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            partOfSpeech: {
              type: 'string',
              description: 'The unchanged part of speech',
            },
            values: {
              type: 'array',
              items: { type: 'string' },
              minItems: 1,
              maxItems: 3,
              description: 'Concise Russian dictionary translations',
            },
          },
          required: ['partOfSpeech', 'values'],
          additionalProperties: false,
        },
      },
    },
    required: ['id', 'translations'],
    additionalProperties: false,
  },
} as const

const dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDirectory = path.join(dirname, 'data')
const inputPath = path.join(dataDirectory, 'words.prepared.json')
const outputPath = path.join(dataDirectory, 'words.translated.json')

function getRequiredEnvironmentVariable(
  name: 'GEMINI_API_KEY' | 'GEMINI_MODEL',
): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is not configured`)
  }

  return value
}

const model = getRequiredEnvironmentVariable('GEMINI_MODEL')
const apiKey = getRequiredEnvironmentVariable('GEMINI_API_KEY')

const ai = new GoogleGenAI({ apiKey })

function getNumberArgument(name: string, fallback: number): number {
  const prefix = `--${name}=`
  const argument = process.argv.find((item) => item.startsWith(prefix))
  const value = argument?.slice(prefix.length)

  if (!value) return fallback

  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid --${name}: ${value}`)
  }

  return parsed
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function createPrompt(words: PreparedWord[]): string {
  const input = words.map((item) => ({
    id: item.id,
    word: item.word,
    senseHint: item.senseHint,
    partsOfSpeech: item.partsOfSpeech,
    level: item.level,
  }))

  return `
Translate the supplied English vocabulary into Russian.

Rules:
- Return an entry for every input ID.
- Never modify an ID.
- Account for senseHint when it is present.
- Return every supplied part of speech separately.
- Keep partOfSpeech exactly as supplied.
- Give 1-3 concise dictionary equivalents, not explanations.
- Use the infinitive for Russian verbs.
- Use the nominative singular for countable Russian nouns when natural.
- Avoid duplicate translations.
- Do not include English explanations.
- Do not add information outside the requested JSON structure.

Input:
${JSON.stringify(input)}
`.trim()
}

function validateResponse(
  batch: PreparedWord[],
  response: z.infer<typeof translatedResponseSchema>,
): void {
  const expected = new Map(batch.map((item) => [item.id, item]))

  if (response.length !== batch.length) {
    throw new Error(
      `Expected ${batch.length} results, received ${response.length}`,
    )
  }

  for (const result of response) {
    const input = expected.get(result.id)

    if (!input) {
      throw new Error(`Unknown response ID: ${result.id}`)
    }

    const expectedParts = new Set(input.partsOfSpeech)
    const returnedParts = new Set(
      result.translations.map((item) => item.partOfSpeech),
    )

    if (
      expectedParts.size !== returnedParts.size ||
      [...expectedParts].some((part) => !returnedParts.has(part))
    ) {
      throw new Error(`Part-of-speech mismatch for ${input.originalWord}`)
    }
  }
}

async function translateBatch(
  batch: PreparedWord[],
): Promise<z.infer<typeof translatedResponseSchema>> {
  const interaction = await ai.interactions.create({
    model,
    input: createPrompt(batch),
    response_format: {
      type: 'text',
      mime_type: 'application/json',
      schema: responseJsonSchema,
    },
  })

  if (!interaction.output_text) {
    throw new Error('Gemini returned an empty response')
  }

  const parsed: unknown = JSON.parse(interaction.output_text)
  const result = translatedResponseSchema.parse(parsed)

  validateResponse(batch, result)

  return result
}

async function translateWithRetry(
  batch: PreparedWord[],
): Promise<z.infer<typeof translatedResponseSchema>> {
  const maxAttempts = 5

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await translateBatch(batch)
    } catch (error) {
      if (attempt === maxAttempts) throw error

      const waitTime = 10_000 * 2 ** (attempt - 1)

      console.warn(`Attempt ${attempt} failed. Retrying in ${waitTime / 1000}s`)
      console.warn(error)

      await delay(waitTime)
    }
  }

  throw new Error('Retry loop finished unexpectedly')
}

async function readExisting(): Promise<TranslatedWord[]> {
  try {
    const content = await fs.readFile(outputPath, 'utf8')
    return JSON.parse(content) as TranslatedWord[]
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return []
    }

    throw error
  }
}

async function saveCheckpoint(words: TranslatedWord[]) {
  const temporaryPath = `${outputPath}.tmp`

  await fs.writeFile(temporaryPath, JSON.stringify(words, null, 2), 'utf8')

  await fs.rm(outputPath, { force: true })
  await fs.rename(temporaryPath, outputPath)
}

async function main() {
  const prepared = JSON.parse(
    await fs.readFile(inputPath, 'utf8'),
  ) as PreparedWord[]

  const existing = await readExisting()
  const translatedById = new Map(existing.map((item) => [item.id, item]))

  const batchSize = getNumberArgument('batch', 10)
  const isAll = process.argv.includes('--all')
  const limit = isAll
    ? Number.POSITIVE_INFINITY
    : getNumberArgument('limit', 10)

  const pending = prepared
    .filter((item) => !translatedById.has(item.id))
    .slice(0, limit)

  console.log(`Model: ${model}`)
  console.log(`Already translated: ${translatedById.size}`)
  console.log(`Selected for translation: ${pending.length}`)
  console.log(`Batch size: ${batchSize}`)

  for (let index = 0; index < pending.length; index += batchSize) {
    const batch = pending.slice(index, index + batchSize)

    console.log(
      `Translating ${index + 1}-${index + batch.length} of ${pending.length}`,
    )

    const response = await translateWithRetry(batch)
    const responseById = new Map(response.map((item) => [item.id, item]))

    for (const word of batch) {
      const translated = responseById.get(word.id)

      if (!translated) {
        throw new Error(`Missing translation for ${word.id}`)
      }

      translatedById.set(word.id, {
        ...word,
        translations: translated.translations.map((translation) => ({
          partOfSpeech: translation.partOfSpeech,
          values: [
            ...new Set(
              translation.values.map((value) => value.trim()).filter(Boolean),
            ),
          ],
        })),
        translationSource: 'gemini',
      })
    }

    const ordered = prepared
      .map((item) => translatedById.get(item.id))
      .filter((item): item is TranslatedWord => Boolean(item))

    await saveCheckpoint(ordered)
    console.log(`Checkpoint saved: ${ordered.length}`)

    if (index + batchSize < pending.length) {
      await delay(7_000)
    }
  }

  console.log(`Done. Total translated: ${translatedById.size}`)
  console.log(`Saved: ${outputPath}`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
