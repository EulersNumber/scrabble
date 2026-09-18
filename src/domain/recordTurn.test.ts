import { describe, expect, it } from 'vitest'
import { createGame } from './createGame'
import { DomainError } from './errors'
import { recordTurn } from './recordTurn'

function playerIds(game: ReturnType<typeof createGame>) {
  return game.players.map((player) => player.id)
}

describe('recordTurn', () => {
  it('appends a turn for the suggested player and advances to the next seat', () => {
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

  it('allows recording a non-suggested player and advances from that player', () => {
    const game = createGame(['Aino', 'Matti', 'Liisa'])
    const [aino, , liisa] = playerIds(game)

    const next = recordTurn(game, { playerId: liisa!, score: 8 })

    expect(next.turns[0]?.playerId).toBe(liisa)
    expect(next.currentPlayerId).toBe(aino)
  })

  it('wraps the suggested player after the last seat', () => {
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
