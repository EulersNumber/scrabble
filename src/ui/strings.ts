/**
 * Finnish UI copy for the scorekeeping app (D19).
 *
 * Plain string constants — no i18n framework.
 */

export const strings = {
  appTitle: 'Scrabble-pisteet',
  homeSubtitle: 'Pidä pisteet kirjassa pöydän ääressä.',
  newGame: 'Uusi peli',
  newGameSubtitle: 'Lisää 2–4 pelaajaa ja valitse kuka aloittaa.',
  continueSection: 'Kesken olevat pelit',
  continueGame: 'Jatka',
  noInProgressGames: 'Ei kesken olevia pelejä. Aloita uusi peli.',
  turnsCount: (count: number) =>
    count === 1 ? '1 vuoro' : `${count} vuoroa`,
  back: 'Takaisin',
  activeGameComingSoon: 'Pistelasku tulee seuraavassa vaiheessa.',
  gameNotFound: 'Peliä ei löytynyt.',
  playerNameLabel: (n: number) => `Pelaaja ${n}`,
  addPlayer: 'Lisää pelaaja',
  removePlayer: 'Poista',
  nameSuggestions: 'Ehdotukset aiemmista peleistä',
  whoStarts: 'Kuka aloittaa?',
  whoStartsHint: 'Valitse kirjaimen noston voittaja.',
  startGame: 'Aloita peli',
  newGameTooFewPlayers: 'Lisää vähintään kaksi pelaajaa.',
  newGameTooManyPlayers: 'Pelaajia voi olla enintään neljä.',
  newGameDuplicateNames: 'Pelaajien nimien on oltava erilaisia.',
  newGamePickStarter: 'Valitse kuka aloittaa.',
  newGameCreateFailed: 'Pelin luonti epäonnistui. Tarkista nimet ja yritä uudelleen.',
} as const
