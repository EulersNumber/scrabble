import { describe, expect, it } from 'vitest'
import { DomainError, finishGame } from '../domain'
import {
  createLocalStorageGameStore,
  createMemoryStorage,
} from '../persistence'
import { createGame } from './createGame'
import { listGames } from './listGames'

function createTestStore() {
  return createLocalStorageGameStore(createMemoryStorage())
}

describe('createGame use case', () => {
  it('persists a new in-progress game that can be loaded by id', () => {
    const store = createTestStore()

    const game = createGame(store, ['Aino', 'Matti', 'Liisa'])

    expect(game.status).toBe('in_progress')
    expect(game.players.map((player) => player.name)).toEqual([
      'Aino',
      'Matti',
      'Liisa',
    ])
    expect(store.getById(game.id)).toEqual(game)
  })

  it('does not save when domain validation rejects the names', () => {
    const store = createTestStore()

    expect(() => createGame(store, ['Aino'])).toThrow(DomainError)
    expect(listGames(store)).toEqual([])
  })
})

describe('listGames use case', () => {
  it('returns both in-progress and finished saved games', () => {
    const store = createTestStore()

    const inProgress = createGame(store, ['Aino', 'Matti'])
    const toFinish = createGame(store, ['Pekka', 'Sari'])
    const finished = finishGame(toFinish)
    store.save(finished)

    const listed = listGames(store)

    expect(listed).toHaveLength(2)
    expect(listed.map((game) => game.id).sort()).toEqual(
      [inProgress.id, finished.id].sort(),
    )
    expect(listed.find((game) => game.id === inProgress.id)?.status).toBe(
      'in_progress',
    )
    expect(listed.find((game) => game.id === finished.id)?.status).toBe(
      'finished',
    )
  })

  it('returns an empty list when nothing is saved', () => {
    expect(listGames(createTestStore())).toEqual([])
  })
})
