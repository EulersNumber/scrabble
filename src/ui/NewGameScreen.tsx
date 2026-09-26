import { useState } from 'react'
import { createGame, listGames } from '../application'
import { DomainError } from '../domain'
import type { GameStore } from '../persistence'
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  orderNamesWithStarterFirst,
  playerNameKey,
  suggestPlayerNames,
  validateNewGameNames,
} from './newGameSetup'
import { AppShell, Button, ScreenHeader, TextField } from './primitives'
import { strings } from './strings'

type NewGameScreenProps = {
  store: GameStore
  onBack: () => void
  onCreated: (gameId: string) => void
}

/**
 * New-game screen: enter 2–4 names, pick who starts, create (T4.1, D25).
 *
 * Seating is rotated so the chosen starter is first before calling
 * `createGame`. Optional name chips come from past games (recent + frequent);
 * empty history shows no suggestions. Word autocomplete is out of scope.
 */
export function NewGameScreen({
  store,
  onBack,
  onCreated,
}: NewGameScreenProps) {
  const [nameFields, setNameFields] = useState<string[]>(['', ''])
  const [starterIndex, setStarterIndex] = useState<number | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showValidation, setShowValidation] = useState(false)

  const validation = validateNewGameNames(nameFields)
  const filledNames = validation.ok ? validation.names : []

  const enteredKeys = new Set(
    nameFields
      .map((name) => playerNameKey(name))
      .filter((key) => key.length > 0),
  )
  const suggestions = suggestPlayerNames(listGames(store)).filter(
    (name) => !enteredKeys.has(playerNameKey(name)),
  )

  const validationMessage = (() => {
    if (!showValidation || validation.ok) {
      return null
    }
    if (validation.reason === 'too_few') {
      return strings.newGameTooFewPlayers
    }
    if (validation.reason === 'too_many') {
      return strings.newGameTooManyPlayers
    }
    return strings.newGameDuplicateNames
  })()

  function updateName(index: number, value: string) {
    setSubmitError(null)
    setNameFields((prev) => prev.map((name, i) => (i === index ? value : name)))
    // Starter index refers to filled-name list; clear when fields change.
    setStarterIndex(null)
  }

  function addPlayerSlot() {
    setSubmitError(null)
    setNameFields((prev) =>
      prev.length >= MAX_PLAYERS ? prev : [...prev, ''],
    )
    setStarterIndex(null)
  }

  function removePlayerSlot(index: number) {
    setSubmitError(null)
    setNameFields((prev) => {
      if (prev.length <= MIN_PLAYERS) {
        return prev
      }
      return prev.filter((_, i) => i !== index)
    })
    setStarterIndex(null)
  }

  function applySuggestion(name: string) {
    setSubmitError(null)
    setNameFields((prev) => {
      const emptyIndex = prev.findIndex((field) => field.trim().length === 0)
      if (emptyIndex >= 0) {
        return prev.map((field, i) => (i === emptyIndex ? name : field))
      }
      if (prev.length < MAX_PLAYERS) {
        return [...prev, name]
      }
      return prev
    })
    setStarterIndex(null)
  }

  function handleStart() {
    setShowValidation(true)
    setSubmitError(null)

    const result = validateNewGameNames(nameFields)
    if (!result.ok) {
      return
    }
    if (starterIndex === null || starterIndex >= result.names.length) {
      setSubmitError(strings.newGamePickStarter)
      return
    }

    try {
      const seated = orderNamesWithStarterFirst(result.names, starterIndex)
      const game = createGame(store, seated)
      onCreated(game.id)
    } catch (error) {
      if (error instanceof DomainError) {
        setSubmitError(strings.newGameCreateFailed)
        return
      }
      throw error
    }
  }

  return (
    <AppShell>
      <Button variant="ghost" onClick={onBack}>
        {strings.back}
      </Button>
      <ScreenHeader
        title={strings.newGame}
        subtitle={strings.newGameSubtitle}
      />

      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          handleStart()
        }}
      >
        <ol className="flex flex-col gap-4">
          {nameFields.map((name, index) => (
            <li key={index} className="flex flex-col gap-2">
              <TextField
                id={`player-name-${index}`}
                label={strings.playerNameLabel(index + 1)}
                value={name}
                onChange={(value) => updateName(index, value)}
                autoComplete="off"
                spellCheck={false}
              />
              {nameFields.length > MIN_PLAYERS ? (
                <Button
                  variant="ghost"
                  onClick={() => removePlayerSlot(index)}
                >
                  {strings.removePlayer}
                </Button>
              ) : null}
            </li>
          ))}
        </ol>

        {nameFields.length < MAX_PLAYERS ? (
          <Button variant="secondary" fullWidth onClick={addPlayerSlot}>
            {strings.addPlayer}
          </Button>
        ) : null}

        {suggestions.length > 0 ? (
          <section aria-labelledby="name-suggestions-heading">
            <h2
              id="name-suggestions-heading"
              className="text-sm font-medium text-ink-muted"
            >
              {strings.nameSuggestions}
            </h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    className="rounded-control border border-line bg-panel px-3 py-2 text-base text-ink active:bg-board-soft hover:bg-board-soft"
                    onClick={() => applySuggestion(suggestion)}
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {validation.ok ? (
          <fieldset className="mt-2 rounded-control border border-line bg-panel px-4 py-4">
            <legend className="px-1 text-base font-medium text-ink">
              {strings.whoStarts}
            </legend>
            <p className="mb-3 text-sm text-ink-muted">
              {strings.whoStartsHint}
            </p>
            <ul className="flex flex-col gap-2">
              {filledNames.map((name, index) => {
                const inputId = `starter-${index}`
                return (
                  <li key={name}>
                    <label
                      htmlFor={inputId}
                      className="flex cursor-pointer items-center gap-3 rounded-control px-1 py-2"
                    >
                      <input
                        id={inputId}
                        type="radio"
                        name="starter"
                        checked={starterIndex === index}
                        onChange={() => {
                          setSubmitError(null)
                          setStarterIndex(index)
                        }}
                        className="size-5 accent-board"
                      />
                      <span className="text-lg text-ink">{name}</span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </fieldset>
        ) : null}

        {validationMessage ? (
          <p className="text-sm text-red-800" role="alert">
            {validationMessage}
          </p>
        ) : null}
        {submitError ? (
          <p className="text-sm text-red-800" role="alert">
            {submitError}
          </p>
        ) : null}

        <Button type="submit" fullWidth>
          {strings.startGame}
        </Button>
      </form>
    </AppShell>
  )
}
