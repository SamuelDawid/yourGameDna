import { useId, useState, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { Icon } from './Icon'
import styles from './Field.module.css'

interface FieldShellProps {
  id: string
  label: string
  hint?: ReactNode
  errors?: string[]
  aside?: ReactNode
  children: ReactNode
}

function FieldShell({ id, label, hint, errors, aside, children }: FieldShellProps) {
  const hasError = Boolean(errors?.length)
  return (
    <div className={styles.field} data-invalid={hasError || undefined}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        {aside}
      </div>
      {children}
      {hasError ? (
        <ul className={styles.errors} id={`${id}-error`}>
          {errors!.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : (
        hint && (
          <p className={styles.hint} id={`${id}-hint`}>
            {hint}
          </p>
        )
      )}
    </div>
  )
}

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  hint?: ReactNode
  errors?: string[]
  revealable?: boolean
}

export function TextField({ label, hint, errors, revealable = false, type = 'text', ...props }: TextFieldProps) {
  const id = useId()
  const [revealed, setRevealed] = useState(false)
  const describedBy = errors?.length ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <FieldShell id={id} label={label} hint={hint} errors={errors}>
      <div className={styles.control}>
        <input
          id={id}
          className={styles.input}
          type={revealable && revealed ? 'text' : type}
          aria-invalid={errors?.length ? true : undefined}
          aria-describedby={describedBy}
          {...props}
        />
        {revealable && (
          <button
            type="button"
            className={styles.reveal}
            onClick={() => setRevealed((value) => !value)}
            aria-label={revealed ? 'Ukryj hasło' : 'Pokaż hasło'}
            aria-pressed={revealed}
          >
            <Icon name={revealed ? 'eyeOff' : 'eye'} size={17} />
          </button>
        )}
      </div>
    </FieldShell>
  )
}

interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label: string
  hint?: ReactNode
  errors?: string[]
}

export function TextAreaField({ label, hint, errors, maxLength, value, ...props }: TextAreaFieldProps) {
  const id = useId()
  const length = typeof value === 'string' ? value.length : 0
  const describedBy = errors?.length ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      errors={errors}
      aside={
        maxLength ? (
          <span className={styles.counter} data-near-limit={length > maxLength * 0.9 || undefined}>
            {length}/{maxLength}
          </span>
        ) : undefined
      }
    >
      <textarea
        id={id}
        className={styles.textarea}
        maxLength={maxLength}
        value={value}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      />
    </FieldShell>
  )
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null
  return (
    <div className={styles.formError} role="alert">
      <Icon name="alert" size={18} />
      <span>{message}</span>
    </div>
  )
}
