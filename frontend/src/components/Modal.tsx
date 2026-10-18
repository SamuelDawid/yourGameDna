import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Icon } from './Icon'
import styles from './Modal.module.css'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  /** ukryj nagłówek wizualnie (np. gdy treść ma własny „hero”), zostaje dla czytników ekranu */
  hideTitle?: boolean
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  footer?: ReactNode
}

// Natywny <dialog>: pułapka fokusu, Esc i warstwa tła za darmo.
export function Modal({ open, onClose, title, hideTitle = false, size = 'md', children, footer }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const pressStartedOnBackdrop = useRef(false)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={`${styles.dialog} ${styles[size]}`}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onMouseDown={(event) => {
        pressStartedOnBackdrop.current = event.target === event.currentTarget
      }}
      onClick={(event) => {
        if (pressStartedOnBackdrop.current && event.target === event.currentTarget) onClose()
      }}
    >
      {open && (
        <div className={styles.panel}>
          <header className={hideTitle ? styles.floatingHeader : styles.header}>
            <h2 id={titleId} className={hideTitle ? 'visually-hidden' : styles.title}>
              {title}
            </h2>
            <button type="button" className={styles.close} onClick={onClose} aria-label="Zamknij">
              <Icon name="x" size={18} />
            </button>
          </header>
          <div className={styles.body}>{children}</div>
          {footer && <footer className={styles.footer}>{footer}</footer>}
        </div>
      )}
    </dialog>
  )
}
