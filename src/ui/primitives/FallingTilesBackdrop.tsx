import type { CSSProperties } from 'react'
import { buildFallingTileSpecs, type AtmosphereIntensity } from '../fallingTiles'

type FallingTilesBackdropProps = {
  /** Home uses prominent tiles; other screens push them back (T7.1 / P2). */
  intensity: AtmosphereIntensity
}

/**
 * Ambient Scrabble-tile field that falls and spins (T7.1 / P2).
 *
 * Each tile is a thick CSS 3D box (square faces + sides) so mid-spin it still
 * reads as a physical tile, not a flat card. Specs from `buildFallingTileSpecs`.
 * `pointer-events-none`; reduced-motion → static faces/backs.
 */
export function FallingTilesBackdrop({ intensity }: FallingTilesBackdropProps) {
  const tiles = buildFallingTileSpecs(intensity)

  return (
    <div
      className={
        intensity === 'hero'
          ? 'falling-tiles falling-tiles-hero'
          : 'falling-tiles falling-tiles-dimmed'
      }
      aria-hidden="true"
    >
      {tiles.map((tile) => (
        <div
          key={tile.id}
          className="falling-tile"
          style={
            {
              '--tile-x': tile.xPercent,
              '--tile-fall-dur': `${tile.fallDurationSec}s`,
              '--tile-delay': `${tile.delaySec}s`,
              '--tile-spin-dur': `${tile.spinDurationSec}s`,
              '--tile-size': tile.sizeRem,
              '--tile-depth': tile.depth,
              '--tile-tilt': `${tile.tiltDeg}deg`,
              '--tile-static-top': `${tile.staticTopPercent}%`,
              '--tile-static-spin': `${tile.staticSpinDeg}deg`,
            } as CSSProperties
          }
        >
          <div className="falling-tile-tilt">
            <div className="falling-tile-inner">
              <div className="falling-tile-face falling-tile-face-front">
                <span className="falling-tile-letter">{tile.letter}</span>
                <span className="falling-tile-points">{tile.points}</span>
              </div>
              <div className="falling-tile-face falling-tile-face-back" />
              <div className="falling-tile-side falling-tile-side-left" />
              <div className="falling-tile-side falling-tile-side-right" />
              <div className="falling-tile-side falling-tile-side-top" />
              <div className="falling-tile-side falling-tile-side-bottom" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
