import type { Game } from '../domain'
import type { GameStore } from './GameStore'
import type { KeyValueStorage } from './KeyValueStorage'

/** Single localStorage key holding the map of all game documents. */
export const GAMES_STORAGE_KEY = 'scrabble.games'

type GameMap = Record<string, Game>

/**
 * Creates a {@link GameStore} backed by JSON in key-value storage (D9).
 *
 * Each game is one document keyed by id inside a single JSON object. Saves
 * deep-clone via JSON so callers cannot mutate stored state through shared
 * references. Works offline; no network is used.
 *
 * @param storage - Web Storage–compatible backend; defaults to `localStorage`
 * @returns A store that saves, loads, lists, and deletes games
 * @throws {SyntaxError} If stored JSON is corrupt when reading
 */
export function createLocalStorageGameStore(
  storage: KeyValueStorage = globalThis.localStorage,
): GameStore {
  function readMap(): GameMap {
    const raw = storage.getItem(GAMES_STORAGE_KEY)
    if (raw === null || raw === '') {
      return {}
    }
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new SyntaxError('Corrupt games storage: expected a JSON object')
    }
    return parsed as GameMap
  }

  function writeMap(map: GameMap): void {
    storage.setItem(GAMES_STORAGE_KEY, JSON.stringify(map))
  }

  return {
    save(game: Game): void {
      const map = readMap()
      map[game.id] = structuredCloneJson(game)
      writeMap(map)
    },

    getById(id: string): Game | null {
      const game = readMap()[id]
      return game === undefined ? null : structuredCloneJson(game)
    },

    list(): Game[] {
      return Object.values(readMap()).map(structuredCloneJson)
    },

    delete(id: string): void {
      const map = readMap()
      if (!(id in map)) {
        return
      }
      delete map[id]
      writeMap(map)
    },
  }
}

function structuredCloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
