import type { GameStore } from '../persistence'
import { listGames } from '../application'
import {
  formatGameCreatedAt,
  formatPlayerNames,
  listInProgressGamesNewestFirst,
} from './gameList'
import { strings } from './strings'

type HomeScreenProps = {
  store: GameStore
  onNewGame: () => void
  onContinue: (gameId: string) => void
}

/**
 * Home screen: start a new game or continue an in-progress one (T4.0, D17).
 *
 * Lists only unfinished games (newest first). Finished games belong on the
 * history screen (T4.5). Finnish copy lives in {@link strings}.
 */
export function HomeScreen({ store, onNewGame, onContinue }: HomeScreenProps) {
  const inProgress = listInProgressGamesNewestFirst(listGames(store))

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-lg flex-col bg-stone-100 px-4 py-8 text-stone-900">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{strings.appTitle}</h1>
        <p className="mt-2 text-stone-600">{strings.homeSubtitle}</p>
      </header>

      <button
        type="button"
        onClick={onNewGame}
        className="w-full rounded-xl bg-stone-900 px-4 py-4 text-lg font-medium text-stone-50 active:bg-stone-800"
      >
        {strings.newGame}
      </button>

      <section className="mt-10" aria-labelledby="continue-heading">
        <h2 id="continue-heading" className="text-lg font-medium text-stone-800">
          {strings.continueSection}
        </h2>

        {inProgress.length === 0 ? (
          <p className="mt-3 text-stone-600">{strings.noInProgressGames}</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {inProgress.map((game) => (
              <li key={game.id}>
                <button
                  type="button"
                  onClick={() => onContinue(game.id)}
                  className="flex w-full flex-col items-start gap-1 rounded-xl border border-stone-300 bg-stone-50 px-4 py-4 text-left active:bg-stone-200"
                >
                  <span className="font-medium text-stone-900">
                    {formatPlayerNames(game)}
                  </span>
                  <span className="text-sm text-stone-600">
                    {formatGameCreatedAt(game.createdAt)}
                    {' · '}
                    {strings.turnsCount(game.turns.length)}
                  </span>
                  <span className="mt-1 text-sm font-medium text-stone-800">
                    {strings.continueGame}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
