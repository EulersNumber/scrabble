import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ChoiceChipProps = {
  children: ReactNode
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'type'>

/**
 * Compact selectable chip for optional picks (e.g. name suggestions) (D27).
 *
 * Prefer this over one-off bordered buttons in screens so chip chrome stays
 * with the other UI primitives.
 */
export function ChoiceChip({ children, ...rest }: ChoiceChipProps) {
  return (
    <button
      type="button"
      className={[
        'rounded-control border border-line bg-panel px-3 py-2 text-base text-ink',
        'active:bg-board-soft hover:bg-board-soft',
        'disabled:cursor-not-allowed disabled:opacity-50',
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  )
}
