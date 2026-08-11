import { useId, type InputHTMLAttributes } from 'react'

import { cx } from '@/lib/cx'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  /** Adds the circular glyph that stands in for a magnifier (DESIGN.md section 5). */
  search?: boolean
}

export function Input({ label, error, search = false, className, id, ...props }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-2 block text-caption font-mono uppercase text-text-muted">
          {label}
        </label>
      )}

      <div className="relative">
        {search && (
          <span
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 h-[13px] w-[13px] -translate-y-1/2 rounded-full border border-text-muted"
          />
        )}
        <input
          id={inputId}
          // 16px is the floor: anything smaller makes Safari zoom the viewport on focus.
          className={cx(
            'h-[46px] w-full rounded-lg border bg-bg-elevated px-3.5 text-input-sans text-text-primary',
            'placeholder:text-text-muted focus:outline-none disabled:opacity-45',
            error ? 'border-danger' : 'border-border focus:border-accent',
            search && 'pl-[37px]',
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />
      </div>

      {error && (
        <p id={errorId} className="mt-1.5 text-field-error text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
