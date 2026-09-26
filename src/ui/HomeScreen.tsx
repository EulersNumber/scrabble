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
 * entry points (T4.0 / T4.5, D17, D29).
 *
 * Layout is a 2×2-style grid: new game spans the top row; continue and
 * history share the second row so starting a sitting stays visually dominant.
 * Lists live on their own screens. Layout/chrome uses shared UI primitives (D27).
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

      <div className="mt-2 grid grid-cols-2 gap-3 md:mt-4 md:gap-4">
        <div className="col-span-2">
          <Button fullWidth size="hero" onClick={onNewGame}>
            {strings.newGame}
          </Button>
        </div>
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
