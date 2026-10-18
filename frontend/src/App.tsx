import { QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { RouterProvider } from 'react-router/dom'
import { queryClient } from './app/queryClient'
import { router } from './app/router'
import { ToastProvider } from './components/toast/ToastProvider'

// Panel Dev istnieje tylko w trybie deweloperskim – nie trafia do builda produkcyjnego
const DevPanel = import.meta.env.DEV ? lazy(() => import('./dev/DevPanel').then((module) => ({ default: module.DevPanel }))) : null

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
        {DevPanel && (
          <Suspense fallback={null}>
            <DevPanel />
          </Suspense>
        )}
      </ToastProvider>
    </QueryClientProvider>
  )
}
