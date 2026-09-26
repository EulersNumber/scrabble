import type { GameStore } from '../persistence'
import { requireGame } from './requireGame'

/**
 * Deletes a saved game from the store (T3.2, D16).
 *
 * Confirmation belongs in the UI layer; this use case only removes the document.
 * Verifies the game exists first so a missing id surfaces clearly.
 *
 * @param store - Persistence port used to load and delete
 * @param gameId - Id of the game to remove
 * @throws {ApplicationError} If the game is not in the store
 */
export function deleteGame(store: GameStore, gameId: string): void {
  requireGame(store, gameId)
  store.delete(gameId)
}
