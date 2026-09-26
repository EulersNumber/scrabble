import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ListRowButtonProps = {
  children: ReactNode
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>

/**
 * Full-width list row used for selectable games (continue / history).
 *
 * Visual chrome comes from tokens so rows stay consistent across screens.
 */
export function ListRowButton({ children, type = 'button', ...rest }: ListRowButtonProps) {
  return (
    <button
      type={type}
      className={[
        'flex w-full flex-col items-start gap-1 rounded-control border border-line bg-panel px-4 py-4 text-left',
        'active:bg-board-soft hover:bg-board-soft',
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  )
}
