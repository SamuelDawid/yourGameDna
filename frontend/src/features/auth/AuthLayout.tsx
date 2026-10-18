import { useMemo, type ReactNode } from 'react'
import { GeneGlyph } from '../../components/GeneGlyph'
import { Logo } from '../../components/Logo'
import { GENES, type GeneKey } from '../../domain/genes'
import { DnaHelix, type HelixRung } from '../dna/DnaHelix'
import styles from './AuthLayout.module.css'

interface AuthLayoutProps {
  title: string
  subtitle: string
  notice?: ReactNode
  children: ReactNode
  footer: ReactNode
}

const DECORATIVE_GENES: (GeneKey | null)[] = ['story', 'gameplay', 'graphics', 'story', 'monetization', 'gameplay', null, 'story', 'graphics', 'gameplay']

export function AuthLayout({ title, subtitle, notice, children, footer }: AuthLayoutProps) {
  const rungs = useMemo<HelixRung[]>(
    () => Array.from({ length: 60 }, (_, index) => ({ id: index, gene: DECORATIVE_GENES[(index * 7) % DECORATIVE_GENES.length] })),
    [],
  )

  return (
    <div className={styles.layout}>
      <section className={styles.brand} aria-label="O aplikacji">
        <Logo />
        <div className={styles.pitch}>
          <h2 className={`display ${styles.headline}`}>
            Twoje gry
            <br />
            <span className={styles.gradient}>mają DNA.</span>
          </h2>
          <p className={styles.lead}>Dodawaj gry ukończone, porzucone i te, na które czekasz. Oceniaj je w czterech genach i zobacz, jakim typem gracza jesteś.</p>
        </div>
        <div className={styles.helix}>
          <DnaHelix rungs={rungs} height={150} spacing={24} />
        </div>
        <ul className={styles.genes}>
          {GENES.map((gene) => (
            <li key={gene.key}>
              <GeneGlyph gene={gene.key} size={11} />
              {gene.label}
            </li>
          ))}
        </ul>
      </section>

      <main className={styles.main}>
        <div className={styles.card}>
          <header className={styles.cardHeader}>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
          </header>
          {notice}
          {children}
        </div>
        <p className={styles.footer}>{footer}</p>
      </main>
    </div>
  )
}
