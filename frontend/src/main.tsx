import '@fontsource-variable/inter'
import '@fontsource-variable/unbounded'
import './styles/global.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

// W trybach mock i services część (albo całość) /api obsługuje Mock Service Worker w przeglądarce.
// W trybie bff (npm run dev i build produkcyjny) ten blok wypada z bundla.
async function startMocking() {
  if (__API_MODE__ === 'bff') return
  const { startMockWorker } = await import('./mocks/browser')
  await startMockWorker(__API_MODE__)
}

startMocking()
  .catch((error) => console.error('[yourGameDNA] Nie udało się uruchomić MSW', error))
  .finally(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
