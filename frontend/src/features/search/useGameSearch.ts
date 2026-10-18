import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query'
import { gamesApi } from '../../api/games'
import { queryKeys } from '../../app/queryKeys'

export const MIN_QUERY_LENGTH = 2
const PAGE_SIZE = 12

export function useGameSearch(search: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.gameSearch(search),
    queryFn: ({ pageParam, signal }) => gamesApi.search(search, pageParam, PAGE_SIZE, signal),
    initialPageParam: 0,
    // numer następnej strony liczymy sami – nie zależymy od pageNumber z odpowiedzi
    getNextPageParam: (lastPage, pages) => (pages.length < lastPage.totalPages && lastPage.content.length > 0 ? pages.length : undefined),
    enabled: search.length >= MIN_QUERY_LENGTH,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  })
}
