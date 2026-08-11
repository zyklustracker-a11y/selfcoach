import type { ReactNode } from 'react'

import { cx } from '@/lib/cx'

export interface TagChipProps {
  children: ReactNode
  /** Filter chips are a touch taller and use the larger label. */
  filter?: boolean
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  /** Renders the remove glyph as a second, separate target. */
  onRemove?: () => void
  removeLabel?: string
}

const SHELL = 'inline-flex items-center rounded-full border border-border-strong'

/**
 * DESIGN.md asks for a 34px filter chip but also for a 44px minimum on everything
 * interactive. Both hold: the pill stays 34px, an invisible pseudo-element grows
 * the tap target to 44px — the same trick the remove glyph uses.
 */
const HIT_AREA =
  "relative before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 before:content-['']"

export function TagChip({
  children,
  filter = false,
  selected = false,
  disabled = false,
  onClick,
  onRemove,
  removeLabel = 'Entfernen',
}: TagChipProps) {
  const shell = cx(
    SHELL,
    filter ? 'min-h-[34px] px-2.5 text-chip-filter' : 'px-2.5 py-1 text-chip',
    selected ? 'bg-bg-hover text-text-primary' : 'bg-transparent text-text-secondary',
    disabled && 'pointer-events-none opacity-45',
  )

  // A chip that only toggles is one target: the whole pill is the button.
  if (onClick && !onRemove) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={selected}
        className={cx(shell, HIT_AREA)}
      >
        {children}
      </button>
    )
  }

  return (
    <span className={shell}>
      {onClick ? (
        <button type="button" onClick={onClick} disabled={disabled} className={HIT_AREA}>
          {children}
        </button>
      ) : (
        children
      )}

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label={removeLabel}
          className={cx(
            'ml-1.5 text-[12px] leading-none text-text-muted',
            "relative before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
          )}
        >
          ×
        </button>
      )}
    </span>
  )
}
