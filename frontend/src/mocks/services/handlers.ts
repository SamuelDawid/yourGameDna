import { bypass, http, HttpResponse } from 'msw'
import type { LoginCommand, Page, Player, RegisterCommand } from '../../api/types'
import { recordRequest } from '../../dev/requestLog'
import { noContent, problem, readJson, validationProblem } from '../shared'

// Tryb services: /api/games i /api/players idą prosto do Twoich serwisów (proxy w vite.config.ts).
// Backend nie ma jeszcze logowania, więc tylko /api/auth/* jest emulowane tutaj – na prawdziwym player-service:
//   register -> POST /players      login -> szukanie gracza po emailu w GET /players      me -> GET /players/{id}
// Hasło nie jest nigdzie zapisywane ani sprawdzane. To zadanie dla BFF.
const SESSION_KEY = 'ygd.services.session'

const readSession = (): number | null => {
  try {
    const value = Number(localStorage.getItem(SESSION_KEY))
    return Number.isInteger(value) && value > 0 ? value : null
  } catch {
    return null
  }
}

const writeSession = (playerId: number | null) => {
  try {
    if (playerId == null) localStorage.removeItem(SESSION_KEY)
    else localStorage.setItem(SESSION_KEY, String(playerId))
  } catch {
    // brak storage – sesja do odświeżenia strony
  }
}

/** Prawdziwe żądanie do player-service (przez proxy Vite), z pominięciem MSW. Trafia też do panelu Dev. */
async function playerService(method: string, path: string, body?: unknown): Promise<Response> {
  const url = `/api${path}`
  const started = performance.now()
  try {
    const response = await fetch(
      bypass(url, {
        method,
        headers: { Accept: 'application/json', ...(body !== undefined && { 'Content-Type': 'application/json' }) },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
    )
    const preview = await response.clone().text()
    recordRequest({ method, url, status: response.status, preview, backend: 'player-service', durationMs: Math.round(performance.now() - started), nested: true })
    return response
  } catch (error) {
    recordRequest({ method, url, status: 0, preview: String(error), backend: 'player-service', durationMs: Math.round(performance.now() - started), nested: true })
    throw error
  }
}

/** Odpowiedź z serwisu przekazana dalej bez zmian (np. 400/409 z walidacją z player-service). */
async function forward(response: Response) {
  if (response.status === 204) return noContent()
  return new HttpResponse(await response.text(), {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('Content-Type') ?? 'application/json' },
  })
}

async function findPlayerByEmail(email: string): Promise<Player | Response | null> {
  const wanted = email.trim().toLowerCase()
  for (let page = 0; page < 50; page++) {
    const response = await playerService('GET', `/players?page=${page}&size=100`)
    if (!response.ok) return response
    const result = (await response.json()) as Page<Player>
    const found = result.content.find((player) => player.email.toLowerCase() === wanted)
    if (found) return found
    if (page + 1 >= result.totalPages) return null
  }
  return null
}

const unreachable = () => problem(502, 'Brak połączenia z player-service przez serwer deweloperski.')

export const handlers = [
  http.post('/api/auth/register', async ({ request }) => {
    const body = (await readJson<RegisterCommand>(request)) ?? {}
    if (!body.password || body.password.length < 8) return validationProblem({ password: ['size must be between 8 and 72'] }, '/api/auth/register')
    try {
      const response = await playerService('POST', '/players', { userName: body.userName, email: body.email, bio: null })
      if (!response.ok) return forward(response)
      const player = (await response.json()) as Player
      writeSession(player.id)
      return HttpResponse.json(player, { status: 201 })
    } catch {
      return unreachable()
    }
  }),

  http.post('/api/auth/login', async ({ request }) => {
    const body = (await readJson<LoginCommand>(request)) ?? {}
    if (!body.email?.trim()) return validationProblem({ email: ['must not be blank'] }, '/api/auth/login')
    try {
      const found = await findPlayerByEmail(body.email)
      if (found instanceof Response) return forward(found)
      if (!found) return problem(401, `W player-service nie ma gracza z emailem ${body.email.trim()}. Załóż konto – trafi tam przez POST /players.`, '/api/auth/login')
      writeSession(found.id)
      return HttpResponse.json(found)
    } catch {
      return unreachable()
    }
  }),

  http.post('/api/auth/logout', () => {
    writeSession(null)
    return noContent()
  }),

  http.get('/api/auth/me', async () => {
    const playerId = readSession()
    if (!playerId) return problem(401, 'Brak aktywnej sesji.', '/api/auth/me')
    try {
      const response = await playerService('GET', `/players/${playerId}`)
      if (response.status === 404) {
        writeSession(null)
        return problem(401, 'Gracza z sesji nie ma już w player-service.', '/api/auth/me')
      }
      return forward(response)
    } catch {
      return unreachable()
    }
  }),
]
