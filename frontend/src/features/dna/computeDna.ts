import type { GameStatus, LibraryEntry } from '../../api/types'
import { GENES, hasAnyGeneRating, type GeneKey } from '../../domain/genes'
import { countLabel } from '../../lib/format'

// Game DNA liczone na razie we frontendzie, z samej biblioteki gracza.
// Gdy backend zacznie je generować, wystarczy podmienić źródło danych w useGameDna – kształt GameDna może zostać.

/** Ile ocenionych gier (z co najmniej jednym genem) trzeba, żeby wyznaczyć typ gracza. */
export const MIN_RATED_FOR_ARCHETYPE = 3
/** Minimalna siła związku genu z oceną ogólną, żeby uznać go za dominujący. */
const MIN_INFLUENCE = 0.4
const MAX_STRAND = 48

export type Influence = 'strong' | 'moderate' | 'weak'

export interface GeneScore {
  key: GeneKey
  /** średnia ocena genu 1–10 */
  average: number | null
  samples: number
  /** korelacja Pearsona z oceną ogólną (-1..1); null, gdy za mało danych */
  correlation: number | null
  influence: Influence | null
}

export interface Archetype {
  key: GeneKey | 'balanced'
  title: string
  description: string
}

export interface Trait {
  key: string
  label: string
  description: string
}

export interface StrandRung {
  rawgId: number
  gameName: string
  status: GameStatus
  rating: number | null
  /** najwyżej oceniony gen tej gry */
  dominant: GeneKey | null
  dominantValue: number | null
}

export interface GameDna {
  totalGames: number
  ratedGames: number
  byStatus: Record<GameStatus, number>
  averageRating: number | null
  /** ukończone / (ukończone + porzucone) */
  completionRate: number | null
  genes: GeneScore[]
  dominant: GeneKey | null
  archetype: Archetype | null
  traits: Trait[]
  /** najstarsza gra pierwsza */
  strand: StrandRung[]
}

const ARCHETYPES: Record<GeneKey, { title: string; byInfluence: string; byAverage: string }> = {
  gameplay: {
    title: 'Czysta mechanika',
    byInfluence: 'Twoja ocena ogólna idzie w parze z gameplayem. Sterowanie, tempo i system walki decydują, czy gra Cię wciągnie.',
    byAverage: 'Gameplay oceniasz najwyżej ze wszystkich genów. Liczy się dla Ciebie to, jak gra się gra.',
  },
  graphics: {
    title: 'Uczta dla oczu',
    byInfluence: 'Oprawa wizualna mocno wpływa na Twoją ocenę. Styl artystyczny i dopracowany świat potrafią kupić Cię od pierwszego kadru.',
    byAverage: 'Grafikę oceniasz najwyżej. Doceniasz dopracowany styl i świat, na który chce się patrzeć.',
  },
  story: {
    title: 'Głód opowieści',
    byInfluence: 'Fabuła i questy najmocniej ciągną w górę Twoją ocenę. Dobra historia wybacza grze bardzo wiele.',
    byAverage: 'Fabułę i questy oceniasz najwyżej. Szukasz w grach historii, które zostają w głowie.',
  },
  monetization: {
    title: 'Uczciwa gra',
    byInfluence: 'Mikrotransakcje potrafią zepsuć Ci całą grę – gdy sklep wchodzi do rozgrywki, ocena leci w dół.',
    byAverage: 'Najwyżej oceniasz uczciwe podejście do płatności. Grasz tam, gdzie nikt nie sięga po Twój portfel.',
  },
}

const BALANCED: Archetype = {
  key: 'balanced',
  title: 'Złoty środek',
  description: 'Żaden gen nie dominuje – oceniasz gry całościowo, a nie przez pryzmat jednej rzeczy.',
}

export function computeGameDna(entries: LibraryEntry[]): GameDna {
  const byStatus: Record<GameStatus, number> = { NONE: 0, PLAYING: 0, COMPLETED: 0, DROPPED: 0 }
  for (const entry of entries) byStatus[entry.status]++

  const overall = entries.map((entry) => entry.rating).filter(isNumber)
  const ratedGames = entries.filter(hasAnyGeneRating).length
  const finishedOrDropped = byStatus.COMPLETED + byStatus.DROPPED

  const genes: GeneScore[] = GENES.map((gene) => {
    const values = entries.map((entry) => entry[gene.field]).filter(isNumber)
    const pairs = entries
      .filter((entry) => isNumber(entry[gene.field]) && isNumber(entry.rating))
      .map((entry) => [entry[gene.field] as number, entry.rating as number] as const)
    const correlation = pairs.length >= MIN_RATED_FOR_ARCHETYPE ? pearson(pairs) : null
    return { key: gene.key, average: mean(values), samples: values.length, correlation, influence: influenceOf(correlation) }
  })

  const { dominant, archetype } = pickArchetype(genes, ratedGames)

  const dna: GameDna = {
    totalGames: entries.length,
    ratedGames,
    byStatus,
    averageRating: mean(overall),
    completionRate: finishedOrDropped > 0 ? byStatus.COMPLETED / finishedOrDropped : null,
    genes,
    dominant,
    archetype,
    traits: [],
    strand: [...entries]
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .slice(-MAX_STRAND)
      .map(toRung),
  }
  dna.traits = pickTraits(dna, overall.length, finishedOrDropped)
  return dna
}

function pickArchetype(genes: GeneScore[], ratedGames: number): { dominant: GeneKey | null; archetype: Archetype | null } {
  if (ratedGames < MIN_RATED_FOR_ARCHETYPE) return { dominant: null, archetype: null }

  const withCorrelation = genes.filter((gene) => gene.correlation != null)
  if (withCorrelation.length > 0) {
    const best = maxBy(withCorrelation, (gene) => gene.correlation!)
    if (best.correlation! < MIN_INFLUENCE) return { dominant: null, archetype: BALANCED }
    return { dominant: best.key, archetype: { key: best.key, title: ARCHETYPES[best.key].title, description: ARCHETYPES[best.key].byInfluence } }
  }

  // Brak ocen ogólnych – zostają same średnie genów
  const withAverage = genes.filter((gene) => gene.average != null)
  if (withAverage.length === 0) return { dominant: null, archetype: null }
  const best = maxBy(withAverage, (gene) => gene.average!)
  return { dominant: best.key, archetype: { key: best.key, title: ARCHETYPES[best.key].title, description: ARCHETYPES[best.key].byAverage } }
}

function pickTraits(dna: GameDna, overallCount: number, finishedOrDropped: number): Trait[] {
  const traits: Trait[] = []
  const { completionRate, averageRating, byStatus } = dna

  if (completionRate != null && finishedOrDropped >= 3) {
    if (completionRate >= 0.75) {
      traits.push({ key: 'finisher', label: 'Kończysz, co zaczynasz', description: `${Math.round(completionRate * 100)}% zaczętych gier kończy się napisami końcowymi.` })
    } else if (completionRate <= 0.4) {
      traits.push({ key: 'dropper', label: 'Bez litości dla słabych gier', description: 'Porzucasz więcej gier, niż kończysz – szkoda Ci czasu na przeciętniaki.' })
    }
  }
  if (averageRating != null && overallCount >= 3) {
    if (averageRating >= 8.5) {
      traits.push({ key: 'generous', label: 'Hojna ręka do ocen', description: 'Średnia ocena ogólna powyżej 8,5 – łatwo Cię zachwycić.' })
    } else if (averageRating <= 5.5) {
      traits.push({ key: 'critic', label: 'Trudno Cię zachwycić', description: 'Średnia ocena ogólna poniżej 5,5 – dziesiątki trzeba u Ciebie wywalczyć.' })
    }
  }
  if (byStatus.NONE >= 3) {
    traits.push({ key: 'backlog', label: 'Rosnąca kupka wstydu', description: `${countLabel(byStatus.NONE, 'gra czeka', 'gry czekają', 'gier czeka')} na swoją kolej.` })
  }
  if (byStatus.PLAYING >= 3) {
    traits.push({ key: 'multitasker', label: 'Kilka gier naraz', description: `W trakcie masz ${countLabel(byStatus.PLAYING, 'grę', 'gry', 'gier')} jednocześnie.` })
  }
  return traits
}

function toRung(entry: LibraryEntry): StrandRung {
  let dominant: GeneKey | null = null
  let dominantValue: number | null = null
  for (const gene of GENES) {
    const value = entry[gene.field]
    if (isNumber(value) && (dominantValue == null || value > dominantValue)) {
      dominant = gene.key
      dominantValue = value
    }
  }
  return { rawgId: entry.rawgId, gameName: entry.gameName, status: entry.status, rating: entry.rating, dominant, dominantValue }
}

function influenceOf(correlation: number | null): Influence | null {
  if (correlation == null) return null
  if (correlation >= 0.6) return 'strong'
  if (correlation >= 0.3) return 'moderate'
  return 'weak'
}

/** Korelacja Pearsona; null, gdy któraś seria jest stała (np. same dziesiątki). */
export function pearson(pairs: ReadonlyArray<readonly [number, number]>): number | null {
  const n = pairs.length
  if (n < 2) return null
  const meanX = pairs.reduce((sum, [x]) => sum + x, 0) / n
  const meanY = pairs.reduce((sum, [, y]) => sum + y, 0) / n
  let covariance = 0
  let varianceX = 0
  let varianceY = 0
  for (const [x, y] of pairs) {
    covariance += (x - meanX) * (y - meanY)
    varianceX += (x - meanX) ** 2
    varianceY += (y - meanY) ** 2
  }
  if (varianceX === 0 || varianceY === 0) return null
  return covariance / Math.sqrt(varianceX * varianceY)
}

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const mean = (values: number[]) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null)

function maxBy<T>(items: T[], score: (item: T) => number): T {
  return items.reduce((best, item) => (score(item) > score(best) ? item : best))
}
