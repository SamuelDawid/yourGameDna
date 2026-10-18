import { apiRequest } from './client'
import type { AddLibraryEntryCommand, LibraryEntry, Page, UpdateLibraryEntryCommand } from './types'

const PAGE_SIZE = 50
const MAX_PAGES = 20

const base = (playerId: number) => `/players/${playerId}/library`

// player-service (FEATURE-003): /players/{playerId}/library
export const libraryApi = {
  page: (playerId: number, page: number, size: number, signal?: AbortSignal) =>
    apiRequest<Page<LibraryEntry>>(base(playerId), { query: { page, size }, signal }),

  /** Cała biblioteka (Game DNA potrzebuje wszystkich gier, nie jednej strony). */
  async all(playerId: number, signal?: AbortSignal): Promise<LibraryEntry[]> {
    const entries: LibraryEntry[] = []
    for (let page = 0; page < MAX_PAGES; page++) {
      const result = await libraryApi.page(playerId, page, PAGE_SIZE, signal)
      entries.push(...result.content)
      if (result.content.length === 0 || page + 1 >= result.totalPages) break
    }
    return entries
  },

  add: (playerId: number, command: AddLibraryEntryCommand) =>
    apiRequest<LibraryEntry>(base(playerId), { method: 'POST', body: command }),

  update: (playerId: number, rawgId: number, command: UpdateLibraryEntryCommand) =>
    apiRequest<LibraryEntry>(`${base(playerId)}/${rawgId}`, { method: 'PATCH', body: command }),

  remove: (playerId: number, rawgId: number) => apiRequest<void>(`${base(playerId)}/${rawgId}`, { method: 'DELETE' }),
}
