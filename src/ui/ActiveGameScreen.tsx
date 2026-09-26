import { useState, type FormEvent } from 'react'
import { recordTurn } from '../application'
import { DomainError, getStandings, type Game } from '../domain'
import type { GameStore } from '../persistence'
import {
  normalizeOptionalWord,
  parseScoreInput,
} from './activeGame'
import { formatPlayerNames } from './gameList'
import {
  AppShell,
  Button,
  FormError,
  PlayerPickList,
  ScreenHeader,
  StandingsList,
  TextField,
} from './primitives'
import { strings } from './strings'

type ActiveGameScreenProps = {
  store: GameStore
  gameId: string
  onBack: () => void
}

/**
 * Active-game screen: standings + add turn with soft rotation (T4.2, D13).
 *
 * Highlights the suggested current player but allows logging any seat. Score
 * is an integer (0 = pass); word is optional. Standings recompute from turns
 * after each save. Undo/edit and finish belong to later tasks.
 */
export function ActiveGameScreen({
  store,
  gameId,
  onBack,
}: ActiveGameScreenProps) {
  const initial = store.getById(gameId)
  const [game, setGame] = useState<Game | null>(initial)
  const [playerId, setPlayerId] = useState(
    () => initial?.currentPlayerId ?? '',
  )
  const [scoreText, setScoreText] = useState('')
  const [wordText, setWordText] = useState('')
  const [showValidation, setShowValidation] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  if (game === null) {
    return (
      <AppShell>
        <Button variant="ghost" onClick={onBack}>
          {strings.back}
        </Button>
        <ScreenHeader
          title={strings.appTitle}
          subtitle={strings.gameNotFound}
        />
      </AppShell>
    )
  }

  const standings = getStandings(game)
  const finished = game.status === 'finished'
  const scoreParse = parseScoreInput(scoreText)
  const scoreErrorMessage = (() => {
    if (!showValidation || scoreParse.ok) {
      return undefined
    }
    if (scoreParse.reason === 'empty') {
      return strings.scoreRequired
    }
    if (scoreParse.reason === 'out_of_range') {
      return strings.scoreOutOfRange
    }
    return strings.scoreNotInteger
  })()

  function resetForm(nextGame: Game) {
    setPlayerId(nextGame.currentPlayerId)
    setScoreText('')
    setWordText('')
    setShowValidation(false)
    setSubmitError(null)
  }

  function submitScore(score: number) {
    if (finished) {
      return
    }

    setSubmitError(null)
    try {
      const updated = recordTurn(store, gameId, {
        playerId,
        score,
        word: normalizeOptionalWord(wordText),
      })
      setGame(updated)
      resetForm(updated)
    } catch (error) {
      if (error instanceof DomainError) {
        setSubmitError(strings.recordTurnFailed)
        return
      }
      throw error
    }
  }

  function handleRecord(event: FormEvent) {
    event.preventDefault()
    setShowValidation(true)
    if (!scoreParse.ok) {
      return
    }
    submitScore(scoreParse.score)
  }

  function handlePass() {
    setShowValidation(false)
    submitScore(0)
  }

  return (
    <AppShell>
      <Button variant="ghost" onClick={onBack}>
        {strings.back}
      </Button>

      <ScreenHeader
        title={formatPlayerNames(game)}
        subtitle={strings.turnsCount(game.turns.length)}
      />

      <div className="mt-6 flex flex-col gap-6">
        <StandingsList
          heading={strings.standingsHeading}
          standings={standings}
          pointsLabel={strings.pointsLabel}
          rankLabel={strings.rankLabel}
        />

        {finished ? (
          <FormError>{strings.gameFinishedReadOnly}</FormError>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleRecord}>
            <PlayerPickList
              legend={strings.whoseTurn}
              hint={strings.whoseTurnHint}
              players={game.players}
              value={playerId}
              suggestedId={game.currentPlayerId}
              suggestedBadge={strings.suggestedBadge}
              onChange={(id) => {
                setSubmitError(null)
                setPlayerId(id)
              }}
            />

            <TextField
              id="turn-score"
              label={strings.scoreLabel}
              value={scoreText}
              onChange={(value) => {
                setSubmitError(null)
                setScoreText(value)
              }}
              error={scoreErrorMessage}
              inputMode="numeric"
              autoComplete="off"
              placeholder="0"
            />
            <p className="-mt-2 text-sm text-ink-muted">{strings.scoreHint}</p>

            <TextField
              id="turn-word"
              label={strings.wordLabel}
              value={wordText}
              onChange={(value) => {
                setSubmitError(null)
                setWordText(value)
              }}
              autoComplete="off"
              placeholder={strings.wordPlaceholder}
            />

            {submitError ? <FormError>{submitError}</FormError> : null}

            <div className="flex flex-col gap-3">
              <Button type="submit" variant="primary" fullWidth>
                {strings.recordTurn}
              </Button>
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={handlePass}
              >
                {strings.passTurn}
              </Button>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  )
}
