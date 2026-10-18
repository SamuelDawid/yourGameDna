import type { GameStatus, LibraryEntry, Player } from '../../api/types'
import { DEMO_ACCOUNT } from '../demoAccount'
import { localDateTime } from '../shared'
import { findCatalogGame } from './catalog'

// „Baza” udawanego backendu w localStorage – przetrwa odświeżenie strony.
// Reset: przycisk w panelu Dev albo usunięcie klucza ygd.mock.db.v1.
export interface MockPlayer extends Player {
  passwordHash: string
}

interface MockDb {
  version: 1
  nextPlayerId: number
  players: MockPlayer[]
  library: Record<number, LibraryEntry[]>
  /** udaje ciasteczko sesji ustawiane przez BFF */
  sessionPlayerId: number | null
}

const STORAGE_KEY = 'ygd.mock.db.v1'
let state: MockDb | null = null

export async function getDb(): Promise<MockDb> {
  if (state) return state
  state = load() ?? (await seed())
  persist()
  return state
}

export function persist() {
  if (!state) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // tryb prywatny / zablokowany storage – dane zostaną tylko w pamięci
  }
}

export async function resetMockDb() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // jak wyżej
  }
  state = null
}

function load(): MockDb | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as MockDb) : null
    return parsed?.version === 1 ? parsed : null
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(`ygd-mock:${password}`)
  if (globalThis.crypto?.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', bytes)
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  }
  // poza bezpiecznym kontekstem (np. http po IP) – prosty hash wystarczy dla mocka
  let hash = 2166136261
  for (const byte of bytes) hash = Math.imul(hash ^ byte, 16777619)
  return (hash >>> 0).toString(16)
}

type Seed = [rawgId: number, status: GameStatus, ratings: [overall: number, gameplay: number, graphics: number, story: number, monetization: number] | null, review: string | null, daysAgo: number]

const DEMO_LIBRARY: Seed[] = [
  [3328, 'COMPLETED', [10, 8, 9, 10, 10], 'Najlepsze questy poboczne w historii gier. Krwawy Baron zostaje w głowie na lata.', 160],
  [274755, 'COMPLETED', [9, 10, 8, 8, 10], 'Każda śmierć coś daje. Idealny roguelike na krótkie sesje.', 140],
  [396121, 'COMPLETED', [9, 6, 8, 10, 10], 'Czyta się jak dobrą książkę – walki tu nie ma, a i tak trudno się oderwać.', 120],
  [47137, 'DROPPED', [4, 7, 6, 2, 2], 'Sklep krzyczy głośniej niż sama gra.', 110],
  [41494, 'COMPLETED', [8, 7, 10, 9, 10], null, 95],
  [326243, 'DROPPED', [6, 8, 8, 5, 10], 'Świat robi wrażenie, ale po trzecim bossie zabrakło mi cierpliwości.', 80],
  [4200, 'COMPLETED', [9, 10, 7, 9, 10], null, 64],
  [3612, 'COMPLETED', [8, 9, 7, 6, 10], 'Miało być na chwilę, wyszło sto godzin.', 45],
  [324997, 'PLAYING', [9, 8, 8, 10, 10], null, 30],
  [3192, 'NONE', null, 'Czekam na to od lat.', 14],
  [983318, 'NONE', null, null, 9],
  [901341, 'NONE', null, null, 3],
]

async function seed(): Promise<MockDb> {
  const demo: MockPlayer = {
    id: 1,
    userName: DEMO_ACCOUNT.userName,
    email: DEMO_ACCOUNT.email,
    bio: 'Konto demo z trybu mock. Lubię gry, które mają coś do opowiedzenia.',
    passwordHash: await hashPassword(DEMO_ACCOUNT.password),
  }
  const now = Date.now()
  const library = DEMO_LIBRARY.flatMap(([rawgId, status, ratings, review, daysAgo]): LibraryEntry[] => {
    const catalogGame = findCatalogGame(rawgId)
    if (!catalogGame) return []
    return [
      {
        rawgId,
        gameName: catalogGame.name,
        status,
        rating: ratings?.[0] ?? null,
        gameplayRating: ratings?.[1] ?? null,
        graphicsRating: ratings?.[2] ?? null,
        storyRating: ratings?.[3] ?? null,
        monetizationRating: ratings?.[4] ?? null,
        review,
        createdAt: localDateTime(new Date(now - daysAgo * 86_400_000)),
      },
    ]
  })
  return { version: 1, nextPlayerId: 2, players: [demo], library: { [demo.id]: library }, sessionPlayerId: null }
}

export const toPlayerDto = ({ passwordHash: _passwordHash, ...player }: MockPlayer): Player => player
