import { Button } from './Button'

type BottomActionBarProps = {
  undoLabel: string
  passLabel: string
  nextLabel: string
  /** No last turn to undo. */
  undoDisabled?: boolean
  /** No integer score entered yet (D33). */
  nextDisabled?: boolean
  confirmingUndo?: boolean
  undoConfirmPrompt: string
  confirmUndoLabel: string
  cancelUndoLabel: string
  onUndo: () => void
  onPass: () => void
  onConfirmUndo: () => void
  onCancelUndo: () => void
  /**
   * `submit` saves via the surrounding form (so Enter in the word field
   * advances). `button` calls `onNext`.
   */
  nextType?: 'button' | 'submit'
  onNext?: () => void
}

/**
 * Turn-screen actions: undo, pass, and the dominant next-player save (T7.5 / D33 / P13).
 *
 * Kumoa asks for a short confirm in place of the three actions so the bar
 * stays one row. Ohi and Seuraava pelaaja are secondary vs primary. Screens
 * pass Finnish labels and decide when next is disabled.
 */
export function BottomActionBar({
  undoLabel,
  passLabel,
  nextLabel,
  undoDisabled = false,
  nextDisabled = false,
  confirmingUndo = false,
  undoConfirmPrompt,
  confirmUndoLabel,
  cancelUndoLabel,
  onUndo,
  onPass,
  onConfirmUndo,
  onCancelUndo,
  nextType = 'button',
  onNext,
}: BottomActionBarProps) {
  if (confirmingUndo) {
    return (
      <div
        className="flex items-center gap-2"
        role="group"
        aria-label={undoConfirmPrompt}
      >
        <p className="min-w-0 flex-1 text-sm leading-snug text-ink">
          {undoConfirmPrompt}
        </p>
        <Button
          variant="primary"
          size="compact"
          align="center"
          onClick={onConfirmUndo}
        >
          {confirmUndoLabel}
        </Button>
        <Button
          variant="secondary"
          size="compact"
          align="center"
          onClick={onCancelUndo}
        >
          {cancelUndoLabel}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-stretch gap-2">
      <Button
        variant="secondary"
        size="compact"
        align="center"
        disabled={undoDisabled}
        onClick={onUndo}
      >
        {undoLabel}
      </Button>
      <Button variant="secondary" size="compact" align="center" onClick={onPass}>
        {passLabel}
      </Button>
      <div className="flex min-w-0 flex-1">
        <Button
          variant="primary"
          size="compact"
          align="center"
          fullWidth
          type={nextType}
          disabled={nextDisabled}
          onClick={nextType === 'button' ? onNext : undefined}
        >
          {nextLabel}
        </Button>
      </div>
    </div>
  )
}
