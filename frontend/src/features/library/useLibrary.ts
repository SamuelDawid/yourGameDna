import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { gamesApi } from '../../api/games'
import { libraryApi } from '../../api/library'
import type { AddLibraryEntryCommand, LibraryEntry, UpdateLibraryEntryCommand } from '../../api/types'
import { queryKeys } from '../../app/queryKeys'
import { usePlayer } from '../auth/playerContext'

export function useLibrary() {
  const player = usePlayer()
  return useQuery({
    queryKey: queryKeys.library(player.id),
    queryFn: ({ signal }) => libraryApi.all(player.id, signal),
  })
}

/** rawgId -> pozycja; do oznaczania wyników wyszukiwania, które już są w profilu. */
export function useLibraryIndex() {
  const library = useLibrary()
  const index = useMemo(() => new Map((library.data ?? []).map((entry) => [entry.rawgId, entry])), [library.data])
  return { ...library, index }
}

export function useGameDetails(rawgId: number) {
  return useQuery({
    queryKey: queryKeys.gameDetails(rawgId),
    queryFn: ({ signal }) => gamesApi.details(rawgId, signal),
    staleTime: 10 * 60_000,
  })
}

function useLibraryCache() {
  const player = usePlayer()
  const queryClient = useQueryClient()
  const key = queryKeys.library(player.id)
  return {
    playerId: player.id,
    // od razu pokazujemy zmianę, a potem i tak pobieramy bibliotekę z serwera (widać to w panelu Dev)
    apply: (update: (entries: LibraryEntry[]) => LibraryEntry[]) => {
      queryClient.setQueryData<LibraryEntry[]>(key, (entries) => (entries ? update(entries) : entries))
      return queryClient.invalidateQueries({ queryKey: key })
    },
  }
}

export function useAddToLibrary() {
  const cache = useLibraryCache()
  return useMutation({
    mutationFn: (command: AddLibraryEntryCommand) => libraryApi.add(cache.playerId, command),
    onSuccess: (added) => cache.apply((entries) => [...entries.filter((entry) => entry.rawgId !== added.rawgId), added]),
  })
}

export function useUpdateLibraryEntry() {
  const cache = useLibraryCache()
  return useMutation({
    mutationFn: ({ rawgId, command }: { rawgId: number; command: UpdateLibraryEntryCommand }) => libraryApi.update(cache.playerId, rawgId, command),
    onSuccess: (updated) => cache.apply((entries) => entries.map((entry) => (entry.rawgId === updated.rawgId ? updated : entry))),
  })
}

export function useRemoveFromLibrary() {
  const cache = useLibraryCache()
  return useMutation({
    mutationFn: (rawgId: number) => libraryApi.remove(cache.playerId, rawgId),
    onSuccess: (_, rawgId) => cache.apply((entries) => entries.filter((entry) => entry.rawgId !== rawgId)),
  })
}
