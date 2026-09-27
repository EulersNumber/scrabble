import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react'

/** How long ⌫ must be held before the pad clears (T7.4). */
const CLEAR_LONG_PRESS_MS = 500

type ScoreKeypadProps = {
  id: string
  /** Accessible name for the whole pad. */
  label: string
  onDigit: (digit: number) => void
  onBackspace: () => void
  onClear: () => void
  onToggleSign: () => void
  toggleSignLabel: string
  backspaceLabel: string
  /** Visible hint that holding ⌫ clears the score. */
  clearHint: string
}

const ROWS: readonly (readonly number[])[] = [
  [7, 8, 9],
  [4, 5, 6],
  [1, 2, 3],
]

const keyClass = [
  'flex min-h-16 items-center justify-center rounded-control border border-line bg-panel',
  'text-3xl font-medium text-ink tabular-nums select-none touch-manipulation',
  'active:bg-board-soft hover:bg-board-soft',
  'focus:outline-none focus:ring-2 focus:ring-board/30',
  '[-webkit-touch-callout:none]',
].join(' ')

/**
 * Calculator keypad for turn points (T7.4 / D31 / D33).
 *
 * 3×4 grid, calculator order: 7–9, 4–6, 1–3, then ±, 0, ⌫. Pass is not a key.
 * Holding ⌫ clears; a short tap deletes one character. Keys are `type="button"`
 * so they do not submit the surrounding form or focus a text field.
 */
export function ScoreKeypad({
  id,
  label,
  onDigit,
  onBackspace,
  onClear,
  onToggleSign,
  toggleSignLabel,
  backspaceLabel,
  clearHint,
}: ScoreKeypadProps) {
  const hintId = `${id}-clear-hint`

  return (
    <div className="flex flex-col gap-2">
      <div id={id} role="group" aria-label={label} className="grid grid-cols-3 gap-2">
        {ROWS.flat().map((digit) => (
          <button
            key={digit}
            type="button"
            className={keyClass}
            onClick={() => onDigit(digit)}
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          className={keyClass}
          aria-label={toggleSignLabel}
          onClick={onToggleSign}
        >
          ±
        </button>
        <button type="button" className={keyClass} onClick={() => onDigit(0)}>
          0
        </button>
        <BackspaceKey
          label={backspaceLabel}
          describedBy={hintId}
          className={keyClass}
          onBackspace={onBackspace}
          onClear={onClear}
        />
      </div>
      <p id={hintId} className="text-sm text-ink-muted">
        {clearHint}
      </p>
    </div>
  )
}

type BackspaceKeyProps = {
  label: string
  describedBy: string
  className: string
  onBackspace: () => void
  onClear: () => void
}

/**
 * ⌫ key: click deletes one character; holding calls clear and swallows the click.
 */
function BackspaceKey({
  label,
  describedBy,
  className,
  onBackspace,
  onClear,
}: BackspaceKeyProps) {
  const timerRef = useRef<number | null>(null)
  const longPressedRef = useRef(false)

  function clearTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => clearTimer, [])

  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) {
      return
    }
    longPressedRef.current = false
    clearTimer()
    event.currentTarget.setPointerCapture(event.pointerId)
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null
      longPressedRef.current = true
      onClear()
    }, CLEAR_LONG_PRESS_MS)
  }

  function handlePointerEnd() {
    clearTimer()
  }

  function handleClick() {
    if (longPressedRef.current) {
      longPressedRef.current = false
      return
    }
    onBackspace()
  }

  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      aria-describedby={describedBy}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onClick={handleClick}
      onContextMenu={(event) => event.preventDefault()}
    >
      ⌫
    </button>
  )
}
