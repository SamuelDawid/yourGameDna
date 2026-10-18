export const queryKeys = {
  me: ['auth', 'me'] as const,
  gameSearch: (search: string) => ['games', 'search', search] as const,
  gameDetails: (rawgId: number) => ['games', 'details', rawgId] as const,
  library: (playerId: number) => ['library', playerId] as const,
}
