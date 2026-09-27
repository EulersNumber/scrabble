import type { CSSProperties } from 'react'
import { buildFallingTileSpecs, type AtmosphereIntensity } from '../fallingTiles'

type FallingTilesBackdropProps = {
  /** Home uses prominent tiles; other screens push them back (T7.1 / P2). */
  intensity: AtmosphereIntensity
}

/**
 * Ambient Scrabble-tile field that falls and spins (T7.1 / P2).
 *
 * CSS/DOM driven (no canvas/WebGL): square faces with Finnish point values,
 * bevelled “well”, Z-tilt, and near/far size. Specs come from
 * `buildFallingTileSpecs`. The layer is `pointer-events-none`. When
 * `prefers-reduced-motion: reduce`, tiles stay static with mixed faces/backs.
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
          {/* Tilt wrapper keeps the face square; spin lives on the inner cube. */}
          <div className="falling-tile-tilt">
            <div className="falling-tile-inner">
              <div className="falling-tile-face falling-tile-face-front">
                <span className="falling-tile-letter">{tile.letter}</span>
                <span className="falling-tile-points">{tile.points}</span>
              </div>
              <div className="falling-tile-face falling-tile-face-back" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
