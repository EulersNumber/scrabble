import { undoLastTurn as undoLastTurnOnGame, type Game } from '../domain'
import type { GameStore } from '../persistence'
import { requireGame } from './requireGame'

/**
 * Undoes the last turn on a saved game and persists the result (T3.2, D11).
 *
 * Loads the game, removes only the last turn via domain, then saves.
 * Domain errors (finished game, empty history) propagate.
 *
 * @param store - Persistence port used to load and save
 * @param gameId - Id of the in-progress game to update
 * @returns The updated and saved game
 * @throws {ApplicationError} If the game is not in the store
 * @throws {DomainError} If domain validation rejects the undo
 */
export function undoLastTurn(store: GameStore, gameId: string): Game {
  const updated = undoLastTurnOnGame(requireGame(store, gameId))
  store.save(updated)
  return updated
}
