/// <reference types="vite/client" />

// Wstrzykiwane przez vite.config.ts (define)
declare const __API_MODE__: 'bff' | 'services' | 'mock'
declare const __API_TARGETS__: { bff: string; player: string; catalog: string }
