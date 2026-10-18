import { shapePath } from '../domain/geneShapes'
import { GENE_BY_KEY, type GeneKey } from '../domain/genes'

export function GeneGlyph({ gene, size = 10 }: { gene: GeneKey | null; size?: number }) {
  const meta = gene ? GENE_BY_KEY[gene] : null
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" aria-hidden="true" focusable="false" style={{ flex: 'none' }}>
      {meta ? <path d={shapePath(meta.shape, 5, 5, 4.6)} fill={meta.color} /> : <circle cx="5" cy="5" r="3" fill="var(--gene-empty)" />}
    </svg>
  )
}
