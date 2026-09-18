import type { Game } from './types'

export type Standing = {
  playerId: string
  name: string
  total: number
  rank: number
}

/** Totals and ranks derived only from the turn list (D3, D15). */
export function getStandings(game: Game): Standing[] {
  const totals = new Map<string, number>()

  for (const player of game.players) {
    totals.set(player.id, 0)
  }

  for (const turn of game.turns) {
    const current = totals.get(turn.playerId)
    if (current === undefined) {
      continue
    }
    totals.set(turn.playerId, current + turn.score)
  }

  const seatIndex = new Map(game.players.map((player, index) => [player.id, index]))

  const ordered = [...game.players]
    .map((player) => ({
      playerId: player.id,
      name: player.name,
      total: totals.get(player.id) ?? 0,
      seat: seatIndex.get(player.id) ?? 0,
    }))
    .sort((a, b) => {
      if (b.total !== a.total) {
        return b.total - a.total
      }
      return a.seat - b.seat
    })

  const standings: Standing[] = []

  for (let index = 0; index < ordered.length; index += 1) {
    const entry = ordered[index]!
    const previous = standings[index - 1]
    const rank =
      previous !== undefined && previous.total === entry.total
        ? previous.rank
        : index + 1

    standings.push({
      playerId: entry.playerId,
      name: entry.name,
      total: entry.total,
      rank,
    })
  }

  return standings
}
