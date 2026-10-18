import { useId, useState, type KeyboardEvent, type ReactNode } from 'react'
import { shapePath } from '../../domain/geneShapes'
import { GENE_BY_KEY, type GeneKey } from '../../domain/genes'
import { useAnimatedPhase, useElementWidth, useInView, usePrefersReducedMotion } from '../../lib/hooks'
import styles from './DnaHelix.module.css'

export interface HelixRung {
  id: string | number
  gene: GeneKey | null
  /** opis dla czytników ekranu i aria-live */
  label?: string
}

interface DnaHelixProps {
  rungs: HelixRung[]
  height?: number
  spacing?: number
  animated?: boolean
  /** szczeble z danymi są aktywne (hover, fokus, strzałki) */
  interactive?: boolean
  renderTooltip?: (rung: HelixRung) => ReactNode
  ariaLabel?: string
}

const PAD_X = 18
/** nagłówek strony (64px) + wysokość dymka – mniej miejsca nad helisą = dymek pod nią */
const TOOLTIP_ROOM = 170
const TURN_RUNGS = 10

// Dwie nici: y = cy ± A·sin(θ). Środek szczebla zawsze leży na osi cy, więc kształty genów stoją w miejscu,
// a helisa „obraca się” wokół nich – dzięki temu cele najechania są stabilne.
export function DnaHelix({ rungs, height = 140, spacing = 26, animated = true, interactive = false, renderTooltip, ariaLabel }: DnaHelixProps) {
  const [containerRef, width] = useElementWidth<HTMLDivElement>()
  const reducedMotion = usePrefersReducedMotion()
  const inView = useInView(containerRef)
  const phase = useAnimatedPhase(animated && inView && !reducedMotion)
  const [active, setActive] = useState<number | null>(null)
  const [placement, setPlacement] = useState<'above' | 'below'>('above')
  const gradientId = useId()

  const capacity = width > 0 ? Math.max(1, Math.floor((width - PAD_X * 2) / spacing) + 1) : 0
  const visible = rungs.slice(-capacity)
  const slots = Math.max(capacity, visible.length)
  const cy = height / 2
  const amplitude = height / 2 - 16
  const period = spacing * TURN_RUNGS
  const theta = (x: number) => (x / period) * Math.PI * 2 + phase

  const strand = (sign: 1 | -1) => {
    let d = ''
    for (let x = 0; x <= width; x += 4) d += `${x === 0 ? 'M' : 'L'}${x.toFixed(1)} ${(cy + sign * amplitude * Math.sin(theta(x))).toFixed(1)}`
    return d
  }

  const activate = (index: number | null) => {
    if (index != null) {
      const top = containerRef.current?.getBoundingClientRect().top ?? Infinity
      setPlacement(top < TOOLTIP_ROOM ? 'below' : 'above')
    }
    setActive(index)
  }

  const activeRung = active != null ? visible[active] : null
  const activeX = active != null ? PAD_X + active * spacing : 0

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive || visible.length === 0) return
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault()
      const step = event.key === 'ArrowRight' ? 1 : -1
      activate(active == null ? (step > 0 ? 0 : visible.length - 1) : clamp(active + step, 0, visible.length - 1))
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      activate(event.key === 'Home' ? 0 : visible.length - 1)
    } else if (event.key === 'Escape') {
      activate(null)
    }
  }

  return (
    <div
      ref={containerRef}
      className={styles.helix}
      style={{ height }}
      tabIndex={interactive && visible.length > 0 ? 0 : undefined}
      role={interactive ? 'group' : undefined}
      aria-label={interactive ? ariaLabel : undefined}
      aria-hidden={interactive ? undefined : true}
      onKeyDown={onKeyDown}
      onBlur={() => activate(null)}
      onPointerLeave={() => activate(null)}
    >
      {width > 0 && (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={styles.svg} aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id={`${gradientId}-a`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#8b7bff" />
              <stop offset="1" stopColor="#3987e5" />
            </linearGradient>
            <linearGradient id={`${gradientId}-b`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#3987e5" />
              <stop offset="1" stopColor="#8b7bff" />
            </linearGradient>
          </defs>

          <path d={strand(-1)} stroke={`url(#${gradientId}-b)`} strokeWidth={2} fill="none" opacity={0.55} strokeLinecap="round" />

          {Array.from({ length: slots }, (_, index) => {
            const x = PAD_X + index * spacing
            const s = Math.sin(theta(x))
            const rung = visible[index]
            const gene = rung?.gene ? GENE_BY_KEY[rung.gene] : null
            const isActive = active === index
            const y1 = cy + amplitude * s
            const y2 = cy - amplitude * s
            if (!rung) {
              return <line key={`empty-${index}`} x1={x} x2={x} y1={y1} y2={y2} stroke="var(--gene-empty)" strokeWidth={1.5} strokeLinecap="round" opacity={0.5 + 0.4 * Math.abs(s)} />
            }
            const color = gene?.color ?? 'var(--text-faint)'
            return (
              <g key={rung.id} opacity={active == null || isActive ? 0.6 + 0.4 * Math.abs(s) : 0.35}>
                <line x1={x} x2={x} y1={y1} y2={y2} stroke={color} strokeWidth={isActive ? 4 : 3} strokeLinecap="round" />
                {gene ? (
                  <path d={shapePath(gene.shape, x, cy, isActive ? 7.5 : 5.5)} fill={color} stroke="var(--surface-1)" strokeWidth={2} paintOrder="stroke" />
                ) : (
                  <circle cx={x} cy={cy} r={isActive ? 5 : 3.5} fill="var(--surface-1)" stroke="var(--text-faint)" strokeWidth={1.5} />
                )}
              </g>
            )
          })}

          <path d={strand(1)} stroke={`url(#${gradientId}-a)`} strokeWidth={2.2} fill="none" strokeLinecap="round" />

          {interactive &&
            visible.map((rung, index) => (
              <rect
                key={`hit-${rung.id}`}
                x={PAD_X + index * spacing - spacing / 2}
                y={0}
                width={spacing}
                height={height}
                fill="transparent"
                onPointerEnter={() => activate(index)}
              />
            ))}
        </svg>
      )}

      {interactive && activeRung && renderTooltip && (
        <div className={styles.tooltip} data-placement={placement} role="tooltip" style={{ left: clamp(activeX, 110, Math.max(110, width - 110)) }}>
          {renderTooltip(activeRung)}
        </div>
      )}
      {interactive && (
        <p className="visually-hidden" aria-live="polite">
          {activeRung?.label ?? ''}
        </p>
      )}
    </div>
  )
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
