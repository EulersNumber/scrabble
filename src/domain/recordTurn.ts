import { DomainError } from './errors'
import type { Game, Turn } from './types'

export type RecordTurnInput = {
  playerId: string
  score: number
  word?: string
}

export function recordTurn(game: Game, input: RecordTurnInput): Game {
  const player = game.players.find((candidate) => candidate.id === input.playerId)
  if (!player) {
    throw new DomainError('Unknown player')
  }

  if (!Number.isInteger(input.score)) {
    throw new DomainError('Score must be an integer')
  }

  const word = input.word === undefined || input.word === '' ? undefined : input.word

  const turn: Turn = {
    id: crypto.randomUUID(),
    playerId: player.id,
    score: input.score,
    createdAt: new Date().toISOString(),
    sequence: game.turns.length,
    ...(word === undefined ? {} : { word }),
  }

  return {
    ...game,
    turns: [...game.turns, turn],
    currentPlayerId: nextSeatAfter(game, player.id),
  }
}

function nextSeatAfter(game: Game, playerId: string): string {
  const index = game.players.findIndex((player) => player.id === playerId)
  const nextPlayer = game.players[(index + 1) % game.players.length]

  if (!nextPlayer) {
    throw new DomainError('Unknown player')
  }

  return nextPlayer.id
}
