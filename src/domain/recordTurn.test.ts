import { describe, expect, it } from 'vitest'
import { createGame } from './createGame'
import { DomainError } from './errors'
import { getStandings } from './standings'
import { recordTurn } from './recordTurn'
import type { Game, Turn } from './types'

function playerIds(game: ReturnType<typeof createGame>) {
  return game.players.map((player) => player.id)
}

describe('recordTurn', () => {
  it('appends a turn for the current player and advances to the next seat', () => {
    const game = createGame(['Aino', 'Matti', 'Liisa'])
    const [aino, matti] = playerIds(game)

    const next = recordTurn(game, { playerId: aino!, score: 12, word: 'kissa' })
    const turn = next.turns[0]

    expect(next.turns).toHaveLength(1)
    expect(turn).toMatchObject({
      playerId: aino,
      score: 12,
      word: 'kissa',
      sequence: 0,
    })
    expect(turn?.id).toBeTruthy()
    expect(turn?.createdAt).toBeTruthy()
    expect(next.currentPlayerId).toBe(matti)
    expect(game.turns).toHaveLength(0)
    expect(game.currentPlayerId).toBe(aino)
  })

  it('rejects a seated player who is not current', () => {
    const game = createGame(['Aino', 'Matti', 'Liisa'])
    const [, matti, liisa] = playerIds(game)

    expect(() => recordTurn(game, { playerId: liisa!, score: 8 })).toThrow(DomainError)
    expect(() => recordTurn(game, { playerId: matti!, score: 8 })).toThrow(
      "It is not this player's turn",
    )
    expect(game.turns).toHaveLength(0)
    expect(game.currentPlayerId).toBe(playerIds(game)[0])
  })

  it('keeps legacy off-rotation history readable and still requires the current player', () => {
    const game = createGame(['Aino', 'Matti', 'Liisa'])
    const [aino, matti, liisa] = playerIds(game)
    const legacy = withTurn(game, liisa!, 9, aino!)

    expect(getStandings(legacy).find((entry) => entry.playerId === liisa)?.total).toBe(
      9,
    )
    expect(() => recordTurn(legacy, { playerId: liisa!, score: 4 })).toThrow(
      "It is not this player's turn",
    )

    const next = recordTurn(legacy, { playerId: aino!, score: 4 })

    expect(next.turns.map((turn) => turn.playerId)).toEqual([liisa, aino])
    expect(next.currentPlayerId).toBe(matti)
  })

  it('wraps the current player after the last seat', () => {
    const game = createGame(['Aino', 'Matti'])
    const [aino, matti] = playerIds(game)

    const afterAino = recordTurn(game, { playerId: aino!, score: 5 })
    const afterMatti = recordTurn(afterAino, { playerId: matti!, score: 7 })

    expect(afterAino.currentPlayerId).toBe(matti)
    expect(afterMatti.currentPlayerId).toBe(aino)
    expect(afterMatti.turns.map((turn) => turn.sequence)).toEqual([0, 1])
  })

  it('rejects an unknown player', () => {
    const game = createGame(['Aino', 'Matti'])

    expect(() => recordTurn(game, { playerId: 'missing', score: 10 })).toThrow(
      DomainError,
    )
  })

  it('allows a missing or empty word', () => {
    const game = createGame(['Aino', 'Matti'])
    const [aino, matti] = playerIds(game)

    const withoutWord = recordTurn(game, { playerId: aino!, score: 4 })
    const emptyWord = recordTurn(withoutWord, { playerId: matti!, score: 3, word: '' })

    expect(withoutWord.turns[0]?.word).toBeUndefined()
    expect(emptyWord.turns[1]?.word).toBeUndefined()
  })

  it('allows zero and negative integer scores', () => {
    const game = createGame(['Aino', 'Matti'])
    const [aino, matti] = playerIds(game)

    const passed = recordTurn(game, { playerId: aino!, score: 0 })
    const corrected = recordTurn(passed, { playerId: matti!, score: -5 })

    expect(passed.turns[0]?.score).toBe(0)
    expect(corrected.turns[1]?.score).toBe(-5)
  })

  it('rejects non-integer scores', () => {
    const game = createGame(['Aino', 'Matti'])
    const [aino] = playerIds(game)

    expect(() => recordTurn(game, { playerId: aino!, score: 1.5 })).toThrow(DomainError)
    expect(() => recordTurn(game, { playerId: aino!, score: Number.NaN })).toThrow(
      DomainError,
    )
    expect(() =>
      recordTurn(game, { playerId: aino!, score: Number.POSITIVE_INFINITY }),
    ).toThrow(DomainError)
  })
})

/** Saved-game shape from the soft-rotation era: history need not match seats. */
function withTurn(
  game: Game,
  turnPlayerId: string,
  score: number,
  currentPlayerId: string,
): Game {
  const turn: Turn = {
    id: 'legacy-turn',
    playerId: turnPlayerId,
    score,
    createdAt: '2026-01-01T00:00:00.000Z',
    sequence: 0,
  }
  return {
    ...game,
    turns: [turn],
    currentPlayerId,
  }
}
