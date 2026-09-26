import type { ReactNode } from 'react'

type ScreenHeaderProps = {
  title: ReactNode
  subtitle?: ReactNode
  /** Larger brand-style title on home; smaller on inner screens. */
  size?: 'hero' | 'page'
}

/**
 * Consistent title block for screens (D27).
 */
export function ScreenHeader({
  title,
  subtitle,
  size = 'page',
}: ScreenHeaderProps) {
  const titleClass =
    size === 'hero'
      ? 'font-display text-3xl font-semibold tracking-tight md:text-4xl'
      : 'font-display text-2xl font-semibold tracking-tight md:text-3xl'

  return (
    <header className={size === 'hero' ? 'mb-8 md:mb-10' : 'mt-6'}>
      <h1 className={titleClass}>{title}</h1>
      {subtitle !== undefined && subtitle !== null && subtitle !== false ? (
        <p className="mt-2 text-ink-muted md:text-lg">{subtitle}</p>
      ) : null}
    </header>
  )
}
