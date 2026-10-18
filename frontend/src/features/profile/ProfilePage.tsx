import { isApiError } from '../../api/client'
import { ErrorState } from '../../components/States'
import { API_MODE } from '../../config'
import { usePlayer } from '../auth/playerContext'
import { GameDnaPanel } from '../dna/GameDnaPanel'
import { LibrarySection } from '../library/LibrarySection'
import { useLibrary } from '../library/useLibrary'
import { ProfileHeader } from './ProfileHeader'
import styles from './ProfilePage.module.css'

export function ProfilePage() {
  const player = usePlayer()
  const library = useLibrary()

  return (
    <div className={`page ${styles.page}`}>
      <ProfileHeader player={player} />

      {library.isPending ? (
        <ProfileSkeleton />
      ) : library.isError ? (
        <ErrorState title="Nie udało się wczytać biblioteki" error={library.error} onRetry={() => library.refetch()} hint={libraryHint(library.error, player.id)} />
      ) : (
        <>
          <GameDnaPanel entries={library.data} />
          <LibrarySection entries={library.data} />
        </>
      )}
    </div>
  )
}

function libraryHint(error: unknown, playerId: number) {
  if (API_MODE === 'mock' || !isApiError(error)) return undefined
  if (error.status === 404 || error.status === 405) {
    return `GET /players/${playerId}/library nie odpowiada – jeśli FEATURE-003 jest jeszcze w trakcie, to spodziewany wynik.`
  }
  return undefined
}

function ProfileSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      <div className="skeleton" style={{ height: 300, borderRadius: 24 }} />
      <div className="skeleton" style={{ height: 22, width: 180 }} />
      <div className={styles.skeletonGrid}>
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="skeleton" style={{ height: 150, borderRadius: 18 }} />
        ))}
      </div>
    </div>
  )
}
