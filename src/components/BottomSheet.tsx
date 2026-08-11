import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

import { cx } from '@/lib/cx'
import { t } from '@/lib/strings'

export interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

const OPEN_MS = 240
const CLOSE_MS = 180

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const [mounted, setMounted] = useState(open)
  const [shown, setShown] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Mount first, then flip to the shown state on the next frame so the browser has
  // a starting position to animate from.
  useEffect(() => {
    if (open) {
      setMounted(true)
      const frame = requestAnimationFrame(() => setShown(true))
      return () => cancelAnimationFrame(frame)
    }
    setShown(false)
    const timer = window.setTimeout(() => setMounted(false), CLOSE_MS)
    return () => window.clearTimeout(timer)
  }, [open])

  // The page behind the sheet must not scroll along.
  useEffect(() => {
    if (!mounted) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [mounted])

  // Move focus into the sheet once it is on screen.
  useEffect(() => {
    if (!shown) return
    const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)
    first?.focus()
  }, [shown])

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      // Keep Tab inside the sheet.
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (!focusable || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    },
    [onClose],
  )

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-50" onKeyDown={onKeyDown}>
      <div
        role="presentation"
        onClick={onClose}
        className={cx(
          'absolute inset-0 bg-overlay transition-opacity duration-150',
          shown ? 'opacity-100' : 'opacity-0',
        )}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx(
          'absolute inset-x-0 bottom-0 flex max-h-[88%] flex-col',
          'rounded-t-sheet border-t border-border bg-bg-elevated shadow-sheet',
          shown ? 'translate-y-0' : 'translate-y-full',
        )}
        style={{
          transitionProperty: 'transform',
          transitionDuration: `${shown ? OPEN_MS : CLOSE_MS}ms`,
          transitionTimingFunction: 'cubic-bezier(.32,.72,0,1)',
        }}
      >
        <div aria-hidden className="flex justify-center pt-2.5">
          <span className="h-1 w-10 rounded-full bg-border-strong" />
        </div>

        <div className="flex items-center justify-between border-b border-border px-6.5 pb-3 pt-3">
          <h2 className="font-serif text-[22px] font-normal leading-7 text-text-primary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 min-h-touch px-1 text-input-sans text-text-muted active:text-text-primary"
          >
            {t.action.done}
          </button>
        </div>

        <div
          className="scroll-area px-6.5 pt-5"
          style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
