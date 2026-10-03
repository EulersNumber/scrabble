import { describe, expect, it } from 'vitest'
import { createGame, finishGame, recordTurn } from '../domain'
import {
  createLocalStorageGameStore,
  GAMES_STORAGE_KEY,
} from './localStorageGameStore'
import { createMemoryStorage } from './memoryStorage'

describe('createLocalStorageGameStore', () => {
  it('round-trips a full in-progress game document', () => {
    const storage = createMemoryStorage()
    const store = createLocalStorageGameStore(storage)

    let game = createGame(['Aino', 'Matti', 'Liisa'])
    const [aino, matti] = game.players
    game = recordTurn(game, {
      playerId: aino!.id,
      score: 14,
      word: 'kissa',
    })
    game = recordTurn(game, {
      playerId: matti!.id,
      score: 0,
    })

    store.save(game)
    const loaded = store.getById(game.id)

    expect(loaded).toEqual(game)
    expect(loaded?.turns[0]?.word).toBe('kissa')
    expect(loaded?.turns[1]?.word).toBeUndefined()
    expect(loaded?.status).toBe('in_progress')
    expect(loaded?.finishedAt).toBeNull()
    expect(loaded?.currentPlayerId).toBe(game.currentPlayerId)
  })

  it('round-trips status and finishedAt for a finished game', () => {
    const storage = createMemoryStorage()
    const store = createLocalStorageGameStore(storage)

    let game = createGame(['Aino', 'Matti'])
    game = recordTurn(game, {
      playerId: game.players[0]!.id,
      score: 10,
      word: 'talo',
    })
    game = finishGame(game)

    store.save(game)
    const loaded = store.getById(game.id)

    expect(loaded?.status).toBe('finished')
    expect(loaded?.finishedAt).toBe(game.finishedAt)
    expect(loaded?.turns).toHaveLength(1)
    expect(loaded?.turns[0]?.word).toBe('talo')
  })

  it('returns null for an unknown id', () => {
    const store = createLocalStorageGameStore(createMemoryStorage())
    expect(store.getById('missing')).toBeNull()
  })

  it('lists all saved games and replaces on save with the same id', () => {
    const store = createLocalStorageGameStore(createMemoryStorage())

    const first = createGame(['Aino', 'Matti'])
    const second = createGame(['Pekka', 'Sari', 'Jussi', 'Emma'])
    store.save(first)
    store.save(second)

    const listed = store.list()
    expect(listed).toHaveLength(2)
    expect(listed.map((game) => game.id).sort()).toEqual(
      [first.id, second.id].sort(),
    )

    const updated = recordTurn(first, {
      playerId: first.players[0]!.id,
      score: 5,
    })
    store.save(updated)

    expect(store.list()).toHaveLength(2)
    expect(store.getById(first.id)?.turns).toHaveLength(1)
  })

  it('deletes a game and leaves others untouched', () => {
    const store = createLocalStorageGameStore(createMemoryStorage())
    const keep = createGame(['Aino', 'Matti'])
    const remove = createGame(['Pekka', 'Sari'])
    store.save(keep)
    store.save(remove)

    store.delete(remove.id)

    expect(store.getById(remove.id)).toBeNull()
    expect(store.getById(keep.id)).toEqual(keep)
    expect(store.list()).toEqual([keep])
  })

  it('isolates callers from stored references via JSON cloning', () => {
    const store = createLocalStorageGameStore(createMemoryStorage())
    const game = createGame(['Aino', 'Matti'])
    store.save(game)

    const loaded = store.getById(game.id)!
    loaded.players[0]!.name = 'Mutated'
    loaded.turns.push({
      id: 'fake',
      playerId: loaded.players[0]!.id,
      score: 99,
      createdAt: 'x',
      sequence: 0,
    })

    expect(store.getById(game.id)).toEqual(game)
  })

  it('writes under the fixed storage key with no network dependency', () => {
    const storage = createMemoryStorage()
    const store = createLocalStorageGameStore(storage)
    const game = createGame(['Aino', 'Matti'])

    store.save(game)

    const raw = storage.getItem(GAMES_STORAGE_KEY)
    expect(raw).toBeTruthy()
    expect(JSON.parse(raw!)[game.id].id).toBe(game.id)
  })

  it('resumes an in-progress game and its turns after a fresh store (reload)', () => {
    const storage = createMemoryStorage()
    const beforeReload = createLocalStorageGameStore(storage)

    let game = createGame(['Aino', 'Matti', 'Liisa'])
    const [aino, matti] = game.players
    game = recordTurn(game, {
      playerId: aino!.id,
      score: 22,
      word: 'sana',
    })
    game = recordTurn(game, {
      playerId: matti!.id,
      score: 0,
    })
    beforeReload.save(game)

    // New store instance + same storage ≈ browser reload / app restart (D17).
    const afterReload = createLocalStorageGameStore(storage)
    const resumed = afterReload.getById(game.id)

    expect(resumed).toEqual(game)
    expect(resumed?.status).toBe('in_progress')
    expect(resumed?.turns).toHaveLength(2)
    expect(resumed?.currentPlayerId).toBe(game.currentPlayerId)
  })

  it('keeps multiple in-progress games across reload alongside finished ones', () => {
    const storage = createMemoryStorage()
    const beforeReload = createLocalStorageGameStore(storage)

    let first = createGame(['Aino', 'Matti'])
    first = recordTurn(first, {
      playerId: first.players[0]!.id,
      score: 8,
    })
    let second = createGame(['Pekka', 'Sari', 'Jussi'])
    second = recordTurn(second, {
      playerId: second.players[0]!.id,
      score: 15,
      word: 'peli',
    })
    let finished = createGame(['Emma', 'Otto'])
    finished = recordTurn(finished, {
      playerId: finished.players[0]!.id,
      score: 30,
    })
    finished = finishGame(finished)

    beforeReload.save(first)
    beforeReload.save(second)
    beforeReload.save(finished)

    const afterReload = createLocalStorageGameStore(storage)
    const listed = afterReload.list()
    const inProgress = listed.filter((game) => game.status === 'in_progress')
    const done = listed.filter((game) => game.status === 'finished')

    expect(inProgress).toHaveLength(2)
    expect(done).toHaveLength(1)
    expect(afterReload.getById(first.id)).toEqual(first)
    expect(afterReload.getById(second.id)).toEqual(second)
    expect(afterReload.getById(finished.id)?.status).toBe('finished')
  })
})
