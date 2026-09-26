import { finishGame as finishGameOnDomain, type Game } from '../domain'
import type { GameStore } from '../persistence'
import { requireGame } from './requireGame'

/**
 * Finishes a saved game and persists the result (T3.2, D16).
 *
 * Loads the game, marks it finished via domain, then saves. Scoring mutations
 * stay blocked until {@link reopenGame}. Domain errors (already finished) propagate.
 *
 * @param store - Persistence port used to load and save
 * @param gameId - Id of the in-progress game to finish
 * @returns The finished and saved game
 * @throws {ApplicationError} If the game is not in the store
 * @throws {DomainError} If the game is already finished
 */
export function finishGame(store: GameStore, gameId: string): Game {
  const updated = finishGameOnDomain(requireGame(store, gameId))
  store.save(updated)
  return updated
}
