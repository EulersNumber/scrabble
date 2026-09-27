/**
 * Pure helpers for ambient falling Scrabble-tile visuals (T7.1 / P2 / P10).
 *
 * Specs are deterministic so React remounts do not reshuffle the field.
 * Motion (CSS keyframes) lives in the FallingTilesBackdrop primitive; this
 * module only defines geometry and timing.
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
  /** Full fall duration in seconds. */
  fallDurationSec: number
  /** Stagger delay before the first fall cycle (seconds). */
  delaySec: number
  /** Full Y-axis spin period in seconds. */
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

const HERO_COUNT = 16
const DIMMED_COUNT = 10

/**
 * Build a fixed set of falling-tile specs for the given atmosphere intensity.
 *
 * Hero uses more and slightly larger tiles; dimmed uses a thinner field so
 * scorepad controls stay readable.
 *
 * @param intensity - `hero` for home brand; `dimmed` for other screens
 * @returns Deterministic tile specs for CSS custom properties
 */
export function buildFallingTileSpecs(
  intensity: AtmosphereIntensity,
): FallingTileSpec[] {
  const count = intensity === 'hero' ? HERO_COUNT : DIMMED_COUNT
  const sizeBase = intensity === 'hero' ? 2.35 : 1.85
  const sizeSpread = intensity === 'hero' ? 0.85 : 0.55

  const specs: FallingTileSpec[] = []
  for (let i = 0; i < count; i += 1) {
    const t = i / Math.max(count - 1, 1)
    const letter = FALLING_TILE_LETTERS[i % FALLING_TILE_LETTERS.length]!
    // Spread across width with a mild zig-zag so columns do not stack.
    const xPercent = ((i * 37 + 11) % 94) + 3
    const fallDurationSec = 14 + ((i * 5) % 9) + t * 2
    const delaySec = ((i * 1.7) % 12) - 2
    const spinDurationSec = 9 + ((i * 3) % 7)
    const sizeRem = sizeBase + ((i * 17) % 10) * 0.01 * sizeSpread * 10
    const tiltDeg = ((i * 13) % 17) - 8
    const staticTopPercent = 8 + ((i * 23) % 72)
    // Alternate facing so reduced-motion still shows letter and blank backs.
    const staticSpinDeg = i % 3 === 0 ? 180 : i % 3 === 1 ? 35 : 0

    specs.push({
      id: `tile-${intensity}-${i}`,
      letter,
      xPercent,
      fallDurationSec,
      delaySec,
      spinDurationSec,
      sizeRem: Math.round(sizeRem * 100) / 100,
      tiltDeg,
      staticTopPercent,
      staticSpinDeg,
    })
  }
  return specs
}
