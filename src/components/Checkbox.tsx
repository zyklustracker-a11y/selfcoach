import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

import { cx } from '@/lib/cx'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode
  /** Marks the box when a required confirmation is missing. */
  invalid?: boolean
}

export function Checkbox({ label, invalid = false, className, id, checked, ...props }: CheckboxProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <label
      htmlFor={inputId}
      className={cx(
        'flex min-h-touch cursor-pointer items-start gap-3.5 py-2',
        props.disabled && 'opacity-45',
        className,
      )}
    >
      <span className="relative flex h-[27px] shrink-0 items-center">
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          className="peer absolute h-[21px] w-[21px] cursor-pointer opacity-0"
          {...props}
        />
        <span
          aria-hidden
          className={cx(
            'flex h-[21px] w-[21px] items-center justify-center rounded-sm border-[1.5px]',
            'peer-focus-visible:shadow-[var(--focus-ring)]',
            checked ? 'border-accent bg-accent' : 'bg-transparent',
            !checked && (invalid ? 'border-danger' : 'border-border-strong'),
          )}
        >
          {checked && (
            // 9x5 angle built from two borders, rotated -45deg (DESIGN.md section 5).
            <span className="mt-[-2px] h-[5px] w-[9px] rotate-[-45deg] border-b-2 border-l-2 border-accent-contrast" />
          )}
        </span>
      </span>

      <span
        className={cx(
          'font-serif text-entry',
          checked ? 'text-[#948B83] line-through' : 'text-text-primary',
        )}
      >
        {label}
      </span>
    </label>
  )
}
