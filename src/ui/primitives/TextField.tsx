import type { InputHTMLAttributes } from 'react'

type TextFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  /** `compact` shortens the field for the turn screen's secondary word entry. */
  density?: 'default' | 'compact'
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'id' | 'value' | 'onChange' | 'className'
>

/**
 * Labeled text input styled from design tokens (D27).
 *
 * Used on the new-game name form; keeps focus rings and padding consistent
 * with other controls without one-off input classes in screens.
 */
export function TextField({
  id,
  label,
  value,
  onChange,
  error,
  density = 'default',
  ...rest
}: TextFieldProps) {
  const compact = density === 'compact'

  return (
    <label className={compact ? 'flex flex-col gap-1' : 'flex flex-col gap-1.5'} htmlFor={id}>
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={[
          'rounded-control border bg-panel px-4 text-ink',
          'outline-none focus:border-board focus:ring-2 focus:ring-board/30',
          compact ? 'py-2 text-base' : 'py-3 text-lg',
          error ? 'border-red-700' : 'border-line',
        ].join(' ')}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
      {error ? (
        <span id={`${id}-error`} className="text-sm text-red-800">
          {error}
        </span>
      ) : null}
    </label>
  )
}
