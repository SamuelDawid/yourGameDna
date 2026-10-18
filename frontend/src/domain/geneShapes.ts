import type { GeneShape } from './genes'

/** Ścieżka SVG kształtu genu wyśrodkowana w (cx, cy) – w glifach i w helisie DNA. */
export function shapePath(shape: GeneShape, cx: number, cy: number, r: number): string {
  switch (shape) {
    case 'circle':
      return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`
    case 'square': {
      const s = r * 0.86
      return `M${cx - s} ${cy - s}h${2 * s}v${2 * s}h${-2 * s}Z`
    }
    case 'triangle':
      return `M${cx} ${cy - r}L${cx + r * 0.98} ${cy + r * 0.78}L${cx - r * 0.98} ${cy + r * 0.78}Z`
    case 'diamond':
      return `M${cx} ${cy - r}L${cx + r} ${cy}L${cx} ${cy + r}L${cx - r} ${cy}Z`
  }
}
