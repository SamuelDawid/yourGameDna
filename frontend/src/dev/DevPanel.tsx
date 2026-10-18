import { useEffect, useState } from 'react'
import { API_MODE, API_TARGETS } from '../config'
import { Icon } from '../components/Icon'
import { countLabel } from '../lib/format'
import { clearRequestLog, useRequestLog, type LoggedRequest } from './requestLog'
import styles from './DevPanel.module.css'

const OPEN_KEY = 'ygd.devpanel.open'

const MODE_INFO = {
  mock: { label: 'MOCK', description: 'Cały backend udawany w przeglądarce (MSW).' },
  services: { label: 'SERVICES', description: 'Prosto do serwisów, logowanie emulowane.' },
  bff: { label: 'BFF', description: 'Wszystko przez BFF.' },
} as const

function readOpen() {
  try {
    return localStorage.getItem(OPEN_KEY) === '1'
  } catch {
    return false
  }
}

/** Podgląd ruchu frontend -> BFF/serwisy. Widoczny tylko w `npm run dev*`. */
export function DevPanel() {
  const requests = useRequestLog()
  const [open, setOpen] = useState(readOpen)
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(OPEN_KEY, open ? '1' : '0')
    } catch {
      // bez zapamiętywania
    }
  }, [open])

  const errors = requests.filter((request) => request.status === 0 || request.status >= 500).length
  const mode = MODE_INFO[API_MODE]

  return (
    <aside className={styles.root} data-open={open || undefined} aria-label="Panel deweloperski">
      {open && (
        <div className={styles.panel}>
          <header className={styles.header}>
            <div>
              <p className={styles.title}>
                Panel Dev <span className={`${styles.mode} ${styles[API_MODE]}`}>{mode.label}</span>
              </p>
              <p className={styles.subtitle}>{mode.description}</p>
              <Targets />
            </div>
            <button type="button" className={styles.iconButton} onClick={() => setOpen(false)} aria-label="Zwiń panel Dev">
              <Icon name="chevronDown" size={18} />
            </button>
          </header>

          <div className={styles.toolbar}>
            <span>{countLabel(requests.length, 'żądanie', 'żądania', 'żądań')}</span>
            <div className={styles.toolbarActions}>
              {API_MODE === 'mock' && <ResetMockButton />}
              <button type="button" className={styles.textButton} onClick={clearRequestLog} disabled={requests.length === 0}>
                Wyczyść
              </button>
            </div>
          </div>

          {requests.length === 0 ? (
            <p className={styles.empty}>Tu pojawi się każde żądanie do /api – ze statusem, czasem i odpowiedzią.</p>
          ) : (
            <ol className={styles.list}>
              {requests.map((request) => (
                <RequestRow key={request.id} request={request} expanded={expanded === request.id} onToggle={() => setExpanded(expanded === request.id ? null : request.id)} />
              ))}
            </ol>
          )}
        </div>
      )}

      <button
        type="button"
        className={styles.pill}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={`Panel Dev – tryb ${mode.label}, ${countLabel(requests.length, 'żądanie', 'żądania', 'żądań')}`}
      >
        <span className={`${styles.dot} ${styles[API_MODE]}`} />
        <span className={styles.pillMode}>{mode.label}</span>
        <span className={styles.pillCount}>{requests.length}</span>
        {errors > 0 && (
          <span className={styles.pillErrors} aria-label={`Błędy serwera: ${errors}`}>
            <Icon name="alert" size={12} /> {errors}
          </span>
        )}
      </button>
    </aside>
  )
}

function Targets() {
  if (API_MODE === 'mock') return null
  const rows = API_MODE === 'bff' ? [['BFF', API_TARGETS.bff]] : [['catalog-service', API_TARGETS.catalog], ['player-service', API_TARGETS.player]]
  return (
    <ul className={styles.targets}>
      {rows.map(([name, url]) => (
        <li key={name}>
          <span>{name}</span>
          <code>{url}</code>
        </li>
      ))}
    </ul>
  )
}

function RequestRow({ request, expanded, onToggle }: { request: LoggedRequest; expanded: boolean; onToggle: () => void }) {
  const tone = request.status === 0 || request.status >= 500 ? 'bad' : request.status >= 400 ? 'warn' : 'ok'
  const path = request.url.replace(/^\/api/, '')
  return (
    <li className={styles.row} data-nested={request.nested || undefined}>
      <button type="button" className={styles.rowButton} onClick={onToggle} aria-expanded={expanded}>
        <span className={styles.method}>{request.method}</span>
        <span className={styles.path} title={request.url}>
          {request.nested && <span className={styles.nestedMark}>↳ </span>}
          {path}
        </span>
        <span className={`${styles.status} ${styles[tone]}`}>{request.status === 0 ? 'ERR' : request.status}</span>
        <span className={styles.duration}>{request.durationMs} ms</span>
      </button>
      {expanded && (
        <div className={styles.details}>
          <p className={styles.detailsMeta}>
            {request.backend} · {new Date(request.at).toLocaleTimeString('pl-PL')}
          </p>
          <pre className={styles.preview}>{prettyPreview(request.preview)}</pre>
        </div>
      )}
    </li>
  )
}

function ResetMockButton() {
  const [busy, setBusy] = useState(false)
  return (
    <button
      type="button"
      className={styles.textButton}
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        const { resetMockDb } = await import('../mocks/mock/db')
        await resetMockDb()
        window.location.reload()
      }}
    >
      Resetuj dane mock
    </button>
  )
}

function prettyPreview(preview: string) {
  if (!preview) return '(pusta odpowiedź)'
  try {
    return JSON.stringify(JSON.parse(preview), null, 2)
  } catch {
    return preview
  }
}
