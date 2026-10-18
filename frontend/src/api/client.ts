import { API_BASE, backendFor } from '../config'
import { recordRequest } from '../dev/requestLog'
import { rearmMocks, UNMOCKED_HEADER } from '../mocks/mockControl'
import type { ProblemDetail } from './types'

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string[]>
  readonly problem: ProblemDetail | null

  constructor(status: number, message: string, fieldErrors: Record<string, string[]> = {}, problem: ProblemDetail | null = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
    this.problem = problem
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError

type QueryValue = string | number | boolean | null | undefined

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  query?: Record<string, QueryValue>
  body?: unknown
  signal?: AbortSignal
}

export function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return send<T>(path, options, false)
}

async function send<T>(path: string, options: RequestOptions, isRetry: boolean): Promise<T> {
  const { method = 'GET', query, body, signal } = options
  const url = API_BASE + path + toQueryString(query)
  const started = performance.now()
  const log = (status: number, preview: string) =>
    recordRequest({ method, url, status, preview, backend: backendFor(url), durationMs: Math.round(performance.now() - started) })

  let response: Response
  try {
    response = await fetch(url, {
      method,
      signal,
      // sesja (ciasteczko HttpOnly) jest po stronie BFF – frontend nigdy nie widzi tokenów
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json, application/problem+json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (cause) {
    if (signal?.aborted) throw cause
    log(0, String(cause))
    throw new ApiError(0, 'Brak połączenia z serwerem. Sprawdź, czy serwer deweloperski działa.')
  }

  const text = await response.text()
  log(response.status, text)

  // tylko tryby mock/services: MSW „zgubił” kartę – uzbrajamy go ponownie i powtarzamy żądanie raz
  if (__API_MODE__ !== 'bff' && !isRetry && response.headers.has(UNMOCKED_HEADER) && (await rearmMocks())) {
    return send<T>(path, options, true)
  }

  const data = parseJson(text)

  if (!response.ok) throw toApiError(response.status, data)
  return data as T
}

/** Zamienia odpowiedź błędu (ProblemDetail, domyślny błąd Spring Boota albo nic) na ApiError. */
export function toApiError(status: number, data: unknown): ApiError {
  const body = isRecord(data) ? data : {}
  const fieldErrors = normalizeFieldErrors(body.errors)
  const message =
    pickString(body.detail) ??
    (Object.keys(fieldErrors).length > 0 ? 'Popraw zaznaczone pola.' : undefined) ??
    pickString(body.message) ??
    springDefaultError(body) ??
    pickString(body.title) ??
    fallbackMessage(status)
  return new ApiError(status, message, fieldErrors, isRecord(data) ? (data as ProblemDetail) : null)
}

// Spring Boot bez ProblemDetail zwraca { timestamp, status, error: "Not Found", path: "/players/1/library" }
function springDefaultError(body: Record<string, unknown>): string | undefined {
  const error = pickString(body.error)
  if (!error) return undefined
  const path = pickString(body.path)
  return path ? `${error} (${path})` : error
}

function fallbackMessage(status: number): string {
  if (status === 400) return 'Niepoprawne dane.'
  if (status === 401) return 'Sesja wygasła – zaloguj się ponownie.'
  if (status === 403) return 'Brak dostępu.'
  if (status === 404) return 'Nie znaleziono.'
  if (status === 409) return 'Konflikt danych.'
  if (status === 502 || status === 503 || status === 504) return `Serwer jest niedostępny (${status}).`
  return `Błąd serwera (${status}).`
}

function normalizeFieldErrors(errors: unknown): Record<string, string[]> {
  if (!isRecord(errors)) return {}
  const result: Record<string, string[]> = {}
  for (const [field, messages] of Object.entries(errors)) {
    if (Array.isArray(messages)) result[field] = messages.map(String)
    else if (typeof messages === 'string') result[field] = [messages]
  }
  return result
}

function toQueryString(query: RequestOptions['query']): string {
  if (!query) return ''
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

function parseJson(text: string): unknown {
  if (!text) return undefined
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
const pickString = (value: unknown): string | undefined => (typeof value === 'string' && value.trim() ? value : undefined)
