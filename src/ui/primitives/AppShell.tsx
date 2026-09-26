import type { ReactNode } from 'react'

type AppShellProps = {
  children: ReactNode
}

/**
 * Page chrome shared by all screens (D27).
 *
 * Centers a single scorepad column: phone-width by default, wider on tablet
 * (iPad-friendly) without stretching to a full desktop dashboard.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-svh bg-surface text-ink">
      <div
        className={[
          'mx-auto flex min-h-svh w-full flex-col',
          'max-w-lg px-4 py-8',
          'md:max-w-2xl md:px-8 md:py-10',
          'lg:max-w-3xl',
        ].join(' ')}
      >
        {children}
      </div>
    </div>
  )
}
