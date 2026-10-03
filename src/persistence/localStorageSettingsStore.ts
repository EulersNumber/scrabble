import type { AppSettings, SettingsStore } from './SettingsStore'
import type { KeyValueStorage } from './KeyValueStorage'

/** Single localStorage key for the app settings document. Not the games key. */
export const SETTINGS_STORAGE_KEY = 'scrabble.settings'

/** Document shape version written by this store. Unknown versions still yield known fields. */
const SETTINGS_VERSION = 1

/**
 * Creates a {@link SettingsStore} backed by one JSON document (D35 / D41).
 *
 * Missing, empty, or corrupt storage reads as defaults (`soundsEnabled: true`)
 * and does not throw. Saves deep-clone via JSON so callers cannot mutate
 * stored state through a shared reference. Works offline; no network is used.
 *
 * @param storage - Web Storage–compatible backend; defaults to `localStorage`
 * @returns A store that loads and saves app settings
 */
export function createLocalStorageSettingsStore(
  storage: KeyValueStorage = globalThis.localStorage,
): SettingsStore {
  return {
    load(): AppSettings {
      return readSettings(storage.getItem(SETTINGS_STORAGE_KEY))
    },

    save(settings: AppSettings): void {
      const soundsEnabled =
        typeof settings.soundsEnabled === 'boolean' ? settings.soundsEnabled : true
      const document = {
        version: SETTINGS_VERSION,
        soundsEnabled,
      }
      storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(document))
    },
  }
}

/**
 * Parses a stored settings payload.
 *
 * @param raw - Value from storage, or null when the key is absent
 * @returns Normalized settings; defaults when the payload is unusable
 */
function readSettings(raw: string | null): AppSettings {
  if (raw === null || raw.trim() === '') {
    return { soundsEnabled: true }
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    return { soundsEnabled: soundsEnabledFrom(parsed) }
  } catch {
    return { soundsEnabled: true }
  }
}

function soundsEnabledFrom(parsed: unknown): boolean {
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return true
  }

  const sounds = (parsed as { soundsEnabled?: unknown }).soundsEnabled
  return typeof sounds === 'boolean' ? sounds : true
}
