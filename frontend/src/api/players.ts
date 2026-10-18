import { apiRequest } from './client'
import type { Player, UpdatePlayerCommand } from './types'

// player-service (FEATURE-001): PATCH /players/{id}
export const playersApi = {
  update: (playerId: number, command: UpdatePlayerCommand) =>
    apiRequest<Player>(`/players/${playerId}`, { method: 'PATCH', body: command }),
}
