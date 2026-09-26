import {
  recordTurn as recordTurnOnGame,
  type Game,
  type RecordTurnInput,
} from '../domain'
import type { GameStore } from '../persistence'
import { requireGame } from './requireGame'

/**
 * Records a turn on a saved game and persists the result (T3.2).
 *
 * Loads the game, appends the turn via domain soft rotation (D13), then saves.
 * Domain errors (finished game, unknown player, non-integer score) propagate.
 *
 * @param store - Persistence port used to load and save
 * @param gameId - Id of the in-progress game to update
 * @param input - Player, integer score, and optional word
 * @returns The updated and saved game
 * @throws {ApplicationError} If the game is not in the store
 * @throws {DomainError} If domain validation rejects the turn
 */
export function recordTurn(
  store: GameStore,
  gameId: string,
  input: RecordTurnInput,
): Game {
  const updated = recordTurnOnGame(requireGame(store, gameId), input)
  store.save(updated)
  return updated
}
