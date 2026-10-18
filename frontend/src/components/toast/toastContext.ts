import { createContext, useContext } from 'react'

export type ToastTone = 'success' | 'error' | 'info'

export interface ToastInput {
  title: string
  description?: string
  tone?: ToastTone
}

export const ToastContext = createContext<((toast: ToastInput) => void) | null>(null)

export function useToast() {
  const show = useContext(ToastContext)
  if (!show) throw new Error('useToast musi być użyty wewnątrz <ToastProvider>')
  return show
}
