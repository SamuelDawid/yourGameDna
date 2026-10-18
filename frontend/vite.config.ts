import react from '@vitejs/plugin-react'
import { msw } from 'msw/vite'
import type { ServerResponse } from 'node:http'
import { defineConfig, loadEnv, type Plugin, type ProxyOptions } from 'vite'

// Tryby uruchomienia (vite --mode <tryb>):
//   development  npm run dev           -> całe /api idzie do BFF
//   services     npm run dev:services  -> /api/games do catalog-service, /api/players do player-service,
//                                         logowanie emulowane w przeglądarce (backend nie ma jeszcze auth)
//   mock         npm run dev:mock      -> cały backend udawany w przeglądarce (MSW), bez żadnego serwera
type ApiMode = 'bff' | 'services' | 'mock'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const targets = {
    bff: env.BFF_URL || 'http://localhost:8080',
    player: env.PLAYER_SERVICE_URL || 'http://localhost:8081',
    catalog: env.CATALOG_SERVICE_URL || 'http://localhost:8082',
  }
  const apiMode: ApiMode = mode === 'mock' || mode === 'services' ? mode : 'bff'

  return {
    plugins: [react(), msw(), unmockedApiGuard(apiMode)],
    define: {
      __API_MODE__: JSON.stringify(apiMode),
      __API_TARGETS__: JSON.stringify(targets),
    },
    server: {
      port: Number(env.PORT) || 5173,
      proxy: proxyFor(apiMode, targets),
    },
  }
})

function proxyFor(apiMode: ApiMode, targets: Record<'bff' | 'player' | 'catalog', string>): Record<string, ProxyOptions> {
  switch (apiMode) {
    case 'mock':
      return {}
    case 'services':
      return {
        '/api/games': directToService('catalog-service', targets.catalog),
        '/api/players': directToService('player-service', targets.player),
      }
    case 'bff':
      return {
        '/api': { target: targets.bff, changeOrigin: true, configure: problemOnProxyError('BFF', targets.bff) },
      }
  }
}

// to samo co UNMOCKED_HEADER w src/mocks/mockControl.ts
const UNMOCKED_HEADER = 'X-YGD-Unmocked'

// W trybach mock/services część /api ma obsłużyć MSW w przeglądarce. Jeśli żądanie mimo to dotrze do Vite
// (uśpiony service worker), odpowiadamy czytelnym 503 – frontend uzbroi MSW ponownie i powtórzy żądanie.
function unmockedApiGuard(apiMode: ApiMode): Plugin {
  return {
    name: 'ygd-unmocked-api-guard',
    configureServer(server) {
      if (apiMode === 'bff') return
      const mockedPrefix = apiMode === 'mock' ? '/api/' : '/api/auth/'
      server.middlewares.use((request, response, next) => {
        if (!request.url?.startsWith(mockedPrefix)) return next()
        response.writeHead(503, { 'Content-Type': 'application/problem+json', [UNMOCKED_HEADER]: '1' })
        response.end(
          JSON.stringify({
            type: 'about:blank',
            title: 'Service Unavailable',
            status: 503,
            detail: 'Mock Service Worker nie przechwycił tego żądania. Odśwież stronę.',
          }),
        )
      })
    },
  }
}

// Serwisy nie mają prefiksu /api, więc /api/games?search=x -> catalog-service /games?search=x
function directToService(name: string, target: string): ProxyOptions {
  return {
    target,
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
    configure: problemOnProxyError(name, target),
  }
}

// Gdy serwis nie działa, frontend dostaje ProblemDetail z nazwą serwisu zamiast pustego 502
function problemOnProxyError(name: string, target: string): ProxyOptions['configure'] {
  return (proxy) => {
    proxy.on('error', (error, _request, response) => {
      if (!response || !('req' in response)) return
      const res = response as ServerResponse
      if (res.headersSent || res.writableEnded) return
      const code = (error as NodeJS.ErrnoException).code ?? error.message
      res.writeHead(502, { 'Content-Type': 'application/problem+json' })
      res.end(
        JSON.stringify({
          type: 'about:blank',
          title: 'Bad Gateway',
          status: 502,
          detail: `Brak połączenia z ${name} (${target}): ${code}. Czy serwis jest uruchomiony?`,
          service: name,
        }),
      )
    })
  }
}
