import { Navigate, Outlet, useLocation } from 'react-router'
import { FullPageSpinner } from '../../components/Spinner'
import { BackendUnavailable } from './BackendUnavailable'
import { PlayerContext } from './playerContext'
import { useCurrentPlayer } from './useAuth'

export interface RedirectState {
  /** dokąd wrócić po zalogowaniu */
  from?: string
  /** świadome wylogowanie – nie wracamy na stronę, z której gracz wyszedł */
  loggedOut?: boolean
}

export function RequireAuth() {
  const me = useCurrentPlayer()
  const location = useLocation()

  if (me.isPending) return <FullPageSpinner />
  if (me.isError) return <BackendUnavailable error={me.error} onRetry={() => me.refetch()} />
  if (!me.data) return <Navigate to="/login" replace state={{ from: location.pathname + location.search } satisfies RedirectState} />

  return (
    <PlayerContext value={me.data}>
      <Outlet />
    </PlayerContext>
  )
}

export function GuestOnly() {
  const me = useCurrentPlayer()
  const location = useLocation()

  const state = location.state as RedirectState | null

  if (me.isPending) return <FullPageSpinner />
  if (me.data && !state?.loggedOut) {
    const from = state?.from
    return <Navigate to={from && from.startsWith('/') ? from : '/'} replace />
  }
  return <Outlet />
}
