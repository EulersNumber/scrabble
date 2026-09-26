import type { GameStore } from '../persistence'
import { formatPlayerNames } from './gameList'
import { AppShell, Button, ScreenHeader } from './primitives'
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
    <AppShell>
      <Button variant="ghost" onClick={onBack}>
        {strings.back}
      </Button>

      {game === null ? (
        <ScreenHeader
          title={strings.appTitle}
          subtitle={strings.gameNotFound}
        />
      ) : (
        <>
          <ScreenHeader
            title={formatPlayerNames(game)}
            subtitle={strings.activeGameComingSoon}
          />
          <p className="mt-2 text-sm text-ink-muted">
            {strings.turnsCount(game.turns.length)}
          </p>
        </>
      )}
    </AppShell>
  )
}
