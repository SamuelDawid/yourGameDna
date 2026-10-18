import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../../api/auth'
import { isApiError } from '../../api/client'
import type { Player } from '../../api/types'
import { queryKeys } from '../../app/queryKeys'

/** null = nikt nie jest zalogowany (BFF odpowiedział 401). */
export function useCurrentPlayer() {
  return useQuery<Player | null>({
    queryKey: queryKeys.me,
    queryFn: async ({ signal }) => {
      try {
        return await authApi.me(signal)
      } catch (error) {
        if (isApiError(error) && error.status === 401) return null
        throw error
      }
    },
    staleTime: Infinity,
    retry: false,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (player) => queryClient.setQueryData(queryKeys.me, player),
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (player) => queryClient.setQueryData(queryKeys.me, player),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      queryClient.setQueryData(queryKeys.me, null)
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== 'auth' })
    },
  })
}
