import { DomainError } from './errors'
import type { Game } from './types'

/**
 * Ensures a game may still accept scoring mutations (D16).
 *
 * Finished games are read-only until reopened. Call this at the start of
 * record / edit / undo operations.
 *
 * @param game - Game that a mutation is about to change
 * @throws {DomainError} If `status` is `finished`
 */
export function assertGameMutable(game: Game): void {
  if (game.status === 'finished') {
    throw new DomainError('Finished games are read-only until reopened')
  }
}
