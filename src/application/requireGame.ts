import type { Game } from '../domain'
import type { GameStore } from '../persistence'
import { ApplicationError } from './errors'

/**
 * Loads a game by id or fails clearly when it is missing.
 *
 * @param store - Persistence port to read from
 * @param gameId - Id of the game document to load
 * @returns The stored game document
 * @throws {ApplicationError} If no game exists for `gameId`
 */
export function requireGame(store: GameStore, gameId: string): Game {
  const game = store.getById(gameId)
  if (game === null) {
    throw new ApplicationError('Game not found')
  }
  return game
}
