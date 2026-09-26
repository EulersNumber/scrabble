import type { Game } from '../domain'
import type { GameStore } from '../persistence'

/**
 * Returns all saved games for the UI (T3.1, D26).
 *
 * Includes both in-progress and finished games. Order is undefined — matching
 * the store — so home/history screens own sorting and filtering (presentation).
 *
 * @param store - Persistence port to read from
 * @returns All stored game documents (order not guaranteed)
 */
export function listGames(store: GameStore): Game[] {
  return store.list()
}
