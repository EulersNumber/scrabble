import type { ReactNode } from 'react'
import { Button } from './Button'

type ConfirmPanelProps = {
  prompt: ReactNode
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
  confirmDisabled?: boolean
}

/**
 * Compact confirm / cancel prompt styled from tokens (D27).
 *
 * Used for destructive or hard-to-undo actions (e.g. undo last turn) so
 * screens do not invent one-off alert chrome.
 */
export function ConfirmPanel({
  prompt,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  confirmDisabled = false,
}: ConfirmPanelProps) {
  return (
    <div
      className="rounded-control border border-line bg-panel px-4 py-4"
      role="group"
    >
      <p className="text-base text-ink">{prompt}</p>
      <div className="mt-3 flex flex-col gap-3">
        <Button
          variant="primary"
          fullWidth
          disabled={confirmDisabled}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
        <Button variant="secondary" fullWidth onClick={onCancel}>
          {cancelLabel}
        </Button>
      </div>
    </div>
  )
}
