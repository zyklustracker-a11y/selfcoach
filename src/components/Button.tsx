import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cx } from '@/lib/cx'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  /** Full-width buttons sit at the bottom of a screen and use the larger label. */
  fullWidth?: boolean
  /** Ghost buttons only: renders the label in `danger`. */
  destructive?: boolean
  children: ReactNode
}

const BASE =
  'inline-flex items-center justify-center select-none transition-transform ' +
  'disabled:opacity-45 disabled:pointer-events-none'

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-contrast text-label rounded-lg px-5 h-11 ' +
    'active:bg-accent-pressed active:scale-[0.99]',
  secondary:
    'border border-border-strong text-text-primary text-label rounded-md px-5 h-11 ' +
    'active:bg-bg-hover',
  ghost: 'text-text-muted text-input-sans px-1 min-h-touch active:text-text-primary',
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  destructive = false,
  className,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        BASE,
        VARIANT[variant],
        fullWidth && 'w-full',
        // A full-width primary button is the bottom action of a screen: 52px tall,
        // 17px label (DESIGN.md section 5).
        fullWidth && variant === 'primary' && 'h-[52px] text-label-lg',
        destructive && variant === 'ghost' && 'text-danger active:text-danger',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
