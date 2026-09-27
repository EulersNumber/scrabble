import type { ReactNode } from 'react'
import { Button } from './Button'

type SecondarySheetProps = {
  open: boolean
  title: string
  closeLabel: string
  onClose: () => void
  children: ReactNode
}

/**
 * Bottom sheet for secondary active-game actions (T7.3, D27).
 *
 * Keeps history / undo / finish / delete off the first viewport. Chrome lives
 * here so screens only pass title, close handler, and body content. Backdrop
 * dismisses; content scrolls inside the panel.
 */
export function SecondarySheet({
  open,
  title,
  closeLabel,
  onClose,
  children,
}: SecondarySheetProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      <button
        type="button"
        aria-label={closeLabel}
        className="absolute inset-0 bg-ink/35"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="secondary-sheet-title"
        className="relative z-10 flex max-h-[85svh] flex-col rounded-t-control border border-line bg-panel shadow-lg"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
          <h2
            id="secondary-sheet-title"
            className="font-display text-xl font-semibold text-ink"
          >
            {title}
          </h2>
          <Button variant="ghost" onClick={onClose}>
            {closeLabel}
          </Button>
        </div>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 py-4">
          {children}
        </div>
      </div>
    </div>
  )
}
