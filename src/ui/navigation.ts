/**
 * In-app screen identity for navigation (D24).
 *
 * No URL router yet — a single React state value is enough for home, new game,
 * continue/history lists, the open game, and turn history (T7.3) until deep
 * links are needed.
 */
export type Screen =
  | { name: 'home' }
  | { name: 'new-game' }
  | { name: 'continue' }
  | { name: 'history' }
  | {
      name: 'active-game'
      gameId: string
      /** Where “Takaisin” returns after leaving the open game. */
      backTo: 'home' | 'continue' | 'history'
    }
  | {
      name: 'turn-history'
      gameId: string
      /** Preserved so leaving the game still returns to the list that opened it. */
      backTo: 'home' | 'continue' | 'history'
    }
