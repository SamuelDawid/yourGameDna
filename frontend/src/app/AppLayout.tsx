import { Link, NavLink, Outlet } from 'react-router'
import { Avatar } from '../components/Avatar'
import { Icon } from '../components/Icon'
import { Logo } from '../components/Logo'
import { usePlayer } from '../features/auth/playerContext'
import styles from './AppLayout.module.css'

export function AppLayout() {
  const player = usePlayer()
  return (
    <>
      <header className={styles.header}>
        <div className={`page ${styles.inner}`}>
          <Link to="/" className={styles.brand} aria-label="yourGameDNA – wyszukiwarka">
            <Logo />
          </Link>
          <nav className={styles.nav} aria-label="Główna nawigacja">
            <NavLink to="/" end className={styles.navLink}>
              <Icon name="search" size={16} />
              <span>Szukaj</span>
            </NavLink>
          </nav>
          <NavLink to="/profile" className={styles.profile} aria-label={`Twój profil (${player.userName})`}>
            <span className={styles.profileName}>{player.userName}</span>
            <Avatar name={player.userName} size={36} />
          </NavLink>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <div className={`page ${styles.footerInner}`}>
          <span>yourGameDNA</span>
          <span>
            Dane i grafiki gier:{' '}
            <a href="https://rawg.io" target="_blank" rel="noreferrer">
              RAWG
            </a>
          </span>
        </div>
      </footer>
    </>
  )
}
