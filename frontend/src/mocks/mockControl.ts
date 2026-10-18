// Mały łącznik między klientem API a MSW (bez importu MSW, żeby nie wciągać go do głównego bundla).
//
// Po co: MSW pamięta, które karty ma mockować, tylko w pamięci service workera. Gdy przeglądarka
// uśpi workera (np. karta długo w tle), żądania przestają być przechwytywane i trafiają do Vite.
// Vite odpowiada wtedy 503 z nagłówkiem UNMOCKED_HEADER, a klient API uzbraja MSW ponownie i powtarza żądanie.
export const UNMOCKED_HEADER = 'X-YGD-Unmocked'

let rearm: (() => Promise<void>) | null = null
let pending: Promise<void> | null = null

export function registerMockRearm(callback: () => Promise<void>) {
  rearm = callback
}

/** true, jeśli MSW został ponownie uruchomiony (kilka równoległych żądań dzieli jedno uruchomienie). */
export async function rearmMocks(): Promise<boolean> {
  if (!rearm) return false
  pending ??= rearm().finally(() => {
    pending = null
  })
  await pending
  return true
}
