const dateFormat = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })

export const yearOf = (date: string | null | undefined) => (date ? date.slice(0, 4) : null)

export function formatDate(isoDate: string | null | undefined): string | null {
  if (!isoDate) return null
  const date = new Date(isoDate)
  return Number.isNaN(date.getTime()) ? null : dateFormat.format(date)
}

/** Ocena RAWG przychodzi jako String w skali 0–5; 0 oznacza brak ocen. */
export function formatRawgRating(rating: string | null | undefined): string | null {
  const value = Number(rating)
  return Number.isFinite(value) && value > 0 ? value.toFixed(1) : null
}

export const formatScore = (value: number | null | undefined) => (value == null ? '–' : (Math.round(value * 10) / 10).toLocaleString('pl-PL'))

const ARTICLES = new Set(['the', 'a', 'an'])

/** „The Witcher 3” -> W3, „Hades” -> H, „demo_gracz” -> DG */
export function initials(text: string): string {
  const words = text.replace(/[^\p{L}\p{N}\s]|_/gu, ' ').trim().split(/\s+/).filter(Boolean)
  const meaningful = words.length > 1 ? words.filter((word) => !ARTICLES.has(word.toLowerCase())) : words
  if (meaningful.length === 0) return '?'
  if (meaningful.length === 1) return meaningful[0][0].toUpperCase()
  return (meaningful[0][0] + meaningful[1][0]).toUpperCase()
}

/** Stabilny „losowy” odcień dla nazwy – generowane okładki i awatary. */
export function hueOf(text: string): number {
  let hash = 0
  for (const char of text) hash = (hash * 31 + char.codePointAt(0)!) | 0
  return Math.abs(hash) % 360
}

/** Polska odmiana: 1 gra, 2 gry, 5 gier. */
export function plural(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (count === 1) return one
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return few
  return many
}

export const countLabel = (count: number, one: string, few: string, many: string) => `${count} ${plural(count, one, few, many)}`
