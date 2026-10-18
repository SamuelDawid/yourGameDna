import { useId, useState, type CSSProperties } from 'react'
import { GeneGlyph } from '../../components/GeneGlyph'
import { RATING_MAX, type GeneKey } from '../../domain/genes'
import styles from './RatingField.module.css'

interface RatingFieldProps {
  label: string
  hint?: string
  gene?: GeneKey
  color: string
  value: number | null
  onChange: (value: number | null) => void
  errors?: string[]
  size?: 'md' | 'lg'
}

const SCALE = Array.from({ length: RATING_MAX }, (_, index) => index + 1)

/** Skala 1–10 na natywnych radio – strzałki działają same, a wartość widać obok. */
export function RatingField({ label, hint, gene, color, value, onChange, errors, size = 'md' }: RatingFieldProps) {
  const name = useId()
  const [hovered, setHovered] = useState<number | null>(null)
  const shown = hovered ?? value

  return (
    <fieldset className={`${styles.field} ${styles[size]}`} style={{ '--rating-color': color } as CSSProperties} data-invalid={errors?.length ? true : undefined}>
      <legend className={styles.legend}>
        {gene && <GeneGlyph gene={gene} size={11} />}
        <span className={styles.label}>{label}</span>
        {hint && <span className={styles.hint}>{hint}</span>}
      </legend>

      <div className={styles.row}>
        <div className={styles.scale} onPointerLeave={() => setHovered(null)}>
          {SCALE.map((step) => (
            <label
              key={step}
              className={styles.segment}
              data-filled={shown != null && step <= shown ? true : undefined}
              data-preview={hovered != null || undefined}
              onPointerEnter={() => setHovered(step)}
            >
              <input
                type="radio"
                className="visually-hidden"
                name={name}
                value={step}
                checked={value === step}
                onChange={() => onChange(step)}
                aria-label={`${label}: ${step} z ${RATING_MAX}`}
              />
            </label>
          ))}
        </div>
        <span className={styles.value} aria-hidden="true">
          {shown ?? '–'}
          <span className={styles.max}>/{RATING_MAX}</span>
        </span>
        <button type="button" className={styles.clear} onClick={() => onChange(null)} disabled={value == null} aria-label={`Wyczyść: ${label}`}>
          Wyczyść
        </button>
      </div>

      {errors?.length ? <p className={styles.error}>{errors.join(' ')}</p> : null}
    </fieldset>
  )
}
