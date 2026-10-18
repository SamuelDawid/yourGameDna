import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react'

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(timeout)
  }, [value, delayMs])
  return debounced
}

export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    setWidth(element.clientWidth)
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return [ref, width] as const
}

/** Czy element jest w widoku – animacje poza ekranem nie muszą się kręcić. */
export function useInView(ref: RefObject<Element | null>) {
  const [inView, setInView] = useState(true)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])
  return inView
}

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED_MOTION)
      query.addEventListener('change', onChange)
      return () => query.removeEventListener('change', onChange)
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
  )
}

/** Faza animacji rosnąca w czasie (radiany); stoi w miejscu przy prefers-reduced-motion. */
export function useAnimatedPhase(enabled: boolean, radiansPerSecond = 0.5) {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    if (!enabled) return
    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      setPhase((value) => (value + ((now - last) / 1000) * radiansPerSecond) % (Math.PI * 2))
      last = now
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [enabled, radiansPerSecond])
  return phase
}
