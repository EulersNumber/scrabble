import type { Game } from '../domain'

/**
 * Filters to in-progress games and sorts newest first for the home continue
 * list (T4.0, D17, D26).
 *
 * Finished games are omitted here so “Jatka” stays distinct from history
 * (T4.5). Sort uses `createdAt` descending; equal timestamps keep a stable
 * relative order from the input array.
 *
 * @param games - All saved games from `listGames` (order undefined)
 * @returns In-progress games, newest first
 */
export function listInProgressGamesNewestFirst(
  games: readonly Game[],
): Game[] {
  return games
    .filter((game) => game.status === 'in_progress')
    .slice()
    .sort((a, b) => {
      const byCreated = b.createdAt.localeCompare(a.createdAt)
      if (byCreated !== 0) {
        return byCreated
      }
      return b.id.localeCompare(a.id)
    })
}

/**
 * Formats seated player names for a compact home-list summary.
 *
 * @param game - Game whose seating order names are shown
 * @returns Comma-separated display names in seating order
 */
export function formatPlayerNames(game: Game): string {
  return game.players.map((player) => player.name).join(', ')
}

/**
 * Formats a game timestamp for Finnish UI display.
 *
 * @param iso - ISO-8601 timestamp from the game document
 * @returns Locale-formatted date/time string for `fi-FI`
 */
export function formatGameCreatedAt(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return iso
  }
  return date.toLocaleString('fi-FI', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}
