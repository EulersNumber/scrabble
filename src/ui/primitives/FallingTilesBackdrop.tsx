import type { CSSProperties } from 'react'
import { buildFallingTileSpecs, type AtmosphereIntensity } from '../fallingTiles'

type FallingTilesBackdropProps = {
  /** Home uses prominent tiles; other screens push them back (T7.1 / P2). */
  intensity: AtmosphereIntensity
}

/**
 * Ambient Scrabble-tile field that falls and slowly spins (T7.1 / P2).
 *
 * CSS/DOM driven (no canvas/WebGL): each tile is positioned and timed from
 * `buildFallingTileSpecs`. The layer is `pointer-events-none` so it never
 * blocks taps. When `prefers-reduced-motion: reduce`, tiles stay static with
 * a mix of letter faces and blanks.
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
              '--tile-tilt': `${tile.tiltDeg}deg`,
              '--tile-static-top': `${tile.staticTopPercent}%`,
              '--tile-static-spin': `${tile.staticSpinDeg}deg`,
            } as CSSProperties
          }
        >
          <div className="falling-tile-inner">
            <div className="falling-tile-face falling-tile-face-front">
              <span className="falling-tile-letter">{tile.letter}</span>
            </div>
            <div className="falling-tile-face falling-tile-face-back" />
          </div>
        </div>
      ))}
    </div>
  )
}
