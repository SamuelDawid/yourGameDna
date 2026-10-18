import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { isApiError } from '../api/client'
import { queryKeys } from './queryKeys'

// 401 z dowolnego endpointu = sesja w BFF wygasła -> czyścimy gracza, RequireAuth przekieruje na /login
function onUnauthorized(error: unknown) {
  if (isApiError(error) && error.status === 401) queryClient.setQueryData(queryKeys.me, null)
}

export const queryClient: QueryClient = new QueryClient({
  queryCache: new QueryCache({ onError: onUnauthorized }),
  mutationCache: new MutationCache({ onError: onUnauthorized }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // ponawiamy tylko błędy sieci/serwera, nigdy 4xx
      retry: (failureCount, error) => isApiError(error) && (error.status === 0 || error.status >= 500) && failureCount < 1,
    },
  },
})
