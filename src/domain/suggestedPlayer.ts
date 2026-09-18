import { DomainError } from './errors'
import type { Game } from './types'

export function nextSeatAfter(game: Game, playerId: string): string {
  const index = game.players.findIndex((player) => player.id === playerId)
  const nextPlayer = game.players[(index + 1) % game.players.length]

  if (!nextPlayer) {
    throw new DomainError('Unknown player')
  }

  return nextPlayer.id
}

/** Suggested current player as implied by turn history (D13). */
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
