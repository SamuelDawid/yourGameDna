import type { GameStatus } from '../api/types'

export type StatusTone = 'neutral' | 'info' | 'success' | 'danger'

export interface StatusMeta {
  /** etykieta przy pojedynczej grze */
  label: string
  /** etykieta zakładki filtra */
  plural: string
  tone: StatusTone
  icon: 'bookmark' | 'play' | 'check' | 'x'
}

/** Kolejność w formularzu i w filtrach profilu. */
export const GAME_STATUSES: GameStatus[] = ['NONE', 'PLAYING', 'COMPLETED', 'DROPPED']

export const STATUS_META: Record<GameStatus, StatusMeta> = {
  NONE: { label: 'Chcę zagrać', plural: 'Chcę zagrać', tone: 'neutral', icon: 'bookmark' },
  PLAYING: { label: 'Gram', plural: 'W trakcie', tone: 'info', icon: 'play' },
  COMPLETED: { label: 'Ukończona', plural: 'Ukończone', tone: 'success', icon: 'check' },
  DROPPED: { label: 'Porzucona', plural: 'Porzucone', tone: 'danger', icon: 'x' },
}

/** Gra, w którą jeszcze się nie grało, nie dostaje ocen. */
export const canBeRated = (status: GameStatus) => status !== 'NONE'
