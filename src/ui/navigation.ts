/**
 * In-app screen identity for T4 navigation (D24).
 *
 * No URL router yet — a single React state value is enough for home, new game,
 * continue/history lists, and active game until deep links are needed.
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
