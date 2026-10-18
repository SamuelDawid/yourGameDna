import type { CSSProperties } from 'react'
import type { LibraryEntry } from '../../api/types'
import { Button } from '../../components/Button'
import { GameCover } from '../../components/GameCover'
import { GeneGlyph } from '../../components/GeneGlyph'
import { StatusBadge } from '../../components/StatusBadge'
import { canBeRated } from '../../domain/gameStatus'
import { GENES, RATING_MAX, hasAnyGeneRating } from '../../domain/genes'
import { formatDate } from '../../lib/format'
import styles from './LibraryEntryCard.module.css'

interface LibraryEntryCardProps {
  entry: LibraryEntry
  onEdit: () => void
  onDelete: () => void
}

export function LibraryEntryCard({ entry, onEdit, onDelete }: LibraryEntryCardProps) {
  const added = formatDate(entry.createdAt)
  const rated = canBeRated(entry.status)
  return (
    <article className={styles.card}>
      <div className={styles.cover}>
        <GameCover name={entry.gameName} imageUrl={entry.imageUrl} />
      </div>

      <div className={styles.main}>
        <header className={styles.header}>
          <h3 className={styles.name}>{entry.gameName}</h3>
          <StatusBadge status={entry.status} />
        </header>
        {added && <p className={styles.meta}>Dodano {added}</p>}

        {rated && hasAnyGeneRating(entry) && (
          <ul className={styles.genes} aria-label="Geny">
            {GENES.map((gene) => {
              const value = entry[gene.field]
              return (
                <li key={gene.key} title={`${gene.label}: ${value ?? 'brak oceny'}`}>
                  <GeneGlyph gene={value != null ? gene.key : null} size={9} />
                  <span className="visually-hidden">{gene.label}</span>
                  <span className={styles.track}>
                    <span className={styles.fill} style={{ '--fill': `${((value ?? 0) / RATING_MAX) * 100}%`, '--color': gene.color } as CSSProperties} />
                  </span>
                  <span className={styles.geneValue}>{value ?? '–'}</span>
                </li>
              )
            })}
          </ul>
        )}

        {entry.review && <blockquote className={styles.review}>{entry.review}</blockquote>}
      </div>

      {rated && (
        <div className={styles.score} aria-label={entry.rating != null ? `Ocena ogólna ${entry.rating} na ${RATING_MAX}` : 'Bez oceny ogólnej'}>
          <span className={styles.scoreValue}>{entry.rating ?? '–'}</span>
          <span className={styles.scoreMax}>/{RATING_MAX}</span>
        </div>
      )}

      <footer className={styles.actions}>
        <Button size="sm" variant="ghost" icon="pencil" onClick={onEdit} aria-label={`Edytuj ocenę: ${entry.gameName}`}>
          {rated ? 'Edytuj ocenę' : 'Edytuj'}
        </Button>
        <Button size="sm" variant="ghost" icon="trash" onClick={onDelete} className={styles.delete} aria-label={`Usuń z profilu: ${entry.gameName}`}>
          Usuń
        </Button>
      </footer>
    </article>
  )
}
