import type { GameStore } from '../persistence'
import { listGames } from '../application'
import {
  formatGameCreatedAt,
  formatPlayerNames,
  listInProgressGamesNewestFirst,
} from './gameList'
import { AppShell, Button, ListRowButton, ScreenHeader } from './primitives'
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
 * history screen (T4.5). Layout/chrome uses shared UI primitives (D27).
 */
export function HomeScreen({ store, onNewGame, onContinue }: HomeScreenProps) {
  const inProgress = listInProgressGamesNewestFirst(listGames(store))

  return (
    <AppShell>
      <ScreenHeader
        size="hero"
        title={strings.appTitle}
        subtitle={strings.homeSubtitle}
      />

      <Button fullWidth onClick={onNewGame}>
        {strings.newGame}
      </Button>

      <section className="mt-10 md:mt-12" aria-labelledby="continue-heading">
        <h2
          id="continue-heading"
          className="text-lg font-medium text-ink md:text-xl"
        >
          {strings.continueSection}
        </h2>

        {inProgress.length === 0 ? (
          <p className="mt-3 text-ink-muted">{strings.noInProgressGames}</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {inProgress.map((game) => (
              <li key={game.id}>
                <ListRowButton onClick={() => onContinue(game.id)}>
                  <span className="font-medium text-ink">
                    {formatPlayerNames(game)}
                  </span>
                  <span className="text-sm text-ink-muted">
                    {formatGameCreatedAt(game.createdAt)}
                    {' · '}
                    {strings.turnsCount(game.turns.length)}
                  </span>
                  <span className="mt-1 text-sm font-medium text-board">
                    {strings.continueGame}
                  </span>
                </ListRowButton>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  )
}
