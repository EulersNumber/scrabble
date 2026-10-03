import type { AppSettings, SettingsStore } from '../persistence'

/**
 * Loads app-wide settings for the UI (T9.1 / D35 / D41).
 *
 * Missing or corrupt storage comes back as defaults (`soundsEnabled` on).
 * Does not read or write a game document.
 *
 * @param store - Settings persistence port
 * @returns The current settings document
 */
export function getSettings(store: SettingsStore): AppSettings {
  return store.load()
}

/**
 * Merges a partial settings change and saves it (T9.1 / D35).
 *
 * Only boolean `soundsEnabled` is applied; other patch values are ignored so
 * a bad call cannot turn the mute flag into a non-boolean. Returns the
 * document as stored, not the caller's object.
 *
 * @param store - Settings persistence port
 * @param patch - Fields to change; omitted fields stay as they are
 * @returns The settings document after save
 */
export function updateSettings(
  store: SettingsStore,
  patch: Partial<AppSettings>,
): AppSettings {
  const current = store.load()
  const next: AppSettings = {
    soundsEnabled:
      typeof patch.soundsEnabled === 'boolean'
        ? patch.soundsEnabled
        : current.soundsEnabled,
  }
  store.save(next)
  return store.load()
}
