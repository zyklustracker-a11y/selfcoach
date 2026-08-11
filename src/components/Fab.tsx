import { cx } from '@/lib/cx'

export interface FabProps {
  onClick: () => void
  label: string
  disabled?: boolean
}

/**
 * Sits directly above the tab bar, flush with the screen margin.
 * Hidden on entry, review and sheet screens (DESIGN.md section 5).
 */
export function Fab({ onClick, label, disabled = false }: FabProps) {
  return (
    // The wrapper keeps the button flush with the app column rather than the
    // window edge, which only differ on a screen wider than a phone.
    <div
      className="pointer-events-none fixed inset-x-0 z-40 mx-auto flex max-w-app justify-end px-6.5"
      style={{ bottom: 'calc(56px + env(safe-area-inset-bottom) + 8px)' }}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={cx(
          'pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full',
          'bg-accent text-accent-contrast shadow-fab transition-transform',
          'active:bg-accent-pressed active:scale-[0.97] disabled:opacity-45 disabled:pointer-events-none',
        )}
      >
        <span aria-hidden className="mt-[-3px] text-[30px] leading-none">
          +
        </span>
      </button>
    </div>
  )
}
