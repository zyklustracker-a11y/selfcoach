import type { HTMLAttributes, ReactNode } from 'react'

import { cx } from '@/lib/cx'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** `pending` is the dashed outline used for an empty or awaited slot. */
  variant?: 'default' | 'pending'
  /** Only tappable cards get pressed and focus states. */
  interactive?: boolean
  children: ReactNode
}

/**
 * Used sparingly. A card is for content that falls out of the reading flow because
 * it comes from elsewhere or demands a decision — not as a generic container
 * (DESIGN.md, prose rule 1).
 */
export function Card({
  variant = 'default',
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cx(
        'rounded-xl bg-bg-elevated p-3.5',
        variant === 'pending' ? 'border border-dashed border-border-strong' : 'border border-border',
        interactive && 'active:bg-bg-hover',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
