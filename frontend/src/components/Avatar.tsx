import type { CSSProperties } from 'react'
import { hueOf, initials } from '../lib/format'
import styles from './Avatar.module.css'

export function Avatar({ name, size = 38 }: { name: string; size?: number }) {
  return (
    <span className={styles.avatar} style={{ '--hue': hueOf(name), width: size, height: size, fontSize: size * 0.36 } as CSSProperties} aria-hidden="true">
      {initials(name)}
    </span>
  )
}
