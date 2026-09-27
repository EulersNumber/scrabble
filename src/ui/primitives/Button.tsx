import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'inverse'
  | 'inverseSecondary'
type ButtonSize = 'md' | 'hero'

type ButtonProps = {
  children: ReactNode
  variant?: ButtonVariant
  /** Visual scale; `hero` is for a dominant primary CTA (e.g. home new game). */
  size?: ButtonSize
  fullWidth?: boolean
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-board text-on-board active:bg-board-dark hover:bg-board-dark',
  secondary:
    'border border-line bg-panel text-ink active:bg-board-soft hover:bg-board-soft',
  ghost:
    'bg-transparent text-ink-muted underline-offset-2 hover:underline active:text-ink',
  /** Cream tile-face control for board-green hero surfaces (T7.1). */
  inverse:
    'bg-tile-face text-tile-letter active:bg-tile-face-edge hover:bg-tile-face-edge',
  /** Outlined light control for secondary actions on hero surfaces (T7.1). */
  inverseSecondary:
    'border border-on-board/45 bg-board-dark/35 text-on-board backdrop-blur-sm active:bg-board-dark/55 hover:bg-board-dark/50',
}

const sizeClass: Record<ButtonSize, string> = {
  md: 'px-4 py-4 text-lg',
  hero: 'min-h-28 px-5 py-8 text-2xl md:min-h-32 md:py-10 md:text-3xl',
}

/**
 * Shared tap target styled from design tokens (D27).
 *
 * Prefer this over one-off button classes so color/radius changes stay in one place.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        'rounded-control text-left font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        fullWidth ? 'w-full' : '',
        variant === 'ghost'
          ? 'self-start px-0 py-1 text-base'
          : sizeClass[size],
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
