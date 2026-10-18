import { apiRequest } from './client'
import type { LoginCommand, Player, RegisterCommand } from './types'

// Logowanie żyje w BFF: po udanym login/register BFF ustawia ciasteczko sesji (HttpOnly).
export const authApi = {
  me: (signal?: AbortSignal) => apiRequest<Player>('/auth/me', { signal }),
  login: (command: LoginCommand) => apiRequest<Player>('/auth/login', { method: 'POST', body: command }),
  register: (command: RegisterCommand) => apiRequest<Player>('/auth/register', { method: 'POST', body: command }),
  logout: () => apiRequest<void>('/auth/logout', { method: 'POST' }),
}
