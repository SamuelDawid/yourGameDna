import type { LibraryEntry, RatingKey } from '../api/types'

// „Geny” = oceny w kategoriach z FEATURE-003. Kolory sprawdzone walidatorem pod kątem daltonizmu
// (wszystkie pary na ciemnym tle) – dlatego każdy gen ma też własny kształt jako drugi kanał.
export type GeneKey = 'gameplay' | 'graphics' | 'story' | 'monetization'
export type GeneShape = 'circle' | 'square' | 'triangle' | 'diamond'

export interface Gene {
  key: GeneKey
  field: Exclude<RatingKey, 'rating'>
  label: string
  hint: string
  color: string
  shape: GeneShape
}

export const GENES: Gene[] = [
  {
    key: 'gameplay',
    field: 'gameplayRating',
    label: 'Gameplay',
    hint: 'Mechanika, sterowanie, frajda z grania',
    color: 'var(--gene-gameplay)',
    shape: 'circle',
  },
  {
    key: 'graphics',
    field: 'graphicsRating',
    label: 'Grafika',
    hint: 'Oprawa wizualna i styl',
    color: 'var(--gene-graphics)',
    shape: 'square',
  },
  {
    key: 'story',
    field: 'storyRating',
    label: 'Fabuła i questy',
    hint: 'Historia, postacie, zadania',
    color: 'var(--gene-story)',
    shape: 'triangle',
  },
  {
    key: 'monetization',
    field: 'monetizationRating',
    label: 'Mikrotransakcje',
    hint: '10 = uczciwie albo wcale, 1 = pay-to-win',
    color: 'var(--gene-monetization)',
    shape: 'diamond',
  },
]

export const GENE_BY_KEY = Object.fromEntries(GENES.map((gene) => [gene.key, gene])) as Record<GeneKey, Gene>

export const RATING_MIN = 1
export const RATING_MAX = 10

/** Wszystkie pola ocen pozycji w bibliotece (ogólna + geny). */
export const RATING_FIELDS: RatingKey[] = ['rating', ...GENES.map((gene) => gene.field)]

export const hasAnyGeneRating = (entry: LibraryEntry) => GENES.some((gene) => entry[gene.field] != null)
