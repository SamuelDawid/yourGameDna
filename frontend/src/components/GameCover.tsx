import { useState, type CSSProperties } from 'react'
import { hueOf, initials } from '../lib/format'
import styles from './GameCover.module.css'

interface GameCoverProps {
  name: string
  imageUrl?: string | null
  className?: string
}

/** Obrazek z RAWG, a gdy go nie ma (mock, biblioteka bez imageUrl) – okładka generowana z nazwy. */
export function GameCover({ name, imageUrl, className }: GameCoverProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const classes = [styles.cover, className].filter(Boolean).join(' ')

  if (imageUrl && imageUrl !== failedUrl) {
    return <img className={classes} src={imageUrl} alt="" loading="lazy" decoding="async" onError={() => setFailedUrl(imageUrl)} />
  }
  return (
    <div className={`${classes} ${styles.generated}`} style={{ '--hue': hueOf(name) } as CSSProperties} aria-hidden="true">
      <span className={styles.initials}>{initials(name)}</span>
    </div>
  )
}
