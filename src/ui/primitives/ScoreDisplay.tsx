type ScoreDisplayProps = {
  id: string
  label: string
  /** Keypad display text. `""` shows `emptyLabel`; `"-"` is a pending minus. */
  display: string
  emptyLabel: string
  error?: string
  /**
   * `compact` hides the visible label (it stays available to assistive tech)
   * and shortens the readout so the turn-screen keypad can take the height.
   */
  density?: 'default' | 'compact'
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
  density = 'default',
}: ScoreDisplayProps) {
  const isEmpty = display === ''
  const labelId = `${id}-label`
  const errorId = `${id}-error`
  const compact = density === 'compact'

  return (
    <div className={compact ? 'flex flex-col gap-1' : 'flex flex-col gap-1.5'}>
      <span
        id={labelId}
        className={
          compact ? 'sr-only' : 'text-sm font-medium text-ink'
        }
      >
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
          'flex items-center justify-end rounded-control border bg-panel px-4',
          'text-right font-medium tabular-nums tracking-tight',
          compact
            ? 'min-h-14 py-1 text-4xl'
            : 'min-h-20 py-3 text-5xl',
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
