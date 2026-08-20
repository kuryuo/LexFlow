import type { DictionaryWord, StudyCandidate } from '@/types'

export function pickSessionWords(
  candidates: StudyCandidate[],
  count: number,
): DictionaryWord[] {
  const pool = [...candidates]
  const words: DictionaryWord[] = []
  const size = Math.min(count, pool.length)

  while (words.length < size) {
    const weights = pool.map((candidate) => studyWeight(candidate))
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)

    let r = Math.random() * totalWeight
    let selectedIndex = weights.length - 1

    for (let i = 0; i < weights.length; i++) {
      r -= weights[i]
      if (r <= 0) {
        selectedIndex = i
        break
      }
    }

    const [selected] = pool.splice(selectedIndex, 1)
    words.push(selected.word)
  }

  return words
}

function getFreshnessBonus(updatedAt: string): number {
  const diffMs = Date.now() - new Date(updatedAt).getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 1) {
    return 0
  }

  if (diffDays <= 3) {
    return 1
  }

  if (diffDays <= 7) {
    return 2
  }

  return 3
}

export function studyWeight(candidate: StudyCandidate): number {
  if (!candidate.progress) {
    return 8
  }

  const { correctCount, updatedAt } = candidate.progress

  let baseWeight: number

  switch (correctCount) {
    case 0:
      baseWeight = 7
      break
    case 1:
      baseWeight = 5
      break
    case 2:
      baseWeight = 3
      break
    case 3:
      baseWeight = 2
      break
    default:
      baseWeight = 1
      break
  }

  return baseWeight + getFreshnessBonus(updatedAt)
}
