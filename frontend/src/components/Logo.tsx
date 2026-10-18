import styles from './Logo.module.css'

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="9" fill="#1a1f31" />
      <path d="M10 5c0 7 12 8 12 15s-12 6-12 7" stroke="#8b7bff" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M22 5c0 7-12 8-12 15s12 6 12 7" stroke="#3987e5" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M12 9.5h8M12.5 23.5h7" stroke="#c98500" strokeWidth="2" strokeLinecap="round" />
      <path d="M13 16.4h6" stroke="#d55181" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function Logo() {
  return (
    <span className={styles.logo}>
      <LogoMark />
      <span className={styles.wordmark}>
        <span className={styles.your}>your</span>Game<span className={styles.dna}>DNA</span>
      </span>
    </span>
  )
}
