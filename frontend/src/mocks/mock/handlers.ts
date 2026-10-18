import { http, HttpResponse } from 'msw'
import type { AddLibraryEntryCommand, GameStatus, LibraryEntry, LoginCommand, RegisterCommand, UpdateLibraryEntryCommand, UpdatePlayerCommand } from '../../api/types'
import { GAME_STATUSES } from '../../domain/gameStatus'
import { RATING_FIELDS, RATING_MAX, RATING_MIN } from '../../domain/genes'
import { intParam, latency, localDateTime, noContent, problem, readJson, toPage, validationProblem } from '../shared'
import { findCatalogGame, searchCatalog } from './catalog'
import { getDb, hashPassword, persist, toPlayerDto, type MockPlayer } from './db'

// Udawany BFF: ten sam kontrakt co prawdziwy (/api/...), te same statusy i komunikaty co serwisy.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REVIEW_MAX = 2000

type Errors = Record<string, string[]>
const addError = (errors: Errors, field: string, message: string) => (errors[field] ??= []).push(message)

function validatePlayerFields(body: Partial<UpdatePlayerCommand>, errors: Errors, required: boolean) {
  if (required && !body.userName?.trim()) addError(errors, 'userName', 'userName is mandatory')
  if (body.userName != null && (body.userName.trim().length < 3 || body.userName.trim().length > 30)) addError(errors, 'userName', 'size must be between 3 and 30')
  if (required && !body.email?.trim()) addError(errors, 'email', 'must not be blank')
  if (body.email != null && body.email.trim() && !EMAIL.test(body.email.trim())) addError(errors, 'email', 'must be a well-formed email address')
  if (body.bio != null && body.bio.length > 2000) addError(errors, 'bio', 'size must be between 0 and 2000')
}

async function currentPlayer(): Promise<MockPlayer | null> {
  const db = await getDb()
  return db.players.find((player) => player.id === db.sessionPlayerId) ?? null
}

/** Biblioteka tylko dla zalogowanego właściciela – to BFF pilnuje, kto czyta czyje dane. */
async function authorize(playerIdParam: string | readonly string[] | undefined, path: string) {
  const db = await getDb()
  const me = await currentPlayer()
  if (!me) return { error: problem(401, 'Brak aktywnej sesji.', path) }
  const playerId = Number(playerIdParam)
  if (!db.players.some((player) => player.id === playerId)) return { error: problem(404, `Player with ${playerId} not found`, path) }
  if (me.id !== playerId) return { error: problem(403, 'Możesz zmieniać tylko własny profil.', path) }
  return { db, playerId, entries: (db.library[playerId] ??= []) }
}

function validateEntry(body: Partial<AddLibraryEntryCommand>, errors: Errors, partial: boolean) {
  if (!partial && body.rawgId == null) addError(errors, 'rawgId', 'must not be null')
  if (!partial && body.status == null) addError(errors, 'status', 'must not be null')
  if (body.status != null && !GAME_STATUSES.includes(body.status as GameStatus)) addError(errors, 'status', `must be one of ${GAME_STATUSES.join(', ')}`)
  for (const field of RATING_FIELDS) {
    const value = body[field]
    if (value != null && (!Number.isInteger(value) || value < RATING_MIN || value > RATING_MAX)) addError(errors, field, `must be between ${RATING_MIN} and ${RATING_MAX}`)
  }
  if (body.review != null && body.review.length > REVIEW_MAX) addError(errors, 'review', `size must be between 0 and ${REVIEW_MAX}`)
}

export const handlers = [
  // ---- auth (BFF) ----------------------------------------------------------
  http.post('/api/auth/register', async ({ request }) => {
    await latency()
    const body = (await readJson<RegisterCommand>(request)) ?? {}
    const errors: Errors = {}
    validatePlayerFields(body, errors, true)
    if (!body.password || body.password.length < 8) addError(errors, 'password', 'size must be between 8 and 72')
    if (Object.keys(errors).length) return validationProblem(errors, '/api/auth/register')

    const db = await getDb()
    const userName = body.userName!.trim()
    const email = body.email!.trim()
    if (db.players.some((player) => player.userName.toLowerCase() === userName.toLowerCase())) {
      return problem(409, `Player with username: ${userName} already exists`, '/api/auth/register')
    }
    if (db.players.some((player) => player.email.toLowerCase() === email.toLowerCase())) {
      return problem(409, `player with email ${email} already exists`, '/api/auth/register')
    }
    const player: MockPlayer = { id: db.nextPlayerId++, userName, email, bio: null, passwordHash: await hashPassword(body.password!) }
    db.players.push(player)
    db.library[player.id] = []
    db.sessionPlayerId = player.id
    persist()
    return HttpResponse.json(toPlayerDto(player), { status: 201 })
  }),

  http.post('/api/auth/login', async ({ request }) => {
    await latency()
    const body = (await readJson<LoginCommand>(request)) ?? {}
    const db = await getDb()
    const passwordHash = await hashPassword(body.password ?? '')
    const player = db.players.find((candidate) => candidate.email.toLowerCase() === body.email?.trim().toLowerCase() && candidate.passwordHash === passwordHash)
    if (!player) return problem(401, 'Nieprawidłowy email lub hasło.', '/api/auth/login')
    db.sessionPlayerId = player.id
    persist()
    return HttpResponse.json(toPlayerDto(player))
  }),

  http.post('/api/auth/logout', async () => {
    await latency(80, 200)
    const db = await getDb()
    db.sessionPlayerId = null
    persist()
    return noContent()
  }),

  http.get('/api/auth/me', async () => {
    await latency(120, 300)
    const me = await currentPlayer()
    return me ? HttpResponse.json(toPlayerDto(me)) : problem(401, 'Brak aktywnej sesji.', '/api/auth/me')
  }),

  // ---- player-service: profil ---------------------------------------------
  http.patch('/api/players/:playerId', async ({ request, params }) => {
    await latency()
    const path = `/api/players/${params.playerId}`
    const access = await authorize(params.playerId, path)
    if ('error' in access) return access.error
    const body = (await readJson<UpdatePlayerCommand>(request)) ?? {}
    const errors: Errors = {}
    validatePlayerFields(body, errors, false)
    if (Object.keys(errors).length) return validationProblem(errors, path)

    const player = access.db.players.find((candidate) => candidate.id === access.playerId)!
    const others = access.db.players.filter((candidate) => candidate.id !== player.id)
    if (body.userName != null && others.some((other) => other.userName.toLowerCase() === body.userName!.trim().toLowerCase())) {
      return problem(409, `Player with username: ${body.userName.trim()} already exists`, path)
    }
    if (body.email != null && others.some((other) => other.email.toLowerCase() === body.email!.trim().toLowerCase())) {
      return problem(409, `player with email ${body.email.trim()} already exists`, path)
    }
    // jak w PlayerMapper (NullValuePropertyMappingStrategy.IGNORE): null = bez zmian
    if (body.userName != null) player.userName = body.userName.trim()
    if (body.email != null) player.email = body.email.trim()
    if (body.bio != null) player.bio = body.bio.trim() || null
    persist()
    return HttpResponse.json(toPlayerDto(player))
  }),

  // ---- catalog-service ------------------------------------------------------
  http.get('/api/games', async ({ request }) => {
    await latency(250, 650)
    const url = new URL(request.url)
    const search = url.searchParams.get('search')
    if (search == null) {
      return problem(400, "Required request parameter 'search' for method parameter type String is not present", '/api/games')
    }
    const page = intParam(url.searchParams.get('page'), 0)
    const size = intParam(url.searchParams.get('size'), 20)
    const results = searchCatalog(search).map(({ rawgId, name, released, imageUrl, rating }) => ({ rawgId, name, released, imageUrl, rating }))
    return HttpResponse.json(toPage(results, page, size))
  }),

  http.get('/api/games/:rawgId', async ({ params }) => {
    await latency(150, 400)
    const found = findCatalogGame(Number(params.rawgId))
    return found ? HttpResponse.json(found) : problem(404, 'Resource not found', `/api/games/${params.rawgId}`)
  }),

  // ---- player-service: biblioteka (FEATURE-003) --------------------------
  http.get('/api/players/:playerId/library', async ({ request, params }) => {
    await latency()
    const path = `/api/players/${params.playerId}/library`
    const access = await authorize(params.playerId, path)
    if ('error' in access) return access.error
    const url = new URL(request.url)
    const sorted = [...access.entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return HttpResponse.json(toPage(sorted, intParam(url.searchParams.get('page'), 0), intParam(url.searchParams.get('size'), 20)))
  }),

  http.post('/api/players/:playerId/library', async ({ request, params }) => {
    await latency()
    const path = `/api/players/${params.playerId}/library`
    const access = await authorize(params.playerId, path)
    if ('error' in access) return access.error
    const body = (await readJson<AddLibraryEntryCommand>(request)) ?? {}
    const errors: Errors = {}
    validateEntry(body, errors, false)
    if (Object.keys(errors).length) return validationProblem(errors, path)

    // kolejność jak w feat003: gracz -> duplikat -> catalog
    if (access.entries.some((entry) => entry.rawgId === body.rawgId)) {
      return problem(409, `Game ${body.rawgId} is already in the library of player ${access.playerId}`, path)
    }
    const catalogGame = findCatalogGame(body.rawgId!)
    if (!catalogGame) return problem(404, `Game with rawgId ${body.rawgId} not found`, path)

    const entry: LibraryEntry = {
      rawgId: catalogGame.rawgId,
      gameName: catalogGame.name,
      status: body.status!,
      rating: body.rating ?? null,
      gameplayRating: body.gameplayRating ?? null,
      graphicsRating: body.graphicsRating ?? null,
      storyRating: body.storyRating ?? null,
      monetizationRating: body.monetizationRating ?? null,
      review: body.review ?? null,
      createdAt: localDateTime(),
    }
    access.entries.push(entry)
    persist()
    return HttpResponse.json(entry, { status: 201 })
  }),

  http.patch('/api/players/:playerId/library/:rawgId', async ({ request, params }) => {
    await latency()
    const path = `/api/players/${params.playerId}/library/${params.rawgId}`
    const access = await authorize(params.playerId, path)
    if ('error' in access) return access.error
    const entry = access.entries.find((candidate) => candidate.rawgId === Number(params.rawgId))
    if (!entry) return problem(404, `Game ${params.rawgId} not found in library of player ${access.playerId}`, path)

    const body = (await readJson<UpdateLibraryEntryCommand>(request)) ?? {}
    const errors: Errors = {}
    validateEntry(body, errors, true)
    if (Object.keys(errors).length) return validationProblem(errors, path)

    // PATCH: brak pola = bez zmian, null = wyczyść
    if (body.status != null) entry.status = body.status
    for (const field of RATING_FIELDS) if (field in body) entry[field] = body[field] ?? null
    if ('review' in body) entry.review = body.review?.trim() || null
    persist()
    return HttpResponse.json(entry)
  }),

  http.delete('/api/players/:playerId/library/:rawgId', async ({ params }) => {
    await latency()
    const path = `/api/players/${params.playerId}/library/${params.rawgId}`
    const access = await authorize(params.playerId, path)
    if ('error' in access) return access.error
    const index = access.entries.findIndex((candidate) => candidate.rawgId === Number(params.rawgId))
    if (index === -1) return problem(404, `Game ${params.rawgId} not found in library of player ${access.playerId}`, path)
    access.entries.splice(index, 1)
    persist()
    return noContent()
  }),
]
