import { delay, HttpResponse } from 'msw'
import type { Page, ProblemDetail } from '../api/types'

const TITLES: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
}

/** Błąd w formacie Springa (ProblemDetail), tak jak zwracają go player-service i catalog-service. */
export function problem(status: number, detail: string | null, instance?: string, extra?: Partial<ProblemDetail>) {
  const body: ProblemDetail = { type: 'about:blank', title: TITLES[status] ?? 'Error', status, ...(detail && { detail }), ...(instance && { instance }), ...extra }
  return HttpResponse.json(body, { status, headers: { 'Content-Type': 'application/problem+json' } })
}

/** 400 z mapą pól – jak GlobalExceptionHandler.handleMethodArgumentNotValid w player-service. */
export function validationProblem(errors: Record<string, string[]>, instance?: string) {
  return problem(400, null, instance, { errors })
}

export const noContent = () => new HttpResponse(null, { status: 204 })

/** Udawane opóźnienie sieci – żeby było widać stany ładowania. */
export const latency = (min = 180, max = 520) => delay(Math.round(min + Math.random() * (max - min)))

export function toPage<T>(items: T[], page: number, size: number): Page<T> {
  const safeSize = Math.max(1, size)
  return {
    content: items.slice(page * safeSize, page * safeSize + safeSize),
    pageNumber: page,
    pageSize: safeSize,
    totalElements: items.length,
    totalPages: Math.ceil(items.length / safeSize),
  }
}

export function intParam(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

/** LocalDateTime z Javy – bez strefy czasowej, np. 2026-10-15T11:22:33.123 */
export function localDateTime(date = new Date()): string {
  const pad = (value: number, length = 2) => String(value).padStart(length, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`
}

export async function readJson<T>(request: Request): Promise<Partial<T> | null> {
  try {
    const body = await request.json()
    return body && typeof body === 'object' ? (body as Partial<T>) : null
  } catch {
    return null
  }
}
