import { describe, expect, it } from 'vitest'
import { createGame } from './createGame'
import { DomainError } from './errors'

describe('createGame', () => {
  it('creates a game with 2 players', () => {
    const game = createGame(['Aino', 'Matti'])

    expect(game.players).toHaveLength(2)
    expect(game.players.map((player) => player.name)).toEqual(['Aino', 'Matti'])
  })

  it('creates a game with 3 or 4 unique names', () => {
    expect(createGame(['Aino', 'Matti', 'Liisa']).players).toHaveLength(3)
    expect(createGame(['Aino', 'Matti', 'Liisa', 'Pekka']).players).toHaveLength(4)
  })

  it('rejects fewer than 2 players', () => {
    expect(() => createGame([])).toThrow(DomainError)
    expect(() => createGame(['Aino'])).toThrow(DomainError)
  })

  it('rejects more than 4 players', () => {
    expect(() =>
      createGame(['Aino', 'Matti', 'Liisa', 'Pekka', 'Sari']),
    ).toThrow(DomainError)
  })

  it('rejects blank and whitespace-only names', () => {
    expect(() => createGame(['Aino', ''])).toThrow(DomainError)
    expect(() => createGame(['Aino', '   '])).toThrow(DomainError)
  })

  it('rejects duplicate names after trim, case-insensitively', () => {
    expect(() => createGame(['Aino', 'Aino'])).toThrow(DomainError)
    expect(() => createGame(['Aino', 'aino'])).toThrow(DomainError)
    expect(() => createGame(['Aino', ' Aino '])).toThrow(DomainError)
  })

  it('stores trimmed names and keeps seating order', () => {
    const game = createGame(['  Aino  ', 'Matti', ' Liisa'])

    expect(game.players.map((player) => player.name)).toEqual([
      'Aino',
      'Matti',
      'Liisa',
    ])
  })

  it('starts in progress with no turns', () => {
    const game = createGame(['Aino', 'Matti'])

    expect(game.status).toBe('in_progress')
    expect(game.finishedAt).toBeNull()
    expect(game.turns).toEqual([])
  })

  it('sets suggested current player to the first seated player', () => {
    const game = createGame(['Aino', 'Matti', 'Liisa'])
    const firstPlayer = game.players[0]

    expect(firstPlayer).toBeDefined()
    expect(game.currentPlayerId).toBe(firstPlayer?.id)
  })

  it('gives each player a unique id', () => {
    const game = createGame(['Aino', 'Matti', 'Liisa'])
    const ids = game.players.map((player) => player.id)

    expect(new Set(ids).size).toBe(ids.length)
  })
})
