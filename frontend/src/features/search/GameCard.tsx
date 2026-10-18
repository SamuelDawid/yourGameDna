import type { GameSummary, LibraryEntry } from '../../api/types'
import { GameCover } from '../../components/GameCover'
import { Icon } from '../../components/Icon'
import { StatusBadge } from '../../components/StatusBadge'
import { formatRawgRating, yearOf } from '../../lib/format'
import styles from './GameCard.module.css'

interface GameCardProps {
  game: GameSummary
  entry?: LibraryEntry
  onOpen: () => void
}

export function GameCard({ game, entry, onOpen }: GameCardProps) {
  const rating = formatRawgRating(game.rating)
  const year = yearOf(game.released)
  return (
    <button type="button" className={styles.card} onClick={onOpen} data-in-library={entry ? true : undefined}>
      <div className={styles.media}>
        <GameCover name={game.name} imageUrl={game.imageUrl} />
        {entry && (
          <span className={styles.status}>
            <StatusBadge status={entry.status} solid />
          </span>
        )}
        {rating && (
          <span className={styles.rating}>
            <Icon name="star" size={12} />
            <span className="visually-hidden">Ocena RAWG</span>
            {rating}
          </span>
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{game.name}</h3>
        <div className={styles.meta}>
          <span>{year ?? 'TBA'}</span>
          <span className={styles.action}>
            {entry ? (
              <>
                <Icon name="pencil" size={13} /> Edytuj
              </>
            ) : (
              <>
                <Icon name="plus" size={14} /> Dodaj
              </>
            )}
          </span>
        </div>
      </div>
    </button>
  )
}

export function GameCardSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      <div className="skeleton" style={{ aspectRatio: '16 / 9', borderRadius: 0 }} />
      <div className={styles.body}>
        <div className="skeleton" style={{ height: 14, width: '80%' }} />
        <div className="skeleton" style={{ height: 12, width: '35%' }} />
      </div>
    </div>
  )
}
