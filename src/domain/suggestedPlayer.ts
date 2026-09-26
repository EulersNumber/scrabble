import { DomainError } from './errors'
import type { Game } from './types'

/**
 * Returns the player id in the next seat after `playerId` (wraps around).
 *
 * @param game - Game whose seating order defines the circle
 * @param playerId - Player whose next seat is requested
 * @returns Id of the following seated player
 * @throws {DomainError} If `playerId` is not on the game
 */
export function nextSeatAfter(game: Game, playerId: string): string {
  const index = game.players.findIndex((player) => player.id === playerId)
  if (index === -1) {
    throw new DomainError('Unknown player')
  }

  const nextPlayer = game.players[(index + 1) % game.players.length]
  if (!nextPlayer) {
    throw new DomainError('Unknown player')
  }

  return nextPlayer.id
}

/**
 * Suggested current player implied by turn history (D13).
 *
 * With no turns, returns the first seated player. Otherwise returns the next
 * seat after whoever played the last turn.
 *
 * @param game - Game whose turns and seating define the suggestion
 * @returns Player id that the UI should highlight as current
 * @throws {DomainError} If the game has no players (invariant violation)
 */
export function suggestedCurrentFromTurns(game: Game): string {
  const lastTurn = game.turns[game.turns.length - 1]
  if (!lastTurn) {
    const firstPlayer = game.players[0]
    if (!firstPlayer) {
      throw new DomainError('A game must have 2 to 4 players')
    }
    return firstPlayer.id
  }

  return nextSeatAfter(game, lastTurn.playerId)
}
