import type { GameStatus } from '../api/types'
import { STATUS_META } from '../domain/gameStatus'
import { Icon } from './Icon'
import styles from './StatusBadge.module.css'

export function StatusBadge({ status, solid = false }: { status: GameStatus; solid?: boolean }) {
  const meta = STATUS_META[status]
  return (
    <span className={`${styles.badge} ${styles[meta.tone]} ${solid ? styles.solid : ''}`}>
      <Icon name={meta.icon} size={12} strokeWidth={2.6} />
      {meta.label}
    </span>
  )
}
