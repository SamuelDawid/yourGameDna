import { createContext, useContext } from 'react'
import type { Player } from '../../api/types'

export const PlayerContext = createContext<Player | null>(null)

/** Zalogowany gracz – dostępny w każdej trasie pod <RequireAuth>. */
export function usePlayer(): Player {
  const player = useContext(PlayerContext)
  if (!player) throw new Error('usePlayer musi być użyty pod <RequireAuth>')
  return player
}
