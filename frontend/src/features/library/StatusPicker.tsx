import { useId } from 'react'
import type { GameStatus } from '../../api/types'
import { Icon } from '../../components/Icon'
import { GAME_STATUSES, STATUS_META } from '../../domain/gameStatus'
import styles from './StatusPicker.module.css'

const DESCRIPTIONS: Record<GameStatus, string> = {
  NONE: 'jeszcze przede mną',
  PLAYING: 'w trakcie',
  COMPLETED: 'napisy końcowe',
  DROPPED: 'nie wciągnęła',
}

interface StatusPickerProps {
  value: GameStatus | null
  onChange: (status: GameStatus) => void
  errors?: string[]
}

export function StatusPicker({ value, onChange, errors }: StatusPickerProps) {
  const name = useId()
  return (
    <fieldset className={styles.fieldset} data-invalid={errors?.length ? true : undefined}>
      <legend className={styles.legend}>Status gry</legend>
      <div className={styles.options}>
        {GAME_STATUSES.map((status) => {
          const meta = STATUS_META[status]
          return (
            <label key={status} className={`${styles.option} ${styles[meta.tone]}`} data-checked={value === status || undefined}>
              <input type="radio" className="visually-hidden" name={name} value={status} checked={value === status} onChange={() => onChange(status)} />
              <span className={styles.icon}>
                <Icon name={meta.icon} size={15} strokeWidth={2.4} />
              </span>
              <span className={styles.text}>
                <span className={styles.label}>{meta.label}</span>
                <span className={styles.description}>{DESCRIPTIONS[status]}</span>
              </span>
            </label>
          )
        })}
      </div>
      {errors?.length ? <p className={styles.error}>{errors.join(' ')}</p> : null}
    </fieldset>
  )
}
