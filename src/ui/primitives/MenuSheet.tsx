import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export type MenuSheetItem = {
  id: string
  label: string
  onSelect: () => void
  /** Cautious row (delete). Default rows are the ordinary actions. */
  tone?: 'default' | 'danger'
}

type MenuSheetProps = {
  id: string
  open: boolean
  title: string
  closeLabel: string
  onClose: () => void
  items: readonly MenuSheetItem[]
  /** Replaces the item list (for example a confirm step). */
  panel?: ReactNode
  /**
   * Changes when the sheet step changes (list vs confirm) so focus returns
   * to the dialog without running on every parent render.
   */
  focusKey?: string
  /** Short message above the list or panel (errors). */
  notice?: ReactNode
}

/**
 * Bottom sheet for secondary actions (T7.3 / D34).
 *
 * Backdrop tap, the close control, and Escape dismiss the sheet. Rendered in
 * a portal so it covers the page even when a parent clips overflow. Item
 * chrome stays here; screens pass labels and handlers only.
 */
export function MenuSheet({
  id,
  open,
  title,
  closeLabel,
  onClose,
  items,
  panel,
  focusKey = 'list',
  notice,
}: MenuSheetProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) {
      return
    }

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCloseRef.current()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }
    dialogRef.current?.focus()
  }, [open, focusKey])

  if (!open) {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={[
          'relative z-10 flex max-h-[85svh] w-full flex-col overflow-y-auto',
          'max-w-lg rounded-t-control border border-line bg-panel px-4 pt-3',
          'pb-[max(1.5rem,env(safe-area-inset-bottom))]',
          'md:max-w-2xl lg:max-w-3xl',
          'focus:outline-none',
        ].join(' ')}
      >
        <div
          className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-line"
          aria-hidden="true"
        />
        <div className="flex items-center justify-between gap-3">
          <h2
            id={titleId}
            className="font-display text-xl font-semibold text-ink"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={[
              'shrink-0 rounded-control px-2 py-2 text-base font-medium text-ink-muted',
              'underline-offset-2 hover:underline',
              'focus:outline-none focus:ring-2 focus:ring-board/30',
            ].join(' ')}
          >
            {closeLabel}
          </button>
        </div>

        {notice ? <div className="mt-3">{notice}</div> : null}

        {panel ?? (
          <ul className="mt-2 flex flex-col">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={item.onSelect}
                  className={[
                    'w-full rounded-control px-3 py-4 text-left text-lg font-medium',
                    'hover:bg-board-soft active:bg-board-soft',
                    'focus:outline-none focus:ring-2 focus:ring-board/30',
                    item.tone === 'danger' ? 'text-ink-muted' : 'text-ink',
                  ].join(' ')}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>,
    document.body,
  )
}
