/**
 * Pure helpers for ambient falling Scrabble-tile visuals (T7.1 / P2 / P10).
 *
 * Specs are deterministic so React remounts do not reshuffle the field.
 * Motion (CSS keyframes) lives in the FallingTilesBackdrop primitive; this
 * module only defines geometry and timing. Fall and spin stay slow so tiles
 * read as background atmosphere, not a focal animation.
 */

/** Finnish Scrabble-ish letter faces used for ambient decoration (not scoring). */
export const FALLING_TILE_LETTERS = [
  'A',
  'E',
  'I',
  'K',
  'L',
  'N',
  'O',
  'R',
  'S',
  'T',
  'U',
  'Ä',
  'Ö',
  'M',
  'P',
  'H',
  'V',
  'J',
] as const

export type AtmosphereIntensity = 'hero' | 'dimmed'

export type FallingTileSpec = {
  id: string
  letter: string
  /** Horizontal position as percent of the backdrop width (0–100). */
  xPercent: number
  /** Full fall duration in seconds (slow — ambient backdrop). */
  fallDurationSec: number
  /** Stagger delay before the first fall cycle (seconds). */
  delaySec: number
  /** Full Y-axis spin period in seconds (variable; typically slow). */
  spinDurationSec: number
  /** Tile edge length in rem. */
  sizeRem: number
  /** Slight Z tilt for a natural look (degrees). */
  tiltDeg: number
  /** Static top position (%) when motion is reduced. */
  staticTopPercent: number
  /** Static Y rotation (degrees) when motion is reduced — some faces, some backs. */
  staticSpinDeg: number
}

const HERO_COUNT = 12
const DIMMED_COUNT = 9

/**
 * Build a fixed set of falling-tile specs for the given atmosphere intensity.
 *
 * Hero tiles are larger and slightly denser; dimmed uses a thinner field.
 * Fall (~40–75s) and spin (~25–80s, variable per tile) stay intentionally slow.
 *
 * @param intensity - `hero` for home brand; `dimmed` for other screens
 * @returns Deterministic tile specs for CSS custom properties
 */
export function buildFallingTileSpecs(
  intensity: AtmosphereIntensity,
): FallingTileSpec[] {
  const count = intensity === 'hero' ? HERO_COUNT : DIMMED_COUNT
  const sizeBase = intensity === 'hero' ? 3.75 : 3.25
  const sizeSpread = intensity === 'hero' ? 1.4 : 1.0

  const specs: FallingTileSpec[] = []
  for (let i = 0; i < count; i += 1) {
    const t = i / Math.max(count - 1, 1)
    const letter = FALLING_TILE_LETTERS[i % FALLING_TILE_LETTERS.length]!
    // Spread across width with a mild zig-zag so columns do not stack.
    const xPercent = ((i * 37 + 11) % 88) + 4
    // Slow drift: roughly 45–78 seconds for a full viewport fall.
    const fallDurationSec = 45 + ((i * 7) % 22) + t * 8
    const delaySec = ((i * 3.1) % 28) - 4
    // Variable spin: some almost drift, others turn a bit sooner (25–80s).
    const spinDurationSec = 25 + ((i * 11) % 36) + ((i * 5) % 19)
    const sizeRem = sizeBase + ((i * 17) % 11) * 0.1 * sizeSpread
    const tiltDeg = ((i * 13) % 17) - 8
    const staticTopPercent = 8 + ((i * 23) % 72)
    // Alternate facing so reduced-motion still shows letter and blank backs.
    const staticSpinDeg = i % 3 === 0 ? 180 : i % 3 === 1 ? 35 : 0

    specs.push({
      id: `tile-${intensity}-${i}`,
      letter,
      xPercent,
      fallDurationSec: Math.round(fallDurationSec * 10) / 10,
      delaySec: Math.round(delaySec * 10) / 10,
      spinDurationSec: Math.round(spinDurationSec * 10) / 10,
      sizeRem: Math.round(sizeRem * 100) / 100,
      tiltDeg,
      staticTopPercent,
      staticSpinDeg,
    })
  }
  return specs
}
