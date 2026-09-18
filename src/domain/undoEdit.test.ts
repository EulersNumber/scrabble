import { describe, expect, it } from 'vitest'
import { createGame } from './createGame'
import { editTurn } from './editTurn'
import { DomainError } from './errors'
import { getStandings } from './standings'
import { recordTurn } from './recordTurn'
import { undoLastTurn } from './undoLastTurn'

function playerIds(game: ReturnType<typeof createGame>) {
  return game.players.map((player) => player.id)
}

describe('undoLastTurn', () => {
  it('removes the last turn and restores the suggested current player', () => {
    const game = createGame(['Aino', 'Matti', 'Liisa'])
    const [aino, matti, liisa] = playerIds(game)

    const afterAino = recordTurn(game, { playerId: aino!, score: 10 })
    const afterMatti = recordTurn(afterAino, { playerId: matti!, score: 7 })
    expect(afterMatti.currentPlayerId).toBe(liisa)

    const undone = undoLastTurn(afterMatti)

    expect(undone.turns).toHaveLength(1)
    expect(undone.turns[0]?.playerId).toBe(aino)
    expect(undone.currentPlayerId).toBe(matti)
    expect(getStandings(undone).map((entry) => entry.total)).toEqual([10, 0, 0])
    expect(afterMatti.turns).toHaveLength(2)
  })

  it('restores the first player when undoing the only turn', () => {
    const game = createGame(['Aino', 'Matti'])
    const [aino, matti] = playerIds(game)

    const afterAino = recordTurn(game, { playerId: aino!, score: 5 })
    expect(afterAino.currentPlayerId).toBe(matti)

    const undone = undoLastTurn(afterAino)

    expect(undone.turns).toHaveLength(0)
    expect(undone.currentPlayerId).toBe(aino)
  })

  it('restores suggested current after undoing a non-suggested player turn', () => {
    const game = createGame(['Aino', 'Matti', 'Liisa'])
    const [aino, , liisa] = playerIds(game)

    // Suggested is Aino; log Liisa instead → suggested becomes Aino again.
    const afterLiisa = recordTurn(game, { playerId: liisa!, score: 8 })
    expect(afterLiisa.currentPlayerId).toBe(aino)

    const undone = undoLastTurn(afterLiisa)

    expect(undone.turns).toHaveLength(0)
    expect(undone.currentPlayerId).toBe(aino)
  })

  it('rejects undo when there are no turns', () => {
    const game = createGame(['Aino', 'Matti'])

    expect(() => undoLastTurn(game)).toThrow(DomainError)
  })

  it('only removes the last turn, leaving earlier turns intact', () => {
    const game = createGame(['Aino', 'Matti', 'Liisa'])
    const [aino, matti, liisa] = playerIds(game)

    let next = recordTurn(game, { playerId: aino!, score: 10, word: 'kissa' })
    next = recordTurn(next, { playerId: matti!, score: 7 })
    next = recordTurn(next, { playerId: liisa!, score: 4 })

    const undone = undoLastTurn(next)

    expect(undone.turns.map((turn) => turn.score)).toEqual([10, 7])
    expect(undone.turns[0]?.word).toBe('kissa')
  })
})

describe('editTurn', () => {
  it('edits a score so standings match the changed turns', () => {
    const game = createGame(['Aino', 'Matti'])
    const [aino, matti] = playerIds(game)

    let next = recordTurn(game, { playerId: aino!, score: 10 })
    next = recordTurn(next, { playerId: matti!, score: 5 })
    const firstTurnId = next.turns[0]!.id

    const edited = editTurn(next, firstTurnId, { playerId: aino!, score: 20 })

    expect(edited.turns[0]?.score).toBe(20)
    expect(getStandings(edited)).toEqual([
      { playerId: aino, name: 'Aino', total: 20, rank: 1 },
      { playerId: matti, name: 'Matti', total: 5, rank: 2 },
    ])
  })

  it('edits the player on a turn and updates standings', () => {
    const game = createGame(['Aino', 'Matti', 'Liisa'])
    const [aino, matti, liisa] = playerIds(game)

    let next = recordTurn(game, { playerId: aino!, score: 12, word: 'talo' })
    next = recordTurn(next, { playerId: matti!, score: 3 })
    const firstTurnId = next.turns[0]!.id

    const edited = editTurn(next, firstTurnId, {
      playerId: liisa!,
      score: 12,
      word: 'talo',
    })

    expect(edited.turns[0]?.playerId).toBe(liisa)
    expect(edited.turns[0]?.word).toBe('talo')
    expect(getStandings(edited)).toEqual([
      { playerId: liisa, name: 'Liisa', total: 12, rank: 1 },
      { playerId: matti, name: 'Matti', total: 3, rank: 2 },
      { playerId: aino, name: 'Aino', total: 0, rank: 3 },
    ])
  })

  it('updates suggested current when the last turn player changes', () => {
    const game = createGame(['Aino', 'Matti', 'Liisa'])
    const [aino, matti, liisa] = playerIds(game)

    const afterAino = recordTurn(game, { playerId: aino!, score: 5 })
    expect(afterAino.currentPlayerId).toBe(matti)

    const lastTurnId = afterAino.turns[0]!.id
    const edited = editTurn(afterAino, lastTurnId, { playerId: liisa!, score: 5 })

    expect(edited.currentPlayerId).toBe(aino)
  })

  it('rejects an unknown turn', () => {
    const game = createGame(['Aino', 'Matti'])
    const [aino] = playerIds(game)
    const next = recordTurn(game, { playerId: aino!, score: 4 })

    expect(() =>
      editTurn(next, 'missing-turn', { playerId: aino!, score: 8 }),
    ).toThrow(DomainError)
  })

  it('rejects an unknown player and non-integer scores', () => {
    const game = createGame(['Aino', 'Matti'])
    const [aino] = playerIds(game)
    const next = recordTurn(game, { playerId: aino!, score: 4 })
    const turnId = next.turns[0]!.id

    expect(() =>
      editTurn(next, turnId, { playerId: 'missing', score: 8 }),
    ).toThrow(DomainError)
    expect(() => editTurn(next, turnId, { playerId: aino!, score: 1.5 })).toThrow(
      DomainError,
    )
  })

  it('clears the word when edited to empty', () => {
    const game = createGame(['Aino', 'Matti'])
    const [aino] = playerIds(game)
    const next = recordTurn(game, { playerId: aino!, score: 4, word: 'kissa' })
    const turnId = next.turns[0]!.id

    const edited = editTurn(next, turnId, { playerId: aino!, score: 4, word: '' })

    expect(edited.turns[0]?.word).toBeUndefined()
  })
})
