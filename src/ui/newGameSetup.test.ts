import { describe, expect, it } from 'vitest'
import type { Game } from '../domain'
import {
  aggregateNameSuggestionStats,
  collectFilledNames,
  orderNamesWithStarterFirst,
  suggestPlayerNames,
  validateNewGameNames,
} from './newGameSetup'

function game(
  partial: Partial<Game> &
    Pick<Game, 'id' | 'createdAt'> & { players: Game['players'] },
): Game {
  return {
    status: 'finished',
    finishedAt: partial.createdAt,
    turns: [],
    currentPlayerId: partial.players[0]?.id ?? 'p1',
    ...partial,
  }
}

describe('collectFilledNames', () => {
  it('trims and drops blank slots', () => {
    expect(collectFilledNames(['  Aino ', '', 'Berit', '   '])).toEqual([
      'Aino',
      'Berit',
    ])
  })
})

describe('validateNewGameNames', () => {
  it('accepts 2–4 unique names', () => {
    expect(validateNewGameNames(['Aino', 'Berit'])).toEqual({
      ok: true,
      names: ['Aino', 'Berit'],
    })
    expect(validateNewGameNames(['A', 'B', 'C', 'D'])).toEqual({
      ok: true,
      names: ['A', 'B', 'C', 'D'],
    })
  })

  it('rejects too few, too many, and case-insensitive duplicates', () => {
    expect(validateNewGameNames(['Aino', ''])).toEqual({
      ok: false,
      reason: 'too_few',
    })
    expect(validateNewGameNames(['A', 'B', 'C', 'D', 'E'])).toEqual({
      ok: false,
      reason: 'too_many',
    })
    expect(validateNewGameNames(['Aino', 'aino'])).toEqual({
      ok: false,
      reason: 'duplicate',
    })
  })
})

describe('orderNamesWithStarterFirst', () => {
  it('rotates seating so the starter is first and others keep relative order', () => {
    expect(orderNamesWithStarterFirst(['Aino', 'Berit', 'Cecilia'], 0)).toEqual(
      ['Aino', 'Berit', 'Cecilia'],
    )
    expect(orderNamesWithStarterFirst(['Aino', 'Berit', 'Cecilia'], 1)).toEqual(
      ['Berit', 'Cecilia', 'Aino'],
    )
    expect(orderNamesWithStarterFirst(['Aino', 'Berit', 'Cecilia'], 2)).toEqual(
      ['Cecilia', 'Aino', 'Berit'],
    )
  })

  it('rejects an empty list or out-of-range starter', () => {
    expect(() => orderNamesWithStarterFirst([], 0)).toThrow(RangeError)
    expect(() => orderNamesWithStarterFirst(['Aino', 'Berit'], 2)).toThrow(
      RangeError,
    )
  })
})

describe('suggestPlayerNames', () => {
  it('returns empty suggestions when history is empty', () => {
    expect(suggestPlayerNames([])).toEqual([])
  })

  it('aggregates play counts and prefers newest spelling', () => {
    const older = game({
      id: 'g1',
      createdAt: '2026-01-01T10:00:00.000Z',
      players: [
        { id: 'p1', name: 'aino' },
        { id: 'p2', name: 'Berit' },
      ],
    })
    const newer = game({
      id: 'g2',
      createdAt: '2026-02-01T10:00:00.000Z',
      players: [
        { id: 'p3', name: 'Aino' },
        { id: 'p4', name: 'Dag' },
      ],
    })

    const stats = aggregateNameSuggestionStats([older, newer])
    const aino = stats.find((row) => row.displayName === 'Aino')
    expect(aino).toMatchObject({
      displayName: 'Aino',
      playCount: 2,
      lastSeenAt: '2026-02-01T10:00:00.000Z',
    })
    expect(stats.find((row) => row.displayName === 'Berit')?.playCount).toBe(1)
  })

  it('interleaves recent and frequent names', () => {
    // Frequent: Aino in three games. Recent-only: Dag only in newest.
    // Middle: Berit in two older games.
    const games = [
      game({
        id: 'g1',
        createdAt: '2026-01-01T00:00:00.000Z',
        players: [
          { id: 'a', name: 'Aino' },
          { id: 'b', name: 'Berit' },
        ],
      }),
      game({
        id: 'g2',
        createdAt: '2026-02-01T00:00:00.000Z',
        players: [
          { id: 'a', name: 'Aino' },
          { id: 'b', name: 'Berit' },
        ],
      }),
      game({
        id: 'g3',
        createdAt: '2026-03-01T00:00:00.000Z',
        players: [
          { id: 'a', name: 'Aino' },
          { id: 'd', name: 'Dag' },
        ],
      }),
    ]

    // Recent: Aino, Dag, Berit. Frequent: Aino, Berit, Dag.
    // Interleave unique: Aino (recent), Dag (recent next), Berit (frequent).
    expect(suggestPlayerNames(games, 3)).toEqual(['Aino', 'Dag', 'Berit'])
  })

  it('respects the suggestion limit', () => {
    const games = [
      game({
        id: 'g1',
        createdAt: '2026-01-01T00:00:00.000Z',
        players: [
          { id: '1', name: 'A' },
          { id: '2', name: 'B' },
          { id: '3', name: 'C' },
          { id: '4', name: 'D' },
        ],
      }),
    ]
    expect(suggestPlayerNames(games, 2)).toHaveLength(2)
  })
})
