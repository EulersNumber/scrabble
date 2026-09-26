import { reopenGame as reopenGameOnDomain, type Game } from '../domain'
import type { GameStore } from '../persistence'
import { requireGame } from './requireGame'

/**
 * Reopens a finished saved game and persists the result (T3.2, D16).
 *
 * Loads the game, returns it to in-progress via domain, then saves so scoring
 * can resume. Domain errors (not finished) propagate.
 *
 * @param store - Persistence port used to load and save
 * @param gameId - Id of the finished game to reopen
 * @returns The reopened and saved game
 * @throws {ApplicationError} If the game is not in the store
 * @throws {DomainError} If the game is not finished
 */
export function reopenGame(store: GameStore, gameId: string): Game {
  const updated = reopenGameOnDomain(requireGame(store, gameId))
  store.save(updated)
  return updated
}
