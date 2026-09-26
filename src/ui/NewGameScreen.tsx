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
    <main className="mx-auto flex min-h-svh w-full max-w-lg flex-col bg-stone-100 px-4 py-8 text-stone-900">
      <button
        type="button"
        onClick={onBack}
        className="self-start text-base font-medium text-stone-700 underline-offset-2 hover:underline"
      >
        {strings.back}
      </button>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">{strings.newGame}</h1>
      <p className="mt-3 text-stone-600">{strings.newGameComingSoon}</p>
    </main>
  )
}
