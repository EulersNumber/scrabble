import { describe, expect, it } from 'vitest'
import {
  FALLING_TILE_LETTERS,
  buildFallingTileSpecs,
} from './fallingTiles'

describe('buildFallingTileSpecs', () => {
  it('returns a denser hero field than dimmed', () => {
    const hero = buildFallingTileSpecs('hero')
    const dimmed = buildFallingTileSpecs('dimmed')
    expect(hero.length).toBeGreaterThan(dimmed.length)
    expect(hero.length).toBeGreaterThanOrEqual(10)
    expect(dimmed.length).toBeGreaterThanOrEqual(6)
  })

  it('is deterministic across calls', () => {
    expect(buildFallingTileSpecs('hero')).toEqual(buildFallingTileSpecs('hero'))
    expect(buildFallingTileSpecs('dimmed')).toEqual(
      buildFallingTileSpecs('dimmed'),
    )
  })

  it('keeps tiles large with slow, variable fall and spin timings', () => {
    const hero = buildFallingTileSpecs('hero')
    const spinSet = new Set(hero.map((tile) => tile.spinDurationSec))
    expect(spinSet.size).toBeGreaterThan(1)

    for (const intensity of ['hero', 'dimmed'] as const) {
      for (const tile of buildFallingTileSpecs(intensity)) {
        expect(tile.xPercent).toBeGreaterThanOrEqual(0)
        expect(tile.xPercent).toBeLessThanOrEqual(100)
        expect(tile.fallDurationSec).toBeGreaterThanOrEqual(40)
        expect(tile.spinDurationSec).toBeGreaterThanOrEqual(20)
        expect(tile.sizeRem).toBeGreaterThanOrEqual(3)
        expect(tile.staticTopPercent).toBeGreaterThanOrEqual(0)
        expect(tile.staticTopPercent).toBeLessThanOrEqual(100)
        expect(FALLING_TILE_LETTERS).toContain(tile.letter)
      }
    }
  })

  it('includes both letter-forward and back-facing static spins', () => {
    const spins = new Set(
      buildFallingTileSpecs('hero').map((tile) => tile.staticSpinDeg),
    )
    expect(spins.has(0)).toBe(true)
    expect(spins.has(180)).toBe(true)
  })
})
