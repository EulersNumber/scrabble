import { createGame as createGameAggregate } from '../domain'
import type { Game } from '../domain'
import type { GameStore } from '../persistence'

/**
 * Creates a new game and persists it (T3.1).
 *
 * Builds a valid in-progress game via the domain, then saves the full
 * document through {@link GameStore}. Player names must already be in seating
 * order with the starter first (D13 / D25); starter pick is a UI concern.
 *
 * @param store - Persistence port used to save the new game
 * @param playerNames - Display names in seating order (length 2–4)
 * @returns The newly created and saved game
 * @throws {DomainError} If domain validation rejects the player names
 */
export function createGame(
  store: GameStore,
  playerNames: readonly string[],
): Game {
  const game = createGameAggregate(playerNames)
  store.save(game)
  return game
}
