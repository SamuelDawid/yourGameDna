import { useState } from 'react'
import { useNavigate } from 'react-router'
import type { Player } from '../../api/types'
import { Avatar } from '../../components/Avatar'
import { Button } from '../../components/Button'
import type { RedirectState } from '../auth/RouteGuards'
import { useLogout } from '../auth/useAuth'
import { EditProfileDialog } from './EditProfileDialog'
import styles from './ProfileHeader.module.css'

export function ProfileHeader({ player }: { player: Player }) {
  const [editing, setEditing] = useState(false)
  const logout = useLogout()
  const navigate = useNavigate()

  const onLogout = () => {
    logout.mutate()
    navigate('/login', { replace: true, state: { loggedOut: true } satisfies RedirectState })
  }

  return (
    <section className={styles.header}>
      <Avatar name={player.userName} size={84} />
      <div className={styles.identity}>
        <p className="eyebrow">Profil gracza</p>
        <h1 className={`display ${styles.name}`}>{player.userName}</h1>
        <p className={styles.email}>{player.email}</p>
        {player.bio ? (
          <p className={styles.bio}>{player.bio}</p>
        ) : (
          <button type="button" className={styles.addBio} onClick={() => setEditing(true)}>
            + Dodaj kilka słów o sobie
          </button>
        )}
      </div>
      <div className={styles.actions}>
        <Button icon="pencil" onClick={() => setEditing(true)}>
          Edytuj profil
        </Button>
        <Button variant="ghost" icon="logout" loading={logout.isPending} onClick={onLogout}>
          Wyloguj
        </Button>
      </div>
      {editing && <EditProfileDialog player={player} onClose={() => setEditing(false)} />}
    </section>
  )
}
