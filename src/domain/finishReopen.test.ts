import { describe, expect, it } from 'vitest'
import { createGame } from './createGame'
import { editTurn } from './editTurn'
import { DomainError } from './errors'
import { finishGame } from './finishGame'
import { recordTurn } from './recordTurn'
import { reopenGame } from './reopenGame'
import { undoLastTurn } from './undoLastTurn'

function playerIds(game: ReturnType<typeof createGame>) {
  return game.players.map((player) => player.id)
}

describe('finishGame', () => {
  it('sets status to finished and finishedAt', () => {
    const game = createGame(['Aino', 'Matti'])
    const [aino] = playerIds(game)
    const withTurn = recordTurn(game, { playerId: aino!, score: 10 })

    const finished = finishGame(withTurn)

    expect(finished.status).toBe('finished')
    expect(finished.finishedAt).toEqual(expect.any(String))
    expect(Date.parse(finished.finishedAt!)).not.toBeNaN()
    expect(finished.turns).toHaveLength(1)
    expect(withTurn.status).toBe('in_progress')
    expect(withTurn.finishedAt).toBeNull()
  })

  it('rejects finishing an already finished game', () => {
    const game = createGame(['Aino', 'Matti'])
    const finished = finishGame(game)

    expect(() => finishGame(finished)).toThrow(DomainError)
  })
})

describe('reopenGame', () => {
  it('returns a finished game to in_progress and clears finishedAt', () => {
    const game = createGame(['Aino', 'Matti'])
    const [aino] = playerIds(game)
    let next = recordTurn(game, { playerId: aino!, score: 8 })
    next = finishGame(next)

    const reopened = reopenGame(next)

    expect(reopened.status).toBe('in_progress')
    expect(reopened.finishedAt).toBeNull()
    expect(reopened.turns).toHaveLength(1)
  })

  it('rejects reopening an in-progress game', () => {
    const game = createGame(['Aino', 'Matti'])

    expect(() => reopenGame(game)).toThrow(DomainError)
  })
})

describe('mutations on finished games', () => {
  it('rejects record, edit, and undo until the game is reopened', () => {
    const game = createGame(['Aino', 'Matti'])
    const [aino, matti] = playerIds(game)
    let next = recordTurn(game, { playerId: aino!, score: 10 })
    const turnId = next.turns[0]!.id
    next = finishGame(next)

    expect(() => recordTurn(next, { playerId: matti!, score: 5 })).toThrow(DomainError)
    expect(() =>
      editTurn(next, turnId, { playerId: aino!, score: 12 }),
    ).toThrow(DomainError)
    expect(() => undoLastTurn(next)).toThrow(DomainError)

    const reopened = reopenGame(next)
    const afterRecord = recordTurn(reopened, { playerId: matti!, score: 5 })

    expect(afterRecord.status).toBe('in_progress')
    expect(afterRecord.turns).toHaveLength(2)
    expect(afterRecord.turns[1]?.score).toBe(5)
  })
})
