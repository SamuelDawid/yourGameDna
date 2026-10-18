import { apiRequest } from './client'
import type { GameDetails, GameSummary, Page } from './types'

// catalog-service: GET /games?search=&page=&size= oraz GET /games/{id}
export const gamesApi = {
  search: (search: string, page: number, size: number, signal?: AbortSignal) =>
    apiRequest<Page<GameSummary>>('/games', { query: { search, page, size }, signal }),
  details: (rawgId: number, signal?: AbortSignal) => apiRequest<GameDetails>(`/games/${rawgId}`, { signal }),
}
