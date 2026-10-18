import { setupWorker } from 'msw/browser'
import type { ApiMode } from '../config'
import { registerMockRearm } from './mockControl'

export async function startMockWorker(mode: Exclude<ApiMode, 'bff'>) {
  const { handlers } = mode === 'mock' ? await import('./mock/handlers') : await import('./services/handlers')
  const worker = setupWorker(...handlers)
  // wszystko, czego handlery nie obsługują (w trybie services: /api/games, /api/players), idzie normalnie do sieci
  const options = { onUnhandledFrame: 'bypass', quiet: true } as const
  await worker.start(options)
  registerMockRearm(async () => {
    console.info('[yourGameDNA] MSW przestał przechwytywać żądania (uśpiony service worker) – uruchamiam go ponownie.')
    await worker.stop()
    await worker.start(options)
  })
  console.info(
    mode === 'mock'
      ? '[yourGameDNA] Tryb mock – całe /api obsługuje MSW w przeglądarce.'
      : '[yourGameDNA] Tryb services – /api/auth emulowane w przeglądarce, reszta idzie do player-service i catalog-service.',
  )
}
