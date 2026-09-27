import { describe, expect, it } from 'vitest'
import {
  FALLING_TILE_LETTERS,
  FINNISH_TILE_POINTS,
  buildFallingTileSpecs,
  finnishTilePoints,
} from './fallingTiles'

describe('finnishTilePoints', () => {
  it('matches Finnish Scrabble face values for common letters', () => {
    expect(finnishTilePoints('A')).toBe(1)
    expect(finnishTilePoints('K')).toBe(2)
    expect(finnishTilePoints('Ä')).toBe(2)
    expect(finnishTilePoints('Ö')).toBe(7)
    expect(finnishTilePoints('C')).toBe(10)
    expect(finnishTilePoints('r')).toBe(4)
  })

  it('covers every ambient falling-tile letter', () => {
    for (const letter of FALLING_TILE_LETTERS) {
      expect(FINNISH_TILE_POINTS[letter]).toBeTypeOf('number')
      expect(finnishTilePoints(letter)).toBe(FINNISH_TILE_POINTS[letter])
    }
  })
})

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

  it('uses near/far depth with faster spin and Finnish points', () => {
    const hero = buildFallingTileSpecs('hero')
    const spinSet = new Set(hero.map((tile) => tile.spinDurationSec))
    const depthSet = new Set(hero.map((tile) => tile.depth))
    const sizes = hero.map((tile) => tile.sizeRem)
    expect(spinSet.size).toBeGreaterThan(1)
    expect(depthSet.size).toBeGreaterThan(1)
    expect(Math.max(...sizes)).toBeGreaterThan(Math.min(...sizes))

    for (const intensity of ['hero', 'dimmed'] as const) {
      for (const tile of buildFallingTileSpecs(intensity)) {
        expect(tile.xPercent).toBeGreaterThanOrEqual(0)
        expect(tile.xPercent).toBeLessThanOrEqual(100)
        expect(tile.fallDurationSec).toBeGreaterThanOrEqual(25)
        expect(tile.fallDurationSec).toBeLessThan(55)
        expect(tile.spinDurationSec).toBeGreaterThanOrEqual(6)
        expect(tile.spinDurationSec).toBeLessThan(20)
        expect(tile.sizeRem).toBeGreaterThanOrEqual(2.5)
        expect(tile.depth).toBeGreaterThanOrEqual(0)
        expect(tile.depth).toBeLessThanOrEqual(1)
        expect(tile.points).toBe(finnishTilePoints(tile.letter))
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
