import { useMemo, useState } from 'react'
import type { GameStatus, LibraryEntry } from '../../api/types'
import { ButtonLink } from '../../components/Button'
import { EmptyState } from '../../components/States'
import { GAME_STATUSES, STATUS_META } from '../../domain/gameStatus'
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog'
import { LibraryEntryCard } from './LibraryEntryCard'
import { LibraryEntryDialog } from './LibraryEntryDialog'
import styles from './LibrarySection.module.css'

type Filter = 'ALL' | GameStatus
type Sort = 'recent' | 'rating' | 'name'

const SORTS: Record<Sort, { label: string; compare: (a: LibraryEntry, b: LibraryEntry) => number }> = {
  recent: { label: 'Ostatnio dodane', compare: (a, b) => b.createdAt.localeCompare(a.createdAt) },
  rating: { label: 'Najwyżej oceniane', compare: (a, b) => (b.rating ?? -1) - (a.rating ?? -1) || a.gameName.localeCompare(b.gameName, 'pl') },
  name: { label: 'Alfabetycznie', compare: (a, b) => a.gameName.localeCompare(b.gameName, 'pl') },
}

export function LibrarySection({ entries }: { entries: LibraryEntry[] }) {
  const [filter, setFilter] = useState<Filter>('ALL')
  const [sort, setSort] = useState<Sort>('recent')
  const [editing, setEditing] = useState<LibraryEntry | null>(null)
  const [deleting, setDeleting] = useState<LibraryEntry | null>(null)

  const counts = useMemo(() => {
    const result: Record<Filter, number> = { ALL: entries.length, NONE: 0, PLAYING: 0, COMPLETED: 0, DROPPED: 0 }
    for (const entry of entries) result[entry.status]++
    return result
  }, [entries])

  // po usunięciu ostatniej gry z danym statusem wracamy do „Wszystkie”
  const activeFilter: Filter = filter !== 'ALL' && counts[filter] === 0 ? 'ALL' : filter

  const visible = useMemo(
    () => entries.filter((entry) => activeFilter === 'ALL' || entry.status === activeFilter).sort(SORTS[sort].compare),
    [entries, activeFilter, sort],
  )

  return (
    <section className={styles.section} aria-labelledby="library-title">
      <header className={styles.header}>
        <div>
          <p className="eyebrow">Biblioteka</p>
          <h2 id="library-title" className={styles.title}>
            Twoje gry <span className={styles.total}>{entries.length}</span>
          </h2>
        </div>
        {entries.length > 0 && (
          <label className={styles.sort}>
            <span>Sortuj</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as Sort)}>
              {Object.entries(SORTS).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        )}
      </header>

      {entries.length === 0 ? (
        <EmptyState
          title="Twój profil jest jeszcze pusty"
          action={
            <ButtonLink to="/" variant="primary" icon="search">
              Wyszukaj pierwszą grę
            </ButtonLink>
          }
        >
          Dodaj gry ukończone, porzucone albo te, na które czekasz – z ich ocen powstanie Twoje Game DNA.
        </EmptyState>
      ) : (
        <>
          <div className={styles.filters} role="group" aria-label="Filtruj po statusie">
            {(['ALL', ...GAME_STATUSES] as Filter[]).map((option) => (
              <button
                key={option}
                type="button"
                className={styles.filter}
                aria-pressed={activeFilter === option}
                onClick={() => setFilter(option)}
                disabled={option !== 'ALL' && counts[option] === 0}
              >
                {option === 'ALL' ? 'Wszystkie' : STATUS_META[option].plural}
                <span className={styles.count}>{counts[option]}</span>
              </button>
            ))}
          </div>

          <div className={styles.grid}>
            {visible.map((entry) => (
              <LibraryEntryCard key={entry.rawgId} entry={entry} onEdit={() => setEditing(entry)} onDelete={() => setDeleting(entry)} />
            ))}
          </div>
        </>
      )}

      {editing && (
        <LibraryEntryDialog
          key={editing.rawgId}
          game={{ rawgId: editing.rawgId, name: editing.gameName, imageUrl: editing.imageUrl }}
          entry={editing}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && <ConfirmDeleteDialog key={deleting.rawgId} entry={deleting} onClose={() => setDeleting(null)} />}
    </section>
  )
}
