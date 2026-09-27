import { describe, expect, it } from 'vitest'
import { DomainError, getStandings } from '../domain'
import {
  createLocalStorageGameStore,
  createMemoryStorage,
} from '../persistence'
import { createGame } from './createGame'
import { deleteGame } from './deleteGame'
import { editTurn } from './editTurn'
import { ApplicationError } from './errors'
import { finishGame } from './finishGame'
import { getGame } from './getGame'
import { listGames } from './listGames'
import { recordTurn } from './recordTurn'
import { reopenGame } from './reopenGame'
import { undoLastTurn } from './undoLastTurn'

function createTestStore() {
  return createLocalStorageGameStore(createMemoryStorage())
}

describe('getGame use case', () => {
  it('returns a saved game by id', () => {
    const store = createTestStore()
    const created = createGame(store, ['Aino', 'Matti'])

    expect(getGame(store, created.id)).toEqual(created)
  })

  it('throws ApplicationError when the game is missing', () => {
    expect(() => getGame(createTestStore(), 'missing')).toThrow(ApplicationError)
    expect(() => getGame(createTestStore(), 'missing')).toThrow('Game not found')
  })
})

describe('recordTurn use case', () => {
  it('loads, appends a turn, and persists standings from history', () => {
    const store = createTestStore()
    const game = createGame(store, ['Aino', 'Matti'])
    const aino = game.players[0]!

    const updated = recordTurn(store, game.id, {
      playerId: aino.id,
      score: 14,
      word: 'kissa',
    })

    expect(updated.turns).toHaveLength(1)
    expect(updated.turns[0]?.score).toBe(14)
    expect(updated.turns[0]?.word).toBe('kissa')
    expect(updated.currentPlayerId).toBe(game.players[1]!.id)
    expect(store.getById(game.id)).toEqual(updated)
    expect(getStandings(updated).map((row) => row.total)).toEqual([14, 0])
  })

  it('does not save when the player is not the current seat', () => {
    const store = createTestStore()
    const game = createGame(store, ['Aino', 'Matti'])
    const other = game.players[1]!

    expect(() =>
      recordTurn(store, game.id, { playerId: other.id, score: 10 }),
    ).toThrow(DomainError)
    expect(store.getById(game.id)?.turns).toEqual([])
    expect(store.getById(game.id)?.currentPlayerId).toBe(game.currentPlayerId)
  })

  it('does not save when domain rejects the turn', () => {
    const store = createTestStore()
    const game = createGame(store, ['Aino', 'Matti'])

    expect(() =>
      recordTurn(store, game.id, { playerId: ainoMissingId(), score: 10 }),
    ).toThrow(DomainError)
    expect(store.getById(game.id)?.turns).toEqual([])
  })

  it('surfaces ApplicationError for an unknown game id', () => {
    expect(() =>
      recordTurn(createTestStore(), 'missing', {
        playerId: 'p1',
        score: 1,
      }),
    ).toThrow(ApplicationError)
  })
})

describe('undoLastTurn and editTurn use cases', () => {
  it('undo removes the last turn and restores the current player after save', () => {
    const store = createTestStore()
    const game = createGame(store, ['Aino', 'Matti'])
    const [aino, matti] = game.players

    recordTurn(store, game.id, { playerId: aino!.id, score: 8 })
    const afterUndo = undoLastTurn(store, game.id)

    expect(afterUndo.turns).toHaveLength(0)
    expect(afterUndo.currentPlayerId).toBe(aino!.id)
    expect(store.getById(game.id)).toEqual(afterUndo)
    expect(matti).toBeDefined()
  })

  it('edit updates a turn and persists recomputed totals', () => {
    const store = createTestStore()
    const game = createGame(store, ['Aino', 'Matti'])
    const [aino, matti] = game.players

    const withTurn = recordTurn(store, game.id, {
      playerId: aino!.id,
      score: 10,
    })
    const turnId = withTurn.turns[0]!.id

    const edited = editTurn(store, game.id, turnId, {
      playerId: matti!.id,
      score: 22,
      word: 'talo',
    })

    expect(edited.turns[0]?.playerId).toBe(matti!.id)
    expect(edited.turns[0]?.score).toBe(22)
    expect(edited.turns[0]?.word).toBe('talo')
    expect(store.getById(game.id)).toEqual(edited)
    expect(getStandings(edited).map((row) => [row.name, row.total])).toEqual([
      ['Matti', 22],
      ['Aino', 0],
    ])
  })

  it('does not save when undo has nothing to remove', () => {
    const store = createTestStore()
    const game = createGame(store, ['Aino', 'Matti'])

    expect(() => undoLastTurn(store, game.id)).toThrow(DomainError)
    expect(store.getById(game.id)?.turns).toEqual([])
  })
})

describe('finishGame and reopenGame use cases', () => {
  it('finish marks the game finished and blocks further scoring until reopen', () => {
    const store = createTestStore()
    const game = createGame(store, ['Aino', 'Matti'])
    const aino = game.players[0]!

    const finished = finishGame(store, game.id)

    expect(finished.status).toBe('finished')
    expect(finished.finishedAt).toEqual(expect.any(String))
    expect(store.getById(game.id)).toEqual(finished)
    expect(() =>
      recordTurn(store, game.id, { playerId: aino.id, score: 5 }),
    ).toThrow(DomainError)

    const reopened = reopenGame(store, game.id)

    expect(reopened.status).toBe('in_progress')
    expect(reopened.finishedAt).toBeNull()
    expect(store.getById(game.id)).toEqual(reopened)

    const afterScore = recordTurn(store, game.id, {
      playerId: aino.id,
      score: 5,
    })
    expect(afterScore.turns).toHaveLength(1)
  })
})

describe('deleteGame use case', () => {
  it('removes a saved game from the store', () => {
    const store = createTestStore()
    const game = createGame(store, ['Aino', 'Matti'])

    deleteGame(store, game.id)

    expect(store.getById(game.id)).toBeNull()
    expect(listGames(store)).toEqual([])
  })

  it('throws ApplicationError when the game is missing', () => {
    expect(() => deleteGame(createTestStore(), 'missing')).toThrow(
      ApplicationError,
    )
  })
})

/** Stable fake id that will never match a domain-generated player id. */
function ainoMissingId(): string {
  return '00000000-0000-4000-8000-000000000000'
}
