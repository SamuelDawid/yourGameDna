import { API_MODE, API_TARGETS } from '../../config'
import { DEMO_ACCOUNT } from '../../mocks/demoAccount'
import { Icon } from '../../components/Icon'
import styles from './ModeNotice.module.css'

/** Podpowiedź na ekranach logowania – widoczna tylko w trybach deweloperskich bez prawdziwego auth. */
export function ModeNotice({ onUseDemo }: { onUseDemo?: (email: string, password: string) => void }) {
  if (!import.meta.env.DEV || API_MODE === 'bff') return null

  if (API_MODE === 'services') {
    return (
      <div className={styles.notice}>
        <Icon name="terminal" size={16} />
        <p>
          <strong>Tryb services.</strong> Backend nie ma jeszcze logowania, więc jest ono emulowane: hasło nie jest sprawdzane, a gracz jest szukany po emailu w{' '}
          {API_TARGETS.player}/players.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.notice}>
      <Icon name="terminal" size={16} />
      <p>
        <strong>Tryb mock.</strong> Backend jest udawany w przeglądarce.{' '}
        {onUseDemo && (
          <button type="button" className={styles.link} onClick={() => onUseDemo(DEMO_ACCOUNT.email, DEMO_ACCOUNT.password)}>
            Wypełnij danymi konta demo
          </button>
        )}
      </p>
    </div>
  )
}
