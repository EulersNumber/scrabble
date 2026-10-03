import type { Standing } from '../domain'

/** One derived standing row placed on the podium. Matches `getStandings`. */
export type PodiumPlayer = Pick<Standing, 'playerId' | 'name' | 'total' | 'rank'>

/** Where a rank sits on the olympic podium (D33). */
export type PodiumStepId = 'first' | 'second' | 'third' | 'beside'

/**
 * Players who share a rank, in standings order.
 * `beside` is everyone ranked 4 or lower.
 */
export type PodiumStep = {
  step: PodiumStepId
  players: readonly PodiumPlayer[]
}

/**
 * Podium slots for one game. A slot is `null` when nobody has that rank,
 * so a tie for first leaves the second step empty (D15: 1, 1, 3).
 */
export type PodiumLayout = {
  /** Left, medium step. Rank 2. */
  second: PodiumStep | null
  /** Centre, tallest step. Rank 1. */
  first: PodiumStep | null
  /** Right, shortest step. Rank 3. */
  third: PodiumStep | null
  /** Small place beside the podium. Rank 4 and below. */
  beside: PodiumStep | null
}

function step(
  id: PodiumStepId,
  players: readonly PodiumPlayer[],
): PodiumStep | null {
  if (players.length === 0) {
    return null
  }
  return { step: id, players }
}

/**
 * Maps derived standings onto a compact olympic podium (T7.6 / D33 / D15).
 *
 * Rank 1 is the centre step, rank 2 the left, rank 3 the right. Players who
 * share a rank share that step, keeping standings order (total, then seating).
 * A 4th place — and any lower rank — sits beside the podium. With 2–4 players
 * that beside slot is at most one person, because a tie never produces rank 4
 * for more than one seat. Does not recompute totals.
 *
 * @param standings - Display-ordered standings, usually from `getStandings`
 * @returns The four slots; a slot is null when that rank is absent
 */
export function podiumLayout(standings: readonly PodiumPlayer[]): PodiumLayout {
  return {
    second: step(
      'second',
      standings.filter((player) => player.rank === 2),
    ),
    first: step(
      'first',
      standings.filter((player) => player.rank === 1),
    ),
    third: step(
      'third',
      standings.filter((player) => player.rank === 3),
    ),
    beside: step(
      'beside',
      standings.filter((player) => player.rank >= 4),
    ),
  }
}
