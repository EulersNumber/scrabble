import { AppShell, Button, ScreenHeader } from './primitives'
import { strings } from './strings'

type NewGameScreenProps = {
  onBack: () => void
}

/**
 * Placeholder new-game screen until T4.1 (name entry + starter pick).
 *
 * Home “Uusi peli” navigates here so T4.0 continue/new-game routing works.
 */
export function NewGameScreen({ onBack }: NewGameScreenProps) {
  return (
    <AppShell>
      <Button variant="ghost" onClick={onBack}>
        {strings.back}
      </Button>
      <ScreenHeader
        title={strings.newGame}
        subtitle={strings.newGameComingSoon}
      />
    </AppShell>
  )
}
