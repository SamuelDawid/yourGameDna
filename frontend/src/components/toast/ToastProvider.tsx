import { useCallback, useRef, useState, type ReactNode } from 'react'
import { Icon } from '../Icon'
import { ToastContext, type ToastInput } from './toastContext'
import styles from './Toast.module.css'

interface Toast extends ToastInput {
  id: number
}

const DURATION_MS = 3800

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => setToasts((current) => current.filter((toast) => toast.id !== id)), [])

  const show = useCallback(
    (input: ToastInput) => {
      const id = nextId.current++
      setToasts((current) => [...current.slice(-2), { ...input, id }])
      window.setTimeout(() => dismiss(id), DURATION_MS)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className={styles.region} role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`${styles.toast} ${styles[toast.tone ?? 'success']}`}>
            <Icon name={toast.tone === 'error' ? 'alert' : toast.tone === 'info' ? 'helix' : 'check'} size={18} />
            <div className={styles.text}>
              <p className={styles.title}>{toast.title}</p>
              {toast.description && <p className={styles.description}>{toast.description}</p>}
            </div>
            <button type="button" className={styles.close} onClick={() => dismiss(toast.id)} aria-label="Zamknij powiadomienie">
              <Icon name="x" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
