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
 * Shares the light sage-green shell family with continue/history. Product name
 * stays hero-level; primary action is new game; continue and history share the
 * second row (D29). Visual chrome comes from tokens + primitives (D27).
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
        title={strings.appTitle}
        subtitle={strings.homeSubtitle}
      />

      <div className="grid grid-cols-2 gap-3 md:gap-4">
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
