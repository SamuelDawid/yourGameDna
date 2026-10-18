import { describe, expect, it } from 'vitest'
import { toApiError } from './client'

describe('toApiError', () => {
  it('czyta detail z ProblemDetail', () => {
    const error = toApiError(409, { type: 'about:blank', title: 'Conflict', status: 409, detail: 'Player with username: geralt already exists' })
    expect(error.status).toBe(409)
    expect(error.message).toBe('Player with username: geralt already exists')
  })

  it('czyta mapę błędów pól z GlobalExceptionHandler', () => {
    const error = toApiError(400, { title: 'Bad Request', status: 400, errors: { userName: ['size must be between 3 and 30'], email: 'must be a well-formed email address' } })
    expect(error.fieldErrors).toEqual({ userName: ['size must be between 3 and 30'], email: ['must be a well-formed email address'] })
    expect(error.message).toBe('Popraw zaznaczone pola.')
  })

  it('rozumie domyślny błąd Spring Boota (np. brak endpointu)', () => {
    const error = toApiError(404, { timestamp: '2026-10-15T10:00:00', status: 404, error: 'Not Found', path: '/players/1/library' })
    expect(error.message).toBe('Not Found (/players/1/library)')
  })

  it('daje sensowny komunikat, gdy ciała brak', () => {
    expect(toApiError(503, undefined).message).toBe('Serwer jest niedostępny (503).')
    expect(toApiError(401, '').message).toBe('Sesja wygasła – zaloguj się ponownie.')
  })
})
