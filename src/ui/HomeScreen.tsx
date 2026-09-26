import {
  AppShell,
  Button,
  ScreenHeader,
} from './primitives'
import { strings } from './strings'

type HomeScreenProps = {
  onNewGame: () => void
  onContinueList: () => void
  onHistory: () => void
}

/**
 * Home hub: primary new-game action plus secondary continue and history
 * entry points (T4.0 / T4.5, D17).
 *
 * Lists live on their own screens so home stays focused on starting a sitting.
 * Layout/chrome uses shared UI primitives (D27).
 */
export function HomeScreen({
  onNewGame,
  onContinueList,
  onHistory,
}: HomeScreenProps) {
  return (
    <AppShell>
      <ScreenHeader
        size="hero"
        title={strings.appTitle}
        subtitle={strings.homeSubtitle}
      />

      <div className="mt-2 flex flex-col gap-3 md:mt-4">
        <Button fullWidth onClick={onNewGame}>
          {strings.newGame}
        </Button>
        <Button variant="secondary" fullWidth onClick={onContinueList}>
          {strings.continueSection}
        </Button>
        <Button variant="secondary" fullWidth onClick={onHistory}>
          {strings.historySection}
        </Button>
      </div>
    </AppShell>
  )
}
