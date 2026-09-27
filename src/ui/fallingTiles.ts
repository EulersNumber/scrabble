/**
 * Pure helpers for ambient falling Scrabble-tile visuals (T7.1 / P2 / P10).
 *
 * Specs are deterministic so React remounts do not reshuffle the field.
 * Motion (CSS keyframes) lives in the FallingTilesBackdrop primitive; this
 * module only defines geometry, Finnish face values, and timing.
 */

/**
 * Finnish Scrabble letter point values (official distribution; decorative only —
 * the scorepad still uses manually entered turn scores).
 *
 * @see https://en.wikipedia.org/wiki/Scrabble_letter_distributions (Finnish)
 */
export const FINNISH_TILE_POINTS: Readonly<Record<string, number>> = {
  A: 1,
  B: 8,
  C: 10,
  D: 7,
  E: 1,
  F: 8,
  G: 8,
  H: 4,
  I: 1,
  J: 4,
  K: 2,
  L: 2,
  M: 3,
  N: 1,
  O: 2,
  P: 4,
  R: 4,
  S: 1,
  T: 1,
  U: 3,
  V: 4,
  W: 8,
  Y: 4,
  Ä: 2,
  Ö: 7,
}

/** Letters used on ambient tiles (subset of the Finnish set). */
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
  /** Face value from the Finnish Scrabble set. */
  points: number
  /** Horizontal position as percent of the backdrop width (0–100). */
  xPercent: number
  /** Full fall duration in seconds. */
  fallDurationSec: number
  /**
   * Fall animation delay (seconds). Negative = start a little below the top
   * (staggered initial Y in the top band).
   */
  delaySec: number
  /** Full Y-axis spin period in seconds (variable per tile). */
  spinDurationSec: number
  /**
   * Spin phase offset (typically negative) so letter faces are varied as soon
   * as a tile enters the viewport.
   */
  spinDelaySec: number
  /** Tile edge length in rem (near tiles larger than far). */
  sizeRem: number
  /**
   * Depth cue 0 (far) … 1 (near). Drives size and soft opacity so some tiles
   * read closer and others farther back.
   */
  depth: number
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
 * Look up the Finnish Scrabble point value for a letter face.
 *
 * @param letter - Single letter (case-insensitive); unknown → 0
 * @returns Face points for decorative tile rendering
 */
export function finnishTilePoints(letter: string): number {
  const key = letter.trim().toLocaleUpperCase('fi-FI')
  return FINNISH_TILE_POINTS[key] ?? 0
}

/**
 * Build a fixed set of falling-tile specs for the given atmosphere intensity.
 *
 * Hero tiles are denser; dimmed uses a thinner field. Tiles enter from near
 * the top at staggered heights (not all at once, not mid-screen). Spin is
 * phase-offset so letter faces vary. Size + depth vary for near/far.
 *
 * @param intensity - `hero` for home brand; `dimmed` for other screens
 * @returns Deterministic tile specs for CSS custom properties
 */
export function buildFallingTileSpecs(
  intensity: AtmosphereIntensity,
): FallingTileSpec[] {
  const count = intensity === 'hero' ? HERO_COUNT : DIMMED_COUNT
  const sizeFar = intensity === 'hero' ? 3.1 : 2.7
  const sizeNear = intensity === 'hero' ? 5.1 : 4.3

  const specs: FallingTileSpec[] = []
  for (let i = 0; i < count; i += 1) {
    const t = i / Math.max(count - 1, 1)
    const letter = FALLING_TILE_LETTERS[i % FALLING_TILE_LETTERS.length]!
    const points = finnishTilePoints(letter)
    // Spread across width with a mild zig-zag so columns do not stack.
    const xPercent = ((i * 37 + 11) % 88) + 4
    // Quicker fall (~12–22s).
    const fallDurationSec = 12 + ((i * 3) % 8) + t * 2
    /*
      Staggered start heights in the top band only (first ~0–18% of the fall).
      Negative delay = already a little way down from the top — different
      tiles at different Y, without spawning mid-screen.
    */
    const startPhase = 0.02 + (i / Math.max(count - 1, 1)) * 0.16
    const delaySec = -(startPhase * fallDurationSec)
    // Variable spin (~7–16s); phase-offset so faces are not all blank on entry.
    const spinDurationSec = 7 + ((i * 3) % 6) + ((i * 5) % 4)
    const spinDelaySec = -(((i * 3.1) % spinDurationSec) + 0.5)
    // Near/far depth: not uniform — some tiles closer, some back.
    const depth = ((i * 17) % 10) / 9
    const sizeRem = sizeFar + depth * (sizeNear - sizeFar)
    const tiltDeg = ((i * 13) % 17) - 8
    const staticTopPercent = 8 + ((i * 23) % 72)
    const staticSpinDeg = i % 3 === 0 ? 180 : i % 3 === 1 ? 35 : 0

    specs.push({
      id: `tile-${intensity}-${i}`,
      letter,
      points,
      xPercent,
      fallDurationSec: Math.round(fallDurationSec * 10) / 10,
      delaySec: Math.round(delaySec * 10) / 10,
      spinDurationSec: Math.round(spinDurationSec * 10) / 10,
      spinDelaySec: Math.round(spinDelaySec * 10) / 10,
      sizeRem: Math.round(sizeRem * 100) / 100,
      depth: Math.round(depth * 100) / 100,
      tiltDeg,
      staticTopPercent,
      staticSpinDeg,
    })
  }
  return specs
}
