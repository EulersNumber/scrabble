export type { GameStore } from './GameStore'
export type { KeyValueStorage } from './KeyValueStorage'
export {
  createLocalStorageGameStore,
  GAMES_STORAGE_KEY,
} from './localStorageGameStore'
export { createMemoryStorage } from './memoryStorage'
export type { AppSettings, SettingsStore } from './SettingsStore'
export {
  createLocalStorageSettingsStore,
  SETTINGS_STORAGE_KEY,
} from './localStorageSettingsStore'
