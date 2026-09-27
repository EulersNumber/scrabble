type ScoreDisplayProps = {
  id: string
  label: string
  /** Keypad display text. `""` shows `emptyLabel`; `"-"` is a pending minus. */
  display: string
  emptyLabel: string
  error?: string
}

/**
 * Large read-only score readout for the keypad (T7.4 / D31).
 *
 * This is not a text field, so focusing it does not open the system keyboard.
 * Screens pass the Finnish label and the keypad's `display` string.
 */
export function ScoreDisplay({
  id,
  label,
  display,
  emptyLabel,
  error,
}: ScoreDisplayProps) {
  const isEmpty = display === ''
  const labelId = `${id}-label`
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-1.5">
      <span id={labelId} className="text-sm font-medium text-ink">
        {label}
      </span>
      <div
        id={id}
        role="status"
        aria-live="polite"
        aria-labelledby={labelId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={[
          'flex min-h-20 items-center justify-end rounded-control border bg-panel px-4 py-3',
          'text-right text-5xl font-medium tabular-nums tracking-tight',
          error ? 'border-red-700' : 'border-line',
          isEmpty ? 'text-ink-muted' : 'text-ink',
        ].join(' ')}
      >
        {isEmpty ? emptyLabel : display}
      </div>
      {error ? (
        <span id={errorId} className="text-sm text-red-800">
          {error}
        </span>
      ) : null}
    </div>
  )
}
