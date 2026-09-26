/**
 * Finnish UI copy for the scorekeeping app (D19).
 *
 * Plain string constants — no i18n framework.
 */

export const strings = {
  appTitle: 'Scrabble-pisteet',
  homeSubtitle: 'Pidä pisteet kirjassa pöydän ääressä.',
  newGame: 'Uusi peli',
  continueSection: 'Kesken olevat pelit',
  continueGame: 'Jatka',
  noInProgressGames: 'Ei kesken olevia pelejä. Aloita uusi peli.',
  turnsCount: (count: number) =>
    count === 1 ? '1 vuoro' : `${count} vuoroa`,
  back: 'Takaisin',
  newGameComingSoon: 'Pelaajien lisäys tulee seuraavassa vaiheessa.',
  activeGameComingSoon: 'Pistelasku tulee seuraavassa vaiheessa.',
  gameNotFound: 'Peliä ei löytynyt.',
} as const
