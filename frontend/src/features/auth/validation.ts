// Te same zasady co w CreatePlayerCommand (player-service) – serwer i tak waliduje, to tylko szybsza podpowiedź.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type FieldErrors = Record<string, string[]>

export function validateEmail(email: string, errors: FieldErrors) {
  if (!email.trim()) errors.email = ['Podaj adres email.']
  else if (!EMAIL.test(email.trim())) errors.email = ['To nie wygląda na poprawny adres email.']
}

export function validateUserName(userName: string, errors: FieldErrors) {
  const length = userName.trim().length
  if (length < 3 || length > 30) errors.userName = ['Nick musi mieć od 3 do 30 znaków.']
}

export function validateNewPassword(password: string, errors: FieldErrors) {
  if (password.length < 8) errors.password = ['Hasło musi mieć co najmniej 8 znaków.']
}

/** 409 z player-service ma tylko komunikat – zgadujemy pole po treści, w razie wątpliwości błąd zostaje ogólny. */
export function conflictField(message: string): 'userName' | 'email' | null {
  const lower = message.toLowerCase()
  if (lower.includes('username') || lower.includes('user name') || lower.includes('nick')) return 'userName'
  if (lower.includes('email')) return 'email'
  return null
}
