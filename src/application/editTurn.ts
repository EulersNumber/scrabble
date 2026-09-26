import {
  editTurn as editTurnOnGame,
  type EditTurnInput,
  type Game,
} from '../domain'
import type { GameStore } from '../persistence'
import { requireGame } from './requireGame'

/**
 * Edits a turn on a saved game and persists the result (T3.2, D11).
 *
 * Loads the game, replaces score/word/player on the named turn via domain,
 * then saves. Domain errors (finished, unknown turn/player, bad score) propagate.
 *
 * @param store - Persistence port used to load and save
 * @param gameId - Id of the in-progress game to update
 * @param turnId - Id of the turn to change
 * @param input - New player, integer score, and optional word
 * @returns The updated and saved game
 * @throws {ApplicationError} If the game is not in the store
 * @throws {DomainError} If domain validation rejects the edit
 */
export function editTurn(
  store: GameStore,
  gameId: string,
  turnId: string,
  input: EditTurnInput,
): Game {
  const updated = editTurnOnGame(requireGame(store, gameId), turnId, input)
  store.save(updated)
  return updated
}
