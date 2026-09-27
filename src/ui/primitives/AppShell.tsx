import type { ReactNode } from 'react'
import type { AtmosphereIntensity } from '../fallingTiles'
import { FallingTilesBackdrop } from './FallingTilesBackdrop'

type AppShellAtmosphere = AtmosphereIntensity | 'none'

type AppShellProps = {
  children: ReactNode
  /**
   * Ambient backdrop treatment (T7.1 / P2 / P10).
   * - `hero` — branded felt + prominent falling tiles (home)
   * - `dimmed` — quiet tiles behind scorepad chrome (default on inner screens)
   * - `none` — flat surface, no tiles
   */
  atmosphere?: AppShellAtmosphere
}

/**
 * Page chrome shared by all screens (D27).
 *
 * Centers a single scorepad column: phone-width by default, wider on tablet
 * (iPad-friendly) without stretching to a full desktop dashboard.
 * Optional falling-tile atmosphere sits behind content and never captures taps.
 */
export function AppShell({
  children,
  atmosphere = 'dimmed',
}: AppShellProps) {
  const isHero = atmosphere === 'hero'
  const showTiles = atmosphere === 'hero' || atmosphere === 'dimmed'

  const atmosphereClass =
    atmosphere === 'hero'
      ? 'app-shell-atmosphere-hero'
      : atmosphere === 'dimmed'
        ? 'app-shell-atmosphere-dimmed'
        : 'bg-surface text-ink'

  return (
    <div
      className={[
        'relative isolate min-h-svh overflow-hidden',
        atmosphereClass,
      ].join(' ')}
    >
      {showTiles ? (
        <FallingTilesBackdrop intensity={isHero ? 'hero' : 'dimmed'} />
      ) : null}

      <div
        className={[
          'relative z-10 mx-auto flex min-h-svh w-full flex-col',
          'max-w-lg px-4 py-8',
          'md:max-w-2xl md:px-8 md:py-10',
          'lg:max-w-3xl',
          isHero ? 'justify-center' : '',
        ].join(' ')}
      >
        {children}
      </div>
    </div>
  )
}
