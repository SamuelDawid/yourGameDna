export type ApiMode = typeof __API_MODE__

export const API_MODE: ApiMode = __API_MODE__
export const API_TARGETS = __API_TARGETS__
export const API_BASE = '/api'

/** Kto naprawdę odpowiada na dane żądanie w aktualnym trybie – pokazywane w panelu Dev. */
export function backendFor(url: string): string {
  if (API_MODE === 'mock') return 'mock (MSW)'
  if (API_MODE === 'bff') return 'BFF'
  if (url.startsWith(`${API_BASE}/auth`)) return 'emulacja auth'
  if (url.startsWith(`${API_BASE}/games`)) return 'catalog-service'
  if (url.startsWith(`${API_BASE}/players`)) return 'player-service'
  return 'vite'
}
