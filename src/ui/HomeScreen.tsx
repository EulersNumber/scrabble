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
 * Home hub: branded first viewport with falling-tile atmosphere (T7.1 / P10 / P2).
 *
 * Product name stays hero-level; primary action is new game; continue and
 * history share the second row (D29). Visual chrome comes from tokens +
 * primitives (D27) — screens only arrange layout.
 */
export function HomeScreen({
  onNewGame,
  onContinueList,
  onHistory,
}: HomeScreenProps) {
  return (
    <AppShell atmosphere="hero">
      <ScreenHeader
        size="hero"
        tone="onBoard"
        title={strings.appTitle}
        subtitle={strings.homeSubtitle}
      />

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="col-span-2">
          <Button
            fullWidth
            size="hero"
            variant="inverse"
            onClick={onNewGame}
          >
            {strings.newGame}
          </Button>
        </div>
        <Button
          variant="inverseSecondary"
          fullWidth
          onClick={onContinueList}
        >
          {strings.continueSection}
        </Button>
        <Button variant="inverseSecondary" fullWidth onClick={onHistory}>
          {strings.historySection}
        </Button>
      </div>
    </AppShell>
  )
}
