/**
 * App-wide preferences (D35 / D41).
 *
 * This document is never part of a `Game`. T9.1 stores only whether sound
 * cues are enabled. Later tasks may add fields; they still stay out of the
 * game document.
 */
export type AppSettings = {
  /** When false, sound cues stay silent (playback is T9.2). Default is on. */
  soundsEnabled: boolean
}

/**
 * Persistence port for the settings document (D35).
 *
 * Callers depend on this interface, not on `localStorage`. Missing or corrupt
 * data reads as defaults; it does not throw.
 */
export type SettingsStore = {
  /** Returns saved settings, or defaults when nothing valid is stored. */
  load(): AppSettings
  /** Replaces the settings document. */
  save(settings: AppSettings): void
}
