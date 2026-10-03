import type { ButtonHTMLAttributes, ReactNode } from 'react'

type IconButtonProps = {
  /** Accessible name. The button is icon-only. */
  label: string
  children: ReactNode
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children' | 'aria-label'>

/**
 * Square icon control (D27).
 *
 * Used for the home settings gear (T9.1 / D41). Screens pass the icon and the
 * Finnish accessible name; color, size, and focus ring stay here.
 */
export function IconButton({ label, children, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={[
        'inline-flex size-11 shrink-0 items-center justify-center rounded-control text-ink',
        'hover:bg-board-soft active:bg-board-soft',
        'focus:outline-none focus:ring-2 focus:ring-board/30',
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  )
}
