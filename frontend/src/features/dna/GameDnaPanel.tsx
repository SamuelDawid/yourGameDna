import { useMemo, useState, type CSSProperties } from 'react'
import type { LibraryEntry } from '../../api/types'
import { ButtonLink } from '../../components/Button'
import { GeneGlyph } from '../../components/GeneGlyph'
import { Icon } from '../../components/Icon'
import { STATUS_META } from '../../domain/gameStatus'
import { GENES, GENE_BY_KEY, RATING_MAX } from '../../domain/genes'
import { countLabel, formatScore } from '../../lib/format'
import { computeGameDna, MIN_RATED_FOR_ARCHETYPE, type GameDna, type GeneScore, type Influence, type StrandRung } from './computeDna'
import { DnaHelix, type HelixRung } from './DnaHelix'
import styles from './GameDnaPanel.module.css'

const INFLUENCE_LABEL: Record<Influence, string> = {
  strong: 'silny wpływ',
  moderate: 'umiarkowany wpływ',
  weak: 'słaby wpływ',
}

export function GameDnaPanel({ entries }: { entries: LibraryEntry[] }) {
  const dna = useMemo(() => computeGameDna(entries), [entries])
  const [view, setView] = useState<'helix' | 'table'>('helix')

  const rungs = useMemo<HelixRung[]>(
    () =>
      dna.strand.map((rung) => ({
        id: rung.rawgId,
        gene: rung.dominant,
        label: rungLabel(rung),
      })),
    [dna.strand],
  )
  const rungById = useMemo(() => new Map(dna.strand.map((rung) => [rung.rawgId, rung])), [dna.strand])

  return (
    <section className={styles.panel} aria-labelledby="dna-title">
      <div className={styles.top}>
        <Summary dna={dna} />
        <Stats dna={dna} />
      </div>

      <div className={styles.strand}>
        <div className={styles.strandHeader}>
          <div>
            <h3 className={styles.blockTitle}>Nić DNA</h3>
            <p className={styles.blockHint}>Każdy szczebel to jedna gra z profilu, w kolejności dodania. Kolor i kształt – najwyżej oceniony gen tej gry.</p>
          </div>
          <div className={styles.viewSwitch} role="group" aria-label="Widok nici DNA">
            <button type="button" aria-pressed={view === 'helix'} onClick={() => setView('helix')}>
              <Icon name="helix" size={15} /> Helisa
            </button>
            <button type="button" aria-pressed={view === 'table'} onClick={() => setView('table')}>
              <Icon name="table" size={15} /> Tabela
            </button>
          </div>
        </div>

        {view === 'helix' ? (
          <DnaHelix
            rungs={rungs}
            interactive
            height={150}
            ariaLabel={`Nić DNA: ${countLabel(rungs.length, 'gra', 'gry', 'gier')}. Użyj strzałek, aby przejść po grach.`}
            renderTooltip={(rung) => <RungTooltip rung={rungById.get(Number(rung.id))!} />}
          />
        ) : (
          <StrandTable strand={dna.strand} />
        )}

        <ul className={styles.legend} aria-label="Legenda genów">
          {GENES.map((gene) => (
            <li key={gene.key}>
              <GeneGlyph gene={gene.key} size={11} />
              {gene.label}
            </li>
          ))}
          <li>
            <GeneGlyph gene={null} size={11} />
            Bez ocen genów
          </li>
        </ul>
      </div>

      <GeneBars genes={dna.genes} dominant={dna.dominant} />
    </section>
  )
}

function Summary({ dna }: { dna: GameDna }) {
  const missing = Math.max(0, MIN_RATED_FOR_ARCHETYPE - dna.ratedGames)
  return (
    <div className={styles.summary}>
      <p className="eyebrow">Twoje Game DNA</p>
      {dna.archetype ? (
        <>
          <h2 id="dna-title" className={`display ${styles.archetype}`}>
            {dna.dominant && <GeneGlyph gene={dna.dominant} size={18} />}
            {dna.archetype.title}
          </h2>
          <p className={styles.description}>{dna.archetype.description}</p>
        </>
      ) : (
        <>
          <h2 id="dna-title" className={`display ${styles.archetype}`}>
            DNA w budowie
          </h2>
          <p className={styles.description}>
            {dna.totalGames === 0
              ? 'Dodaj gry i oceń je w genach – z tych ocen powstanie Twój typ gracza.'
              : `Oceń geny w jeszcze ${countLabel(missing, 'grze', 'grach', 'grach')}, a poznasz swój typ gracza.`}
          </p>
          {dna.totalGames === 0 && (
            <ButtonLink to="/" variant="primary" icon="search" className={styles.cta}>
              Wyszukaj grę
            </ButtonLink>
          )}
        </>
      )}
      {dna.traits.length > 0 && (
        <ul className={styles.traits}>
          {dna.traits.map((trait) => (
            <li key={trait.key} title={trait.description}>
              {trait.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Stats({ dna }: { dna: GameDna }) {
  const completion = dna.completionRate
  return (
    <dl className={styles.stats}>
      <div className={styles.stat}>
        <dt>Gry w profilu</dt>
        <dd className={styles.statValue}>{dna.totalGames}</dd>
        <dd className={styles.statSub}>
          {dna.byStatus.NONE > 0 ? `${dna.byStatus.NONE} na liście „Chcę zagrać”` : `${countLabel(dna.ratedGames, 'oceniona', 'ocenione', 'ocenionych')} w genach`}
        </dd>
      </div>
      <div className={styles.stat}>
        <dt>Średnia ocena</dt>
        <dd className={styles.statValue}>
          {formatScore(dna.averageRating)}
          {dna.averageRating != null && <span className={styles.statUnit}>/{RATING_MAX}</span>}
        </dd>
        <dd className={styles.statSub}>ocena ogólna</dd>
      </div>
      <div className={styles.stat}>
        <dt>Ukończone</dt>
        <dd className={styles.statValue}>
          {completion == null ? '–' : `${Math.round(completion * 100)}%`}
        </dd>
        <dd className={styles.meter} aria-hidden="true">
          <span style={{ width: `${(completion ?? 0) * 100}%` }} />
        </dd>
        <dd className={styles.statSub}>
          {countLabel(dna.byStatus.COMPLETED, 'ukończona', 'ukończone', 'ukończonych')}, {countLabel(dna.byStatus.DROPPED, 'porzucona', 'porzucone', 'porzuconych')}
        </dd>
      </div>
    </dl>
  )
}

function GeneBars({ genes, dominant }: { genes: GeneScore[]; dominant: GameDna['dominant'] }) {
  return (
    <div className={styles.genes}>
      <div>
        <h3 className={styles.blockTitle}>Geny</h3>
        <p className={styles.blockHint}>Średnia ocen w każdej kategorii. Wpływ mówi, jak mocno dany gen idzie w parze z Twoją oceną ogólną.</p>
      </div>
      <ul className={styles.geneList}>
        {genes.map((score) => {
          const gene = GENE_BY_KEY[score.key]
          const percent = score.average == null ? 0 : (score.average / RATING_MAX) * 100
          return (
            <li key={score.key} className={styles.geneRow}>
              <span className={styles.geneName}>
                <GeneGlyph gene={score.key} size={12} />
                {gene.label}
                {dominant === score.key && <span className={styles.dominantTag}>dominujący</span>}
              </span>
              <span className={styles.geneTrack} aria-hidden="true">
                <span className={styles.geneFill} style={{ '--fill': `${percent}%`, '--color': gene.color } as CSSProperties} />
              </span>
              <span className={styles.geneValue}>{formatScore(score.average)}</span>
              <span className={styles.geneMeta}>
                {score.samples === 0 ? 'brak ocen' : countLabel(score.samples, 'ocena', 'oceny', 'ocen')}
                {score.influence && ` · ${INFLUENCE_LABEL[score.influence]}`}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function RungTooltip({ rung }: { rung: StrandRung }) {
  const gene = rung.dominant ? GENE_BY_KEY[rung.dominant] : null
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipValue}>{rung.gameName}</p>
      <p className={styles.tooltipRow}>
        <GeneGlyph gene={rung.dominant} size={10} />
        {gene ? `${gene.label} ${rung.dominantValue}/${RATING_MAX}` : 'Bez ocen genów'}
      </p>
      <p className={styles.tooltipRow}>
        {STATUS_META[rung.status].label}
        {rung.rating != null && ` · ocena ${rung.rating}/${RATING_MAX}`}
      </p>
    </div>
  )
}

function StrandTable({ strand }: { strand: StrandRung[] }) {
  if (strand.length === 0) return <p className={styles.blockHint}>Brak gier w profilu.</p>
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Gra</th>
            <th scope="col">Najmocniejszy gen</th>
            <th scope="col">Ocena</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {strand.map((rung, index) => {
            const gene = rung.dominant ? GENE_BY_KEY[rung.dominant] : null
            return (
              <tr key={rung.rawgId}>
                <td>{index + 1}</td>
                <td>{rung.gameName}</td>
                <td>
                  <span className={styles.cellGene}>
                    <GeneGlyph gene={rung.dominant} size={10} />
                    {gene ? `${gene.label} (${rung.dominantValue})` : '–'}
                  </span>
                </td>
                <td>{rung.rating ?? '–'}</td>
                <td>{STATUS_META[rung.status].label}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function rungLabel(rung: StrandRung) {
  const gene = rung.dominant ? `${GENE_BY_KEY[rung.dominant].label} ${rung.dominantValue}/${RATING_MAX}` : 'bez ocen genów'
  return `${rung.gameName}: ${gene}, ${STATUS_META[rung.status].label}`
}
