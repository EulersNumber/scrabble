import { describe, expect, it } from 'vitest'
import { createGame } from './createGame'
import { recordTurn } from './recordTurn'
import { getStandings } from './standings'
import type { Game, Turn } from './types'

function playerIds(game: ReturnType<typeof createGame>) {
  return game.players.map((player) => player.id)
}

describe('getStandings', () => {
  it('totals equal the sum of each player\'s turn scores', () => {
    const game = createGame(['Aino', 'Matti', 'Liisa'])
    const [aino, matti, liisa] = playerIds(game)

    let next = recordTurn(game, { playerId: aino!, score: 10 })
    next = recordTurn(next, { playerId: matti!, score: 7 })
    next = recordTurn(next, { playerId: liisa!, score: 4 })
    next = recordTurn(next, { playerId: aino!, score: 5 })
    next = recordTurn(next, { playerId: matti!, score: -2 })

    const standings = getStandings(next)

    expect(standings).toEqual([
      { playerId: aino, name: 'Aino', total: 15, rank: 1 },
      { playerId: matti, name: 'Matti', total: 5, rank: 2 },
      { playerId: liisa, name: 'Liisa', total: 4, rank: 3 },
    ])
  })

  it('gives total 0 to players with no turns', () => {
    const game = createGame(['Aino', 'Matti', 'Liisa'])
    const [aino, matti, liisa] = playerIds(game)

    const next = recordTurn(game, { playerId: aino!, score: 12 })
    const standings = getStandings(next)

    expect(standings).toEqual([
      { playerId: aino, name: 'Aino', total: 12, rank: 1 },
      { playerId: matti, name: 'Matti', total: 0, rank: 2 },
      { playerId: liisa, name: 'Liisa', total: 0, rank: 2 },
    ])
  })

  it('uses shared ranks on a tie and display order total then seating', () => {
    const game = createGame(['Aino', 'Matti', 'Liisa'])
    const [aino, matti, liisa] = playerIds(game)

    let next = recordTurn(game, { playerId: aino!, score: 20 })
    next = recordTurn(next, { playerId: matti!, score: 20 })
    next = recordTurn(next, { playerId: liisa!, score: 10 })

    const standings = getStandings(next)

    expect(standings).toEqual([
      { playerId: aino, name: 'Aino', total: 20, rank: 1 },
      { playerId: matti, name: 'Matti', total: 20, rank: 1 },
      { playerId: liisa, name: 'Liisa', total: 10, rank: 3 },
    ])
  })

  it('orders equal totals by original player order', () => {
    const game = createGame(['Aino', 'Matti', 'Liisa'])
    const [aino, matti, liisa] = playerIds(game)

    // Off-rotation history (readable after D36) so turn order is not seating order.
    const next = withTurns(game, [
      { playerId: liisa!, score: 8 },
      { playerId: matti!, score: 15 },
      { playerId: aino!, score: 8 },
    ])

    const standings = getStandings(next)

    expect(standings.map((entry) => entry.playerId)).toEqual([matti, aino, liisa])
    expect(standings.map((entry) => entry.rank)).toEqual([1, 2, 2])
  })

  it('returns all zeros and shared first place before any turns', () => {
    const game = createGame(['Aino', 'Matti'])
    const [aino, matti] = playerIds(game)

    expect(getStandings(game)).toEqual([
      { playerId: aino, name: 'Aino', total: 0, rank: 1 },
      { playerId: matti, name: 'Matti', total: 0, rank: 1 },
    ])
  })
})

function withTurns(
  game: Game,
  scores: readonly { playerId: string; score: number }[],
): Game {
  const turns: Turn[] = scores.map((entry, sequence) => ({
    id: `turn-${sequence}`,
    playerId: entry.playerId,
    score: entry.score,
    createdAt: '2026-01-01T00:00:00.000Z',
    sequence,
  }))
  return { ...game, turns }
}
