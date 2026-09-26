import type { GameStore } from '../persistence'
import { formatPlayerNames } from './gameList'
import { strings } from './strings'

type ActiveGameScreenProps = {
  store: GameStore
  gameId: string
  onBack: () => void
}

/**
 * Placeholder active-game screen until T4.2 (standings + add turn).
 *
 * Home “Jatka” opens the selected in-progress game here so resume navigation
 * is wired (T4.0 / D17). Uses the store directly so a missing id can show a
 * Finnish empty state instead of throwing.
 */
export function ActiveGameScreen({
  store,
  gameId,
  onBack,
}: ActiveGameScreenProps) {
  const game = store.getById(gameId)

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-lg flex-col bg-stone-100 px-4 py-8 text-stone-900">
      <button
        type="button"
        onClick={onBack}
        className="self-start text-base font-medium text-stone-700 underline-offset-2 hover:underline"
      >
        {strings.back}
      </button>

      {game === null ? (
        <>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            {strings.appTitle}
          </h1>
          <p className="mt-3 text-stone-600">{strings.gameNotFound}</p>
        </>
      ) : (
        <>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            {formatPlayerNames(game)}
          </h1>
          <p className="mt-3 text-stone-600">{strings.activeGameComingSoon}</p>
          <p className="mt-2 text-sm text-stone-500">
            {strings.turnsCount(game.turns.length)}
          </p>
        </>
      )}
    </main>
  )
}
