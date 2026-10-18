import type { ReactNode } from 'react'
import { isApiError } from '../api/client'
import { Button } from './Button'
import { Icon, type IconName } from './Icon'
import styles from './States.module.css'

interface ErrorStateProps {
  title?: string
  error: unknown
  onRetry?: () => void
  hint?: ReactNode
  compact?: boolean
}

export function ErrorState({ title = 'Coś poszło nie tak', error, onRetry, hint, compact = false }: ErrorStateProps) {
  const status = isApiError(error) ? error.status : null
  const message = error instanceof Error ? error.message : 'Nieznany błąd.'
  return (
    <div className={`${styles.state} ${styles.error} ${compact ? styles.compact : ''}`} role="alert">
      <div className={styles.icon}>
        <Icon name="alert" size={22} />
      </div>
      <div className={styles.text}>
        <p className={styles.title}>
          {title}
          {status != null && <span className={styles.status}>{status === 0 ? 'brak sieci' : `HTTP ${status}`}</span>}
        </p>
        <p className={styles.message}>{message}</p>
        {hint && <p className={styles.hint}>{hint}</p>}
      </div>
      {onRetry && (
        <Button size="sm" icon="refresh" onClick={onRetry}>
          Spróbuj ponownie
        </Button>
      )}
    </div>
  )
}

interface EmptyStateProps {
  icon?: IconName
  title: string
  children?: ReactNode
  action?: ReactNode
}

export function EmptyState({ icon = 'gamepad', title, children, action }: EmptyStateProps) {
  return (
    <div className={`${styles.state} ${styles.empty}`}>
      <div className={styles.icon}>
        <Icon name={icon} size={24} />
      </div>
      <div className={styles.text}>
        <p className={styles.title}>{title}</p>
        {children && <p className={styles.message}>{children}</p>}
      </div>
      {action}
    </div>
  )
}
