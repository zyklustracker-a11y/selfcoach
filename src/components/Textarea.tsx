import { useEffect, useId, useRef, type TextareaHTMLAttributes } from 'react'

import { cx } from '@/lib/cx'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  /** Shows a character counter in the lower right corner. */
  showCount?: boolean
  /** The review answer field is one step larger than an entry field. */
  size?: 'entry' | 'review'
  /**
   * Borderless variant for the three chained entry fields: they sit directly on
   * bg-base and only grow a border while focused (DESIGN.md, prose rule 1).
   */
  bare?: boolean
}

export function Textarea({
  label,
  error,
  showCount = false,
  size = 'entry',
  bare = false,
  className,
  id,
  value,
  onChange,
  ...props
}: TextareaProps) {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  const errorId = `${textareaId}-error`
  const ref = useRef<HTMLTextAreaElement>(null)

  // Autogrow: collapse first, then grow to the content. Runs on every value change
  // so restoring a draft resizes the field too.
  useEffect(() => {
    const element = ref.current
    if (!element) return
    element.style.height = 'auto'
    element.style.height = `${element.scrollHeight}px`
  }, [value])

  const count = typeof value === 'string' ? value.length : 0

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="mb-2 block text-caption font-mono uppercase text-text-muted">
          {label}
        </label>
      )}

      <div className="relative">
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          onChange={onChange}
          rows={1}
          className={cx(
            'block min-h-[120px] w-full resize-none font-serif text-text-primary caret-accent',
            'focus:outline-none disabled:opacity-45',
            size === 'review' ? 'text-review-answer' : 'text-input-serif',
            bare
              ? 'border border-transparent bg-transparent p-0 focus:border-accent'
              : 'rounded-xl border bg-bg-elevated p-4',
            !bare && (error ? 'border-danger' : 'border-border focus:border-accent'),
            showCount && !bare && 'pb-8',
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...props}
        />

        {showCount && (
          <span className="pointer-events-none absolute bottom-3 right-4 font-mono text-caption text-text-muted">
            {count}
          </span>
        )}
      </div>

      {error && (
        <p id={errorId} className="mt-1.5 text-field-error text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
