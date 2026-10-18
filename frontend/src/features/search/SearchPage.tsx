import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import type { GameSummary } from '../../api/types'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { EmptyState, ErrorState } from '../../components/States'
import { countLabel } from '../../lib/format'
import { useDebouncedValue } from '../../lib/hooks'
import { computeGameDna } from '../dna/computeDna'
import { LibraryEntryDialog } from '../library/LibraryEntryDialog'
import { useLibraryIndex } from '../library/useLibrary'
import { GameCard, GameCardSkeleton } from './GameCard'
import { MIN_QUERY_LENGTH, useGameSearch } from './useGameSearch'
import styles from './SearchPage.module.css'

const SUGGESTIONS = ['The Witcher 3', 'Hades', 'Elden Ring', "Baldur's Gate 3", 'Stardew Valley', 'Cyberpunk 2077']

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const urlQuery = params.get('q') ?? ''
  const [input, setInput] = useState(urlQuery)
  const debounced = useDebouncedValue(input.trim(), 350)
  const lastWritten = useRef(urlQuery)
  const inputRef = useRef<HTMLInputElement>(null)
  const [selected, setSelected] = useState<GameSummary | null>(null)

  // wpisany tekst -> ?q= w adresie (po debounce), żeby wyniki przetrwały odświeżenie i przycisk Wstecz
  useEffect(() => {
    if (debounced === lastWritten.current) return
    lastWritten.current = debounced
    setParams(debounced ? { q: debounced } : {}, { replace: true })
  }, [debounced, setParams])

  // nawigacja Wstecz/Dalej -> pole wyszukiwania
  useEffect(() => {
    if (urlQuery === lastWritten.current) return
    lastWritten.current = urlQuery
    setInput(urlQuery)
  }, [urlQuery])

  // „/” ustawia fokus na wyszukiwarce
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (event.key !== '/' || target.closest('input, textarea, select, [contenteditable="true"], dialog')) return
      event.preventDefault()
      inputRef.current?.focus()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const search = urlQuery.trim()
  const active = search.length >= MIN_QUERY_LENGTH
  const results = useGameSearch(search)
  const library = useLibraryIndex()

  const games = useMemo(() => {
    const unique = new Map<number, GameSummary>()
    for (const page of results.data?.pages ?? []) for (const game of page.content) unique.set(game.rawgId, game)
    return [...unique.values()]
  }, [results.data])
  const total = results.data?.pages[0]?.totalElements ?? 0

  const runSuggestion = (suggestion: string) => {
    lastWritten.current = suggestion
    setInput(suggestion)
    setParams({ q: suggestion }, { replace: true })
  }

  return (
    <div className={`page ${styles.page}`} data-active={active || undefined}>
      <section className={styles.hero}>
        <div className={styles.heading}>
          <div className={styles.headingInner}>
            <p className="eyebrow">Wyszukiwarka gier</p>
            <h1 className={`display ${styles.title}`}>
              Znajdź grę. <span className={styles.gradient}>Dopisz ją do swojego DNA.</span>
            </h1>
            <p className={styles.lead}>Ukończona, porzucona albo dopiero na liście życzeń – wyszukaj ją i oceń w czterech genach.</p>
          </div>
        </div>

        <form className={styles.searchForm} role="search" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="game-search" className="visually-hidden">
            Szukaj gry
          </label>
          <Icon name="search" size={20} className={styles.searchIcon} />
          <input
            ref={inputRef}
            id="game-search"
            className={styles.searchInput}
            type="search"
            placeholder="Np. Wiedźmin, Hades, Elden Ring…"
            autoComplete="off"
            spellCheck={false}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => event.key === 'Escape' && setInput('')}
            autoFocus
          />
          {results.isFetching && active ? (
            <span className={styles.searchStatus} aria-hidden="true">
              <span className={styles.pulse} />
            </span>
          ) : input ? (
            <button type="button" className={styles.clear} onClick={() => setInput('')} aria-label="Wyczyść wyszukiwanie">
              <Icon name="x" size={16} />
            </button>
          ) : (
            <kbd className={styles.kbd}>/</kbd>
          )}
        </form>

        {!active && (
          <div className={styles.suggestions}>
            <span>Spróbuj:</span>
            {SUGGESTIONS.map((suggestion) => (
              <button key={suggestion} type="button" className={styles.chip} onClick={() => runSuggestion(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
        )}
        {!active && <LibraryTeaser />}
      </section>

      {active && (
        <section className={styles.results} aria-live="polite" aria-busy={results.isFetching}>
          {results.isPending ? (
            <div className={styles.grid}>
              {Array.from({ length: 8 }, (_, index) => (
                <GameCardSkeleton key={index} />
              ))}
            </div>
          ) : results.isError && games.length === 0 ? (
            <ErrorState title="Wyszukiwanie nie działa" error={results.error} onRetry={() => results.refetch()} />
          ) : games.length === 0 ? (
            <EmptyState icon="search" title={`Brak wyników dla „${search}”`}>
              Sprawdź pisownię albo wpisz krótszy fragment tytułu.
            </EmptyState>
          ) : (
            <>
              <p className={styles.summary}>
                {countLabel(total, 'wynik', 'wyniki', 'wyników')} dla <strong>„{search}”</strong>
              </p>
              <div className={styles.grid} data-stale={results.isPlaceholderData || undefined}>
                {games.map((game, index) => (
                  <div key={game.rawgId} style={{ animationDelay: `${Math.min(index % 12, 8) * 30}ms` }} className={styles.cell}>
                    <GameCard game={game} entry={library.index.get(game.rawgId)} onOpen={() => setSelected(game)} />
                  </div>
                ))}
              </div>
              {results.isError && <ErrorState compact title="Nie udało się wczytać kolejnej strony" error={results.error} onRetry={() => results.fetchNextPage()} />}
              {results.hasNextPage && !results.isError && (
                <div className={styles.more}>
                  <Button onClick={() => results.fetchNextPage()} loading={results.isFetchingNextPage} icon="chevronDown">
                    Pokaż więcej
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {selected && (
        <LibraryEntryDialog key={selected.rawgId} game={selected} entry={library.index.get(selected.rawgId)} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

function LibraryTeaser() {
  const library = useLibraryIndex()
  const dna = useMemo(() => (library.data ? computeGameDna(library.data) : null), [library.data])
  if (!dna || dna.totalGames === 0) return null
  return (
    <Link to="/profile" className={styles.teaser}>
      <Icon name="helix" size={18} />
      <span>
        W profilu masz {countLabel(dna.totalGames, 'grę', 'gry', 'gier')}
        {dna.archetype ? (
          <>
            {' '}
            · Twój typ: <strong>{dna.archetype.title}</strong>
          </>
        ) : null}
      </span>
      <Icon name="arrowRight" size={16} />
    </Link>
  )
}
