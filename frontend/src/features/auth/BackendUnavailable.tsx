import { API_MODE, API_TARGETS } from '../../config'
import { ErrorState } from '../../components/States'
import { Logo } from '../../components/Logo'
import styles from './BackendUnavailable.module.css'

export function BackendUnavailable({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <div className={styles.wrapper}>
      <Logo />
      <ErrorState title="Nie można sprawdzić sesji" error={error} onRetry={onRetry} hint={<ModeHint />} />
    </div>
  )
}

export function ModeHint() {
  if (API_MODE === 'bff') {
    return (
      <>
        Frontend działa w trybie <strong>bff</strong> i woła {API_TARGETS.bff}. Uruchom BFF albo odpal frontend z udawanym backendem: <code>npm run dev:mock</code>.
      </>
    )
  }
  if (API_MODE === 'services') {
    return (
      <>
        Tryb <strong>services</strong>: player-service ({API_TARGETS.player}) i catalog-service ({API_TARGETS.catalog}) muszą być uruchomione.
      </>
    )
  }
  return (
    <>
      Tryb <strong>mock</strong>: odpowiada Mock Service Worker w przeglądarce. Odśwież stronę – jeśli to nie pomoże, wyczyść dane strony.
    </>
  )
}
