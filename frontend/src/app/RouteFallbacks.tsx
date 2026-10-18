import { isRouteErrorResponse, useRouteError } from 'react-router'
import { ButtonLink } from '../components/Button'
import { EmptyState, ErrorState } from '../components/States'

export function NotFound() {
  return (
    <div className="page" style={{ paddingBlock: 64 }}>
      <EmptyState
        icon="helix"
        title="Tej strony nie ma w naszym DNA"
        action={
          <ButtonLink to="/" variant="primary" icon="search">
            Wróć do wyszukiwarki
          </ButtonLink>
        }
      >
        Sprawdź adres albo wróć na stronę główną.
      </EmptyState>
    </div>
  )
}

export function RouteError() {
  const error = useRouteError()
  const normalized = isRouteErrorResponse(error) ? new Error(`${error.status} ${error.statusText}`) : error
  return (
    <div className="page" style={{ paddingBlock: 64 }}>
      <ErrorState title="Aplikacja napotkała błąd" error={normalized} onRetry={() => window.location.reload()} />
    </div>
  )
}
