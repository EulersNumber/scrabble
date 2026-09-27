import type { ReactNode } from 'react'

type ScreenHeaderProps = {
  title: ReactNode
  subtitle?: ReactNode
  /** Larger brand-style title on home; smaller on inner screens. */
  size?: 'hero' | 'page'
  /**
   * Text tone for the surface behind the header.
   * `onBoard` is reserved for dark board surfaces; light sage shells use `default`.
   */
  tone?: 'default' | 'onBoard'
}

/**
 * Consistent title block for screens (D27).
 */
export function ScreenHeader({
  title,
  subtitle,
  size = 'page',
  tone = 'default',
}: ScreenHeaderProps) {
  const titleClass =
    size === 'hero'
      ? 'font-display text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl'
      : 'font-display text-2xl font-semibold tracking-tight md:text-3xl'

  const titleTone = tone === 'onBoard' ? 'text-on-board' : 'text-ink'
  const subtitleTone =
    tone === 'onBoard' ? 'text-on-board-muted' : 'text-ink-muted'

  return (
    <header className={size === 'hero' ? 'mb-10 md:mb-12' : 'mt-6'}>
      <h1 className={`${titleClass} ${titleTone}`}>{title}</h1>
      {subtitle !== undefined && subtitle !== null && subtitle !== false ? (
        <p className={`mt-3 max-w-md text-base md:text-lg ${subtitleTone}`}>
          {subtitle}
        </p>
      ) : null}
    </header>
  )
}
