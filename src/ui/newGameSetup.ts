import type { Game } from '../domain'

const MIN_PLAYERS = 2
const MAX_PLAYERS = 4

export type NameSuggestionStats = {
  displayName: string
  playCount: number
  lastSeenAt: string
}

/**
 * Normalizes a player name for case-insensitive uniqueness (D23).
 *
 * @param name - Raw display name
 * @returns Trimmed Finnish-locale lowercased key, or empty when blank
 */
export function playerNameKey(name: string): string {
  return name.trim().toLocaleLowerCase('fi')
}

/**
 * Rotates seating so the chosen starter is first (D13 / D25).
 *
 * Remaining players keep their relative order after the starter. Domain
 * `createGame` then treats index 0 as the initial suggested current player.
 *
 * @param names - Filled display names in the order entered on the form
 * @param starterIndex - Index of the starter within `names`
 * @returns Names with starter first, then the rest wrapping around
 * @throws {RangeError} If `starterIndex` is out of range or `names` is empty
 */
export function orderNamesWithStarterFirst(
  names: readonly string[],
  starterIndex: number,
): string[] {
  if (names.length === 0) {
    throw new RangeError('Cannot rotate an empty player list')
  }
  if (starterIndex < 0 || starterIndex >= names.length) {
    throw new RangeError('Starter index is out of range')
  }
  return [
    ...names.slice(starterIndex),
    ...names.slice(0, starterIndex),
  ]
}

/**
 * Collects trimmed non-blank name fields in order (skips empty slots).
 *
 * @param fields - Raw input values from the new-game form
 * @returns Trimmed names that the user actually filled in
 */
export function collectFilledNames(fields: readonly string[]): string[] {
  return fields.map((name) => name.trim()).filter((name) => name.length > 0)
}

export type NewGameNamesValidation =
  | { ok: true; names: string[] }
  | { ok: false; reason: 'too_few' | 'too_many' | 'duplicate' }

/**
 * Validates filled names for create-game (2–4, unique, D7 / D23).
 *
 * Blank fields are ignored via {@link collectFilledNames}; the UI should
 * still show 2–4 slots so the user can add/remove seats.
 *
 * @param fields - Raw name fields from the form
 * @returns Valid trimmed names, or a reason the UI can map to Finnish copy
 */
export function validateNewGameNames(
  fields: readonly string[],
): NewGameNamesValidation {
  const names = collectFilledNames(fields)
  if (names.length < MIN_PLAYERS) {
    return { ok: false, reason: 'too_few' }
  }
  if (names.length > MAX_PLAYERS) {
    return { ok: false, reason: 'too_many' }
  }

  const seen = new Set<string>()
  for (const name of names) {
    const key = playerNameKey(name)
    if (seen.has(key)) {
      return { ok: false, reason: 'duplicate' }
    }
    seen.add(key)
  }

  return { ok: true, names }
}

/**
 * Aggregates unique display names from saved games for suggestions (D25).
 *
 * Each appearance in a game increments `playCount`. `lastSeenAt` and the
 * preferred `displayName` spelling come from the newest game that included
 * that name (case-insensitive key, Finnish locale).
 *
 * @param games - Saved games (order does not matter)
 * @returns One stats row per unique name
 */
export function aggregateNameSuggestionStats(
  games: readonly Game[],
): NameSuggestionStats[] {
  const byKey = new Map<string, NameSuggestionStats>()
  const newestFirst = games.slice().sort((a, b) => {
    const byCreated = b.createdAt.localeCompare(a.createdAt)
    if (byCreated !== 0) {
      return byCreated
    }
    return b.id.localeCompare(a.id)
  })

  for (const game of newestFirst) {
    for (const player of game.players) {
      const trimmed = player.name.trim()
      const key = playerNameKey(trimmed)
      if (key.length === 0) {
        continue
      }
      const existing = byKey.get(key)
      if (existing) {
        existing.playCount += 1
      } else {
        byKey.set(key, {
          displayName: trimmed,
          playCount: 1,
          lastSeenAt: game.createdAt,
        })
      }
    }
  }

  return [...byKey.values()]
}

/**
 * Builds name suggestions mixing recent and frequent past players (D25).
 *
 * Interleaves a newest-first list with a most-played list so empty history
 * yields nothing and a long history still surfaces both kinds of names.
 * Callers may filter out names already entered on the form.
 *
 * @param games - All saved games from `listGames`
 * @param limit - Maximum suggestions to return (default 8)
 * @returns Unique display names for optional UI chips / autocomplete
 */
export function suggestPlayerNames(
  games: readonly Game[],
  limit = 8,
): string[] {
  if (limit <= 0) {
    return []
  }

  const stats = aggregateNameSuggestionStats(games)
  if (stats.length === 0) {
    return []
  }

  const byRecent = stats.slice().sort((a, b) => {
    const bySeen = b.lastSeenAt.localeCompare(a.lastSeenAt)
    if (bySeen !== 0) {
      return bySeen
    }
    return a.displayName.localeCompare(b.displayName, 'fi')
  })

  const byFrequent = stats.slice().sort((a, b) => {
    if (b.playCount !== a.playCount) {
      return b.playCount - a.playCount
    }
    const bySeen = b.lastSeenAt.localeCompare(a.lastSeenAt)
    if (bySeen !== 0) {
      return bySeen
    }
    return a.displayName.localeCompare(b.displayName, 'fi')
  })

  const result: string[] = []
  const seen = new Set<string>()
  let index = 0

  while (
    result.length < limit &&
    (index < byRecent.length || index < byFrequent.length)
  ) {
    for (const list of [byRecent, byFrequent]) {
      const item = list[index]
      if (!item) {
        continue
      }
      const key = playerNameKey(item.displayName)
      if (seen.has(key)) {
        continue
      }
      seen.add(key)
      result.push(item.displayName)
      if (result.length >= limit) {
        break
      }
    }
    index += 1
  }

  return result
}

export { MIN_PLAYERS, MAX_PLAYERS }
