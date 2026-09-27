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
 * Next seat that may receive a turn after `playerId` (D36).
 *
 * Wraps seating order. Until skip-twice elimination exists (T10.2), every
 * seated player is active, so this is the immediate next seat.
 *
 * @param game - Game whose seating order defines the circle
 * @param playerId - Player who just took a turn, or the last turn's player
 * @returns Id of the next active seat
 * @throws {DomainError} If `playerId` is not on the game
 */
export function nextActiveSeat(game: Game, playerId: string): string {
  return nextSeatAfter(game, playerId)
}

/**
 * Current player implied by remaining turn history (D11, D36).
 *
 * With no turns, returns the starter (first seat). Otherwise returns the next
 * active seat after whoever played the last turn. Used after undo and edit so
 * `currentPlayerId` stays consistent with history, including legacy
 * off-rotation turns from the soft-rotation era.
 *
 * @param game - Game whose turns and seating define the current seat
 * @returns Player id whose turn it is
 * @throws {DomainError} If the game has no players (invariant violation)
 */
export function currentPlayerFromHistory(game: Game): string {
  const lastTurn = game.turns[game.turns.length - 1]
  if (!lastTurn) {
    const firstPlayer = game.players[0]
    if (!firstPlayer) {
      throw new DomainError('A game must have 2 to 4 players')
    }
    return firstPlayer.id
  }

  return nextActiveSeat(game, lastTurn.playerId)
}
