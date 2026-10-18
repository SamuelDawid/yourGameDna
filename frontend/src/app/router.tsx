import { createBrowserRouter } from 'react-router'
import { LoginPage } from '../features/auth/LoginPage'
import { RegisterPage } from '../features/auth/RegisterPage'
import { GuestOnly, RequireAuth } from '../features/auth/RouteGuards'
import { ProfilePage } from '../features/profile/ProfilePage'
import { SearchPage } from '../features/search/SearchPage'
import { AppLayout } from './AppLayout'
import { NotFound, RouteError } from './RouteFallbacks'

export const router = createBrowserRouter([
  {
    errorElement: <RouteError />,
    children: [
      {
        element: <GuestOnly />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { index: true, element: <SearchPage /> },
              { path: '/profile', element: <ProfilePage /> },
              { path: '*', element: <NotFound /> },
            ],
          },
        ],
      },
    ],
  },
])
