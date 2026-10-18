import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import { Icon, type IconName } from './Icon'
import { Spinner } from './Spinner'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface CommonProps {
  variant?: Variant
  size?: Size
  icon?: IconName
  children?: ReactNode
}

interface ButtonProps extends CommonProps, ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
}

export function Button({ variant = 'secondary', size = 'md', icon, loading = false, className, children, disabled, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={classes(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner size={size === 'sm' ? 14 : 16} /> : icon && <Icon name={icon} size={size === 'sm' ? 15 : 17} />}
      {children}
    </button>
  )
}

export function ButtonLink({ variant = 'secondary', size = 'md', icon, className, children, ...props }: CommonProps & LinkProps) {
  return (
    <Link className={classes(variant, size, className)} {...props}>
      {icon && <Icon name={icon} size={size === 'sm' ? 15 : 17} />}
      {children}
    </Link>
  )
}

const classes = (variant: Variant, size: Size, extra?: string) => [styles.button, styles[variant], styles[size], extra].filter(Boolean).join(' ')
