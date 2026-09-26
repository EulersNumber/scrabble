import { describe, expect, it } from 'vitest'
import type { Game } from '../domain'
import {
  formatGameCreatedAt,
  formatPlayerNames,
  listInProgressGamesNewestFirst,
} from './gameList'

function game(partial: Partial<Game> & Pick<Game, 'id' | 'status' | 'createdAt'>): Game {
  return {
    finishedAt: partial.status === 'finished' ? partial.finishedAt ?? partial.createdAt : null,
    players: partial.players ?? [
      { id: 'p1', name: 'Aino' },
      { id: 'p2', name: 'Berit' },
    ],
    turns: partial.turns ?? [],
    currentPlayerId: partial.currentPlayerId ?? 'p1',
    ...partial,
  }
}

describe('listInProgressGamesNewestFirst', () => {
  it('keeps only in-progress games and sorts newest first', () => {
    const older = game({
      id: 'older',
      status: 'in_progress',
      createdAt: '2026-01-01T10:00:00.000Z',
    })
    const newer = game({
      id: 'newer',
      status: 'in_progress',
      createdAt: '2026-01-02T10:00:00.000Z',
    })
    const finished = game({
      id: 'done',
      status: 'finished',
      createdAt: '2026-01-03T10:00:00.000Z',
      finishedAt: '2026-01-03T12:00:00.000Z',
    })

    expect(listInProgressGamesNewestFirst([older, finished, newer])).toEqual([
      newer,
      older,
    ])
  })

  it('returns an empty list when nothing is in progress', () => {
    const finished = game({
      id: 'done',
      status: 'finished',
      createdAt: '2026-01-03T10:00:00.000Z',
      finishedAt: '2026-01-03T12:00:00.000Z',
    })
    expect(listInProgressGamesNewestFirst([finished])).toEqual([])
  })
})

describe('formatPlayerNames', () => {
  it('joins seating-order names with commas', () => {
    const g = game({
      id: 'g1',
      status: 'in_progress',
      createdAt: '2026-01-01T10:00:00.000Z',
      players: [
        { id: 'p1', name: 'Aino' },
        { id: 'p2', name: 'Berit' },
        { id: 'p3', name: 'Cecilia' },
      ],
    })
    expect(formatPlayerNames(g)).toBe('Aino, Berit, Cecilia')
  })
})

describe('formatGameCreatedAt', () => {
  it('returns a Finnish locale string for a valid ISO timestamp', () => {
    const formatted = formatGameCreatedAt('2026-01-15T14:30:00.000Z')
    expect(formatted.length).toBeGreaterThan(0)
    expect(formatted).not.toBe('2026-01-15T14:30:00.000Z')
  })

  it('returns the raw value when the timestamp is invalid', () => {
    expect(formatGameCreatedAt('not-a-date')).toBe('not-a-date')
  })
})
