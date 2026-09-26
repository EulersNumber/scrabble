import type { Game } from '../domain'
import type { GameStore } from '../persistence'
import { requireGame } from './requireGame'

/**
 * Loads one saved game by id for the UI (T3.2).
 *
 * @param store - Persistence port to read from
 * @param gameId - Id of the game to load
 * @returns The stored game document
 * @throws {ApplicationError} If no game exists for `gameId`
 */
export function getGame(store: GameStore, gameId: string): Game {
  return requireGame(store, gameId)
}
