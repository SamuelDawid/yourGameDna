import { describe, expect, it } from 'vitest'
import type { GameStatus, LibraryEntry } from '../../api/types'
import { computeGameDna, pearson } from './computeDna'

let nextId = 1
function entry(status: GameStatus, ratings: [number, number, number, number, number] | null, daysAgo = 0): LibraryEntry {
  const id = nextId++
  return {
    rawgId: id,
    gameName: `Gra ${id}`,
    status,
    rating: ratings?.[0] ?? null,
    gameplayRating: ratings?.[1] ?? null,
    graphicsRating: ratings?.[2] ?? null,
    storyRating: ratings?.[3] ?? null,
    monetizationRating: ratings?.[4] ?? null,
    review: null,
    createdAt: new Date(Date.UTC(2026, 9, 15 - daysAgo)).toISOString(),
  }
}

describe('computeGameDna', () => {
  it('nie wyznacza typu, gdy ocenionych gier jest za mało', () => {
    const dna = computeGameDna([entry('COMPLETED', [9, 8, 8, 9, 10]), entry('NONE', null)])
    expect(dna.archetype).toBeNull()
    expect(dna.totalGames).toBe(2)
    expect(dna.ratedGames).toBe(1)
  })

  it('wybiera gen, który najmocniej idzie w parze z oceną ogólną – nie ten z najwyższą średnią', () => {
    // mikrotransakcje mają najwyższą średnią (prawie same 10), ale to fabuła „rządzi” oceną
    const dna = computeGameDna([
      entry('COMPLETED', [10, 8, 9, 10, 10]),
      entry('COMPLETED', [9, 10, 8, 8, 10]),
      entry('COMPLETED', [9, 6, 8, 10, 10]),
      entry('DROPPED', [4, 7, 6, 2, 2]),
      entry('COMPLETED', [8, 7, 10, 9, 10]),
      entry('DROPPED', [6, 8, 8, 5, 10]),
    ])
    const monetization = dna.genes.find((gene) => gene.key === 'monetization')!
    const story = dna.genes.find((gene) => gene.key === 'story')!
    expect(monetization.average!).toBeGreaterThan(story.average!)
    expect(dna.dominant).toBe('story')
    expect(dna.archetype?.title).toBe('Głód opowieści')
    expect(story.influence).toBe('strong')
  })

  it('bez ocen ogólnych korzysta ze średnich genów', () => {
    const noOverall = (values: [number, number, number, number]) => {
      const created = entry('COMPLETED', [0, ...values])
      return { ...created, rating: null }
    }
    const dna = computeGameDna([noOverall([9, 5, 5, 5]), noOverall([8, 6, 5, 5]), noOverall([10, 4, 6, 5])])
    expect(dna.dominant).toBe('gameplay')
    expect(dna.archetype?.description).toContain('najwyżej')
  })

  it('liczy odsetek ukończeń tylko z gier ukończonych i porzuconych', () => {
    const dna = computeGameDna([
      entry('COMPLETED', null),
      entry('COMPLETED', null),
      entry('COMPLETED', null),
      entry('DROPPED', null),
      entry('PLAYING', null),
      entry('NONE', null),
    ])
    expect(dna.completionRate).toBe(0.75)
    expect(dna.traits.map((trait) => trait.key)).toContain('finisher')
  })

  it('układa nić od najstarszej gry i oznacza najmocniejszy gen każdej gry', () => {
    const older = entry('COMPLETED', [9, 3, 4, 9, 5], 10)
    const newer = entry('PLAYING', [7, 8, 6, 5, 7], 1)
    const planned = entry('NONE', null, 5)
    const dna = computeGameDna([newer, older, planned])
    expect(dna.strand.map((rung) => rung.rawgId)).toEqual([older.rawgId, planned.rawgId, newer.rawgId])
    expect(dna.strand[0].dominant).toBe('story')
    expect(dna.strand[1].dominant).toBeNull()
    expect(dna.strand[2].dominant).toBe('gameplay')
  })
})

describe('pearson', () => {
  it('zwraca null dla stałej serii', () => {
    expect(pearson([[10, 1], [10, 5], [10, 9]])).toBeNull()
  })

  it('wykrywa idealną zależność', () => {
    expect(pearson([[1, 2], [2, 4], [3, 6]])).toBeCloseTo(1)
    expect(pearson([[1, 6], [2, 4], [3, 2]])).toBeCloseTo(-1)
  })
})
