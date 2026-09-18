import { DomainError } from './errors'
import type { Game, Player } from './types'

const MIN_PLAYERS = 2
const MAX_PLAYERS = 4

/**
 * Creates a new in-progress game with 2–4 uniquely named players (D7, D23).
 *
 * Names are trimmed; uniqueness is case-insensitive (Finnish locale). Seating
 * order is the player list order. Suggested current player starts as the first
 * seat. Turns start empty; `finishedAt` is null.
 *
 * @param playerNames - Display names in seating order (length 2–4)
 * @returns A new immutable game aggregate
 * @throws {DomainError} If player count, blank names, or duplicate names fail validation
 */
export function createGame(playerNames: readonly string[]): Game {
  if (playerNames.length < MIN_PLAYERS || playerNames.length > MAX_PLAYERS) {
    throw new DomainError('A game must have 2 to 4 players')
  }

  const names = playerNames.map((name) => name.trim())
  const seenNames = new Set<string>()
  const players: Player[] = []

  for (const name of names) {
    if (name.length === 0) {
      throw new DomainError('Player names cannot be blank')
    }

    const uniquenessKey = name.toLocaleLowerCase('fi')
    if (seenNames.has(uniquenessKey)) {
      throw new DomainError('Player names must be unique within a game')
    }

    seenNames.add(uniquenessKey)
    players.push({
      id: crypto.randomUUID(),
      name,
    })
  }

  const firstPlayer = players[0]
  if (!firstPlayer) {
    throw new DomainError('A game must have 2 to 4 players')
  }

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'in_progress',
    finishedAt: null,
    players,
    turns: [],
    currentPlayerId: firstPlayer.id,
  }
}
