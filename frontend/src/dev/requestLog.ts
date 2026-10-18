import { useSyncExternalStore } from 'react'

export interface LoggedRequest {
  id: number
  at: number
  method: string
  url: string
  /** 0 = brak odpowiedzi (sieć) */
  status: number
  durationMs: number
  /** kto odpowiedział: BFF, catalog-service, player-service, mock… */
  backend: string
  /** początek ciała odpowiedzi – do podejrzenia w panelu Dev */
  preview: string
  /** żądanie wykonane „pod spodem” przez emulację (np. rejestracja -> POST /players) */
  nested?: boolean
}

const MAX_ENTRIES = 60
const PREVIEW_CHARS = 4000

let entries: LoggedRequest[] = []
let nextId = 1
const listeners = new Set<() => void>()

export function recordRequest(entry: Omit<LoggedRequest, 'id' | 'at'>) {
  if (!import.meta.env.DEV) return
  const logged: LoggedRequest = { ...entry, id: nextId++, at: Date.now(), preview: entry.preview.slice(0, PREVIEW_CHARS) }
  entries = [logged, ...entries].slice(0, MAX_ENTRIES)
  listeners.forEach((listener) => listener())
}

export function clearRequestLog() {
  entries = []
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useRequestLog() {
  return useSyncExternalStore(subscribe, () => entries)
}
