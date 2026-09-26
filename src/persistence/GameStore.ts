import type { Game } from '../domain'

/**
 * Persistence port for game documents (D9).
 *
 * Callers depend on this interface, not on `localStorage` or any other
 * storage mechanism. Derived standings are never stored — only the game
 * aggregate (players, turns, status, timestamps).
 */
export type GameStore = {
  /** Inserts or replaces the game document under its `id`. */
  save(game: Game): void
  /** Returns the game with the given id, or `null` if none is stored. */
  getById(id: string): Game | null
  /** Returns all saved games (in-progress and finished). Order is undefined. */
  list(): Game[]
  /** Removes the game with the given id. No-op if it does not exist. */
  delete(id: string): void
}
