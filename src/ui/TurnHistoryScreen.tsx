import { useState, type FormEvent } from 'react'
import { editTurn } from '../application'
import { DomainError, type Game, type Turn } from '../domain'
import type { GameStore } from '../persistence'
import {
  normalizeOptionalWord,
  playerNameById,
  turnsNewestFirst,
} from './activeGame'
import {
  appendScoreDigit,
  backspaceScore,
  clearScoreKeypad,
  emptyScoreKeypad,
  scoreKeypadFromInteger,
  toggleScoreSign,
  type ScoreKeypadState,
} from './scoreKeypad'
import { formatPlayerNames } from './gameList'
import {
  AppShell,
  Button,
  FormError,
  PlayerPickList,
  ScoreDisplay,
  ScoreKeypad,
  TextField,
  TopBar,
  TurnHistoryList,
} from './primitives'
import { strings } from './strings'

type TurnHistoryScreenProps = {
  store: GameStore
  gameId: string
  onBack: () => void
}

/**
 * Turn history for one game (T7.3 / D34 / D11).
 *
 * Newest first. While the game is in progress, tapping a row edits player,
 * score (same keypad as the turn form, D31), and optional word. A finished
 * game is read-only until it is reopened from the game menu. Back returns to
 * the open game.
 */
export function TurnHistoryScreen({
  store,
  gameId,
  onBack,
}: TurnHistoryScreenProps) {
  const [game, setGame] = useState<Game | null>(() => store.getById(gameId))
  const [editingTurnId, setEditingTurnId] = useState<string | null>(null)
  const [editPlayerId, setEditPlayerId] = useState('')
  const [editScore, setEditScore] = useState<ScoreKeypadState>(emptyScoreKeypad)
  const [editWordText, setEditWordText] = useState('')
  const [showEditValidation, setShowEditValidation] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  if (game === null) {
    return (
      <AppShell>
        <TopBar
          title={strings.appTitle}
          subtitle={strings.gameNotFound}
          backLabel={strings.back}
          onBack={onBack}
        />
      </AppShell>
    )
  }

  const finished = game.status === 'finished'
  const historyTurns = turnsNewestFirst(game.turns)
  const lastTurnId = game.turns[game.turns.length - 1]?.id ?? null

  const editScoreErrorMessage =
    showEditValidation && editScore.value === null
      ? strings.scoreRequired
      : undefined

  function clearEditState() {
    setEditingTurnId(null)
    setEditPlayerId('')
    setEditScore(emptyScoreKeypad())
    setEditWordText('')
    setShowEditValidation(false)
    setEditError(null)
  }

  function updateEditScore(
    reduce: (current: ScoreKeypadState) => ScoreKeypadState,
  ) {
    setEditError(null)
    setShowEditValidation(false)
    setEditScore(reduce)
  }

  function openEdit(turn: Turn) {
    setEditingTurnId(turn.id)
    setEditPlayerId(turn.playerId)
    setEditScore(scoreKeypadFromInteger(turn.score))
    setEditWordText(turn.word ?? '')
    setShowEditValidation(false)
    setEditError(null)
  }

  function handleSelectTurn(turnId: string) {
    if (finished) {
      return
    }
    if (editingTurnId === turnId) {
      clearEditState()
      return
    }
    const turn = game?.turns.find((entry) => entry.id === turnId)
    if (turn === undefined) {
      return
    }
    openEdit(turn)
  }

  function handleSaveEdit(event: FormEvent) {
    event.preventDefault()
    if (editingTurnId === null || finished) {
      return
    }
    if (editScore.value === null) {
      setShowEditValidation(true)
      return
    }

    setEditError(null)
    try {
      const updated = editTurn(store, gameId, editingTurnId, {
        playerId: editPlayerId,
        score: editScore.value,
        word: normalizeOptionalWord(editWordText),
      })
      setGame(updated)
      clearEditState()
    } catch (error) {
      if (error instanceof DomainError) {
        setEditError(strings.editFailed)
        return
      }
      throw error
    }
  }

  return (
    <AppShell>
      <TopBar
        title={strings.turnsHeading}
        subtitle={formatPlayerNames(game)}
        backLabel={strings.back}
        onBack={onBack}
      />

      <div className="mt-6 flex flex-col gap-4">
        {finished ? (
          <p className="text-sm text-ink-muted">{strings.turnsFinishedHint}</p>
        ) : null}

        {historyTurns.length === 0 ? (
          <p className="text-base text-ink-muted">{strings.noTurnsYet}</p>
        ) : (
          <TurnHistoryList
            heading={strings.turnsHeading}
            turns={historyTurns.map((turn) => ({
              id: turn.id,
              playerName: playerNameById(game.players, turn.playerId),
              score: turn.score,
              word: turn.word,
              isLast: turn.id === lastTurnId,
            }))}
            pointsLabel={strings.pointsLabel}
            noWordLabel={strings.noWordLabel}
            lastBadge={strings.lastTurnBadge}
            selectedId={editingTurnId}
            onSelect={handleSelectTurn}
            disabled={finished}
            editPanel={
              editingTurnId !== null && !finished ? (
                <form className="flex flex-col gap-3" onSubmit={handleSaveEdit}>
                  <PlayerPickList
                    name="edit-turn-player"
                    legend={strings.editPlayerLabel}
                    players={game.players}
                    value={editPlayerId}
                    onChange={(id) => {
                      setEditError(null)
                      setEditPlayerId(id)
                    }}
                  />
                  <ScoreDisplay
                    id="edit-turn-score"
                    label={strings.scoreLabel}
                    display={editScore.display}
                    emptyLabel={strings.scoreEmpty}
                    error={editScoreErrorMessage}
                  />
                  <ScoreKeypad
                    id="edit-turn-score-keypad"
                    label={strings.keypadLabel}
                    onDigit={(digit) =>
                      updateEditScore((current) => appendScoreDigit(current, digit))
                    }
                    onBackspace={() => updateEditScore(backspaceScore)}
                    onClear={() => updateEditScore(() => clearScoreKeypad())}
                    onToggleSign={() => updateEditScore(toggleScoreSign)}
                    toggleSignLabel={strings.keypadToggleSign}
                    backspaceLabel={strings.keypadBackspace}
                    clearHint={strings.keypadClearHint}
                  />
                  <TextField
                    id="edit-turn-word"
                    label={strings.wordLabel}
                    value={editWordText}
                    onChange={(value) => {
                      setEditError(null)
                      setEditWordText(value)
                    }}
                    autoComplete="off"
                    placeholder={strings.wordPlaceholder}
                  />
                  {editError ? <FormError>{editError}</FormError> : null}
                  <div className="flex flex-col gap-2">
                    <Button type="submit" variant="primary" fullWidth>
                      {strings.saveEdit}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      fullWidth
                      onClick={clearEditState}
                    >
                      {strings.cancel}
                    </Button>
                  </div>
                </form>
              ) : undefined
            }
          />
        )}
      </div>
    </AppShell>
  )
}
