import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = {
  children: ReactNode
  variant?: ButtonVariant
  fullWidth?: boolean
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-board text-on-board active:bg-board-dark hover:bg-board-dark',
  secondary:
    'border border-line bg-panel text-ink active:bg-board-soft hover:bg-board-soft',
  ghost:
    'bg-transparent text-ink-muted underline-offset-2 hover:underline active:text-ink',
}

/**
 * Shared tap target styled from design tokens (D27).
 *
 * Prefer this over one-off button classes so color/radius changes stay in one place.
 */
export function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        'rounded-control px-4 py-4 text-left text-lg font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        fullWidth ? 'w-full' : '',
        variant === 'ghost' ? 'self-start px-0 py-1 text-base' : '',
        variantClass[variant],
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </button>
  )
}
