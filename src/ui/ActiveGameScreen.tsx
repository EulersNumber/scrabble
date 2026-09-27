import { useState, type FormEvent } from 'react'
import {
  deleteGame,
  editTurn,
  finishGame,
  recordTurn,
  reopenGame,
  undoLastTurn,
} from '../application'
import { DomainError, getStandings, type Game, type Turn } from '../domain'
import type { GameStore } from '../persistence'
import {
  nextSeatPlayer,
  normalizeOptionalWord,
  parseScoreInput,
  playerNameById,
  turnsNewestFirst,
} from './activeGame'
import { formatPlayerNames } from './gameList'
import {
  AppShell,
  Button,
  CompactStandingsBanner,
  ConfirmPanel,
  FormError,
  PlayerPickList,
  ScreenHeader,
  SecondarySheet,
  TextField,
  TurnHistoryList,
} from './primitives'
import { strings } from './strings'

type ActiveGameScreenProps = {
  store: GameStore
  gameId: string
  onBack: () => void
}

/**
 * Turn-focused active-game screen (T7.3, plus T4.2–T4.4 / T7.2 flows).
 *
 * First viewport: compact standings, this turn’s player / score / pass, optional
 * word tucked behind a secondary control, and a soft-rotation “next” hint (D13).
 * History, undo, finish, and delete live in a secondary sheet so they do not
 * dominate scoring. Domain soft rotation is unchanged; keypad entry is T7.4.
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
  const [showWordField, setShowWordField] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [sheetOpen, setSheetOpen] = useState(false)

  const [confirmUndo, setConfirmUndo] = useState(false)
  const [undoError, setUndoError] = useState<string | null>(null)

  const [editingTurnId, setEditingTurnId] = useState<string | null>(null)
  const [editPlayerId, setEditPlayerId] = useState('')
  const [editScoreText, setEditScoreText] = useState('')
  const [editWordText, setEditWordText] = useState('')
  const [showEditValidation, setShowEditValidation] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const [confirmFinish, setConfirmFinish] = useState(false)
  const [finishError, setFinishError] = useState<string | null>(null)
  const [reopenError, setReopenError] = useState<string | null>(null)

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

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

  const editScoreParse = parseScoreInput(editScoreText)
  const editScoreErrorMessage = (() => {
    if (!showEditValidation || editScoreParse.ok) {
      return undefined
    }
    if (editScoreParse.reason === 'empty') {
      return strings.scoreRequired
    }
    if (editScoreParse.reason === 'out_of_range') {
      return strings.scoreOutOfRange
    }
    return strings.scoreNotInteger
  })()

  const historyTurns = turnsNewestFirst(game.turns)
  const lastTurnId = game.turns[game.turns.length - 1]?.id ?? null
  const nextAfterSelected = nextSeatPlayer(game.players, playerId)

  function resetAddForm(nextGame: Game) {
    setPlayerId(nextGame.currentPlayerId)
    setScoreText('')
    setWordText('')
    setShowWordField(false)
    setShowValidation(false)
    setSubmitError(null)
  }

  function clearEditState() {
    setEditingTurnId(null)
    setEditPlayerId('')
    setEditScoreText('')
    setEditWordText('')
    setShowEditValidation(false)
    setEditError(null)
  }

  function closeSheet() {
    setSheetOpen(false)
    setConfirmUndo(false)
    setConfirmFinish(false)
    setConfirmDelete(false)
    clearEditState()
  }

  function openSheet() {
    setSheetOpen(true)
  }

  function openEdit(turn: Turn) {
    setConfirmUndo(false)
    setUndoError(null)
    setConfirmFinish(false)
    setFinishError(null)
    setConfirmDelete(false)
    setDeleteError(null)
    setSheetOpen(true)
    setEditingTurnId(turn.id)
    setEditPlayerId(turn.playerId)
    setEditScoreText(String(turn.score))
    setEditWordText(turn.word ?? '')
    setShowEditValidation(false)
    setEditError(null)
  }

  function handleSelectTurn(turnId: string) {
    if (game === null || finished) {
      return
    }
    if (editingTurnId === turnId) {
      clearEditState()
      return
    }
    const turn = game.turns.find((entry) => entry.id === turnId)
    if (turn === undefined) {
      return
    }
    openEdit(turn)
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
      resetAddForm(updated)
      setConfirmUndo(false)
      setUndoError(null)
      setConfirmFinish(false)
      setFinishError(null)
      setConfirmDelete(false)
      setDeleteError(null)
      clearEditState()
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

  function handleUndoConfirm() {
    setUndoError(null)
    try {
      const updated = undoLastTurn(store, gameId)
      setGame(updated)
      resetAddForm(updated)
      setConfirmUndo(false)
      if (editingTurnId !== null && lastTurnId === editingTurnId) {
        clearEditState()
      } else if (
        editingTurnId !== null &&
        !updated.turns.some((turn) => turn.id === editingTurnId)
      ) {
        clearEditState()
      }
    } catch (error) {
      if (error instanceof DomainError) {
        setUndoError(strings.undoFailed)
        setConfirmUndo(false)
        return
      }
      throw error
    }
  }

  function handleSaveEdit(event: FormEvent) {
    event.preventDefault()
    if (editingTurnId === null || finished) {
      return
    }
    setShowEditValidation(true)
    if (!editScoreParse.ok) {
      return
    }

    setEditError(null)
    try {
      const updated = editTurn(store, gameId, editingTurnId, {
        playerId: editPlayerId,
        score: editScoreParse.score,
        word: normalizeOptionalWord(editWordText),
      })
      setGame(updated)
      resetAddForm(updated)
      clearEditState()
    } catch (error) {
      if (error instanceof DomainError) {
        setEditError(strings.editFailed)
        return
      }
      throw error
    }
  }

  function handleFinishConfirm() {
    setFinishError(null)
    try {
      const updated = finishGame(store, gameId)
      setGame(updated)
      setConfirmFinish(false)
      setConfirmUndo(false)
      setUndoError(null)
      setConfirmDelete(false)
      setDeleteError(null)
      clearEditState()
      setSubmitError(null)
      setReopenError(null)
      setSheetOpen(false)
    } catch (error) {
      if (error instanceof DomainError) {
        setFinishError(strings.finishFailed)
        setConfirmFinish(false)
        return
      }
      throw error
    }
  }

  function handleReopen() {
    setReopenError(null)
    try {
      const updated = reopenGame(store, gameId)
      setGame(updated)
      resetAddForm(updated)
      setFinishError(null)
      setConfirmFinish(false)
      setConfirmDelete(false)
      setDeleteError(null)
    } catch (error) {
      if (error instanceof DomainError) {
        setReopenError(strings.reopenFailed)
        return
      }
      throw error
    }
  }

  function handleDeleteConfirm() {
    try {
      deleteGame(store, gameId)
      setConfirmDelete(false)
      setDeleteError(null)
      onBack()
    } catch {
      setDeleteError(strings.deleteFailed)
      setConfirmDelete(false)
    }
  }

  const headerSubtitle = finished
    ? `${strings.gameFinishedSubtitle} · ${strings.turnsCount(game.turns.length)}`
    : strings.turnsCount(game.turns.length)

  const historySection =
    game.turns.length > 0 ? (
      <div className="flex flex-col gap-3">
        {!finished ? (
          confirmUndo ? (
            <ConfirmPanel
              prompt={strings.undoConfirmPrompt}
              confirmLabel={strings.confirmUndo}
              cancelLabel={strings.cancel}
              onConfirm={handleUndoConfirm}
              onCancel={() => setConfirmUndo(false)}
            />
          ) : (
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setUndoError(null)
                setConfirmFinish(false)
                setConfirmDelete(false)
                setConfirmUndo(true)
              }}
            >
              {strings.undoLast}
            </Button>
          )
        ) : null}

        {undoError ? <FormError>{undoError}</FormError> : null}

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
                <TextField
                  id="edit-turn-score"
                  label={strings.scoreLabel}
                  value={editScoreText}
                  onChange={(value) => {
                    setEditError(null)
                    setEditScoreText(value)
                  }}
                  error={editScoreErrorMessage}
                  inputMode="numeric"
                  autoComplete="off"
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
      </div>
    ) : (
      <p className="text-sm text-ink-muted">{strings.noTurnsYet}</p>
    )

  const finishSection = !finished ? (
    <div className="flex flex-col gap-3">
      {confirmFinish ? (
        <ConfirmPanel
          prompt={strings.finishConfirmPrompt}
          confirmLabel={strings.confirmFinish}
          cancelLabel={strings.cancel}
          onConfirm={handleFinishConfirm}
          onCancel={() => setConfirmFinish(false)}
        />
      ) : (
        <Button
          variant="secondary"
          fullWidth
          onClick={() => {
            setFinishError(null)
            setConfirmUndo(false)
            setConfirmDelete(false)
            clearEditState()
            setConfirmFinish(true)
          }}
        >
          {strings.finishGame}
        </Button>
      )}
      {finishError ? <FormError>{finishError}</FormError> : null}
    </div>
  ) : null

  const deleteSection = (
    <div className="flex flex-col gap-3">
      {confirmDelete ? (
        <ConfirmPanel
          prompt={strings.deleteConfirmPrompt}
          confirmLabel={strings.confirmDelete}
          cancelLabel={strings.cancel}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setConfirmDelete(false)
            setDeleteError(null)
          }}
        />
      ) : (
        <Button
          variant="ghost"
          onClick={() => {
            setDeleteError(null)
            setConfirmUndo(false)
            setConfirmFinish(false)
            clearEditState()
            setConfirmDelete(true)
          }}
        >
          {strings.deleteGame}
        </Button>
      )}
      {deleteError ? <FormError>{deleteError}</FormError> : null}
    </div>
  )

  return (
    <>
      <AppShell>
        <Button variant="ghost" onClick={onBack}>
          {strings.back}
        </Button>

        <ScreenHeader
          title={formatPlayerNames(game)}
          subtitle={headerSubtitle}
        />

        <div className="mt-4 flex flex-col gap-5">
          <CompactStandingsBanner
            label={strings.standingsBannerLabel}
            standings={standings}
            pointsLabel={strings.pointsLabel}
            highlightId={finished ? undefined : game.currentPlayerId}
          />

          {finished ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-ink-muted">
                {strings.gameFinishedReadOnly}
              </p>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleReopen}
              >
                {strings.reopenGame}
              </Button>
              {reopenError ? <FormError>{reopenError}</FormError> : null}
            </div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleRecord}>
              <PlayerPickList
                name="add-turn-player"
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

              {nextAfterSelected ? (
                <p className="-mt-2 text-sm text-ink-muted">
                  {strings.nextPlayerHint(nextAfterSelected.name)}
                </p>
              ) : null}

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

              {showWordField || wordText.trim() !== '' ? (
                <div className="flex flex-col gap-2">
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
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setWordText('')
                      setShowWordField(false)
                    }}
                  >
                    {strings.hideWord}
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowWordField(true)}
                >
                  {strings.addWord}
                </Button>
              )}

              {submitError ? <FormError>{submitError}</FormError> : null}

              <div className="flex flex-col gap-3">
                <Button type="submit" variant="primary" size="lg" fullWidth>
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

          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              openSheet()
            }}
          >
            {strings.openSecondarySheet(game.turns.length)}
          </Button>
        </div>
      </AppShell>

      <SecondarySheet
        open={sheetOpen}
        title={strings.secondarySheetTitle}
        closeLabel={strings.closeSheet}
        onClose={closeSheet}
      >
        {historySection}
        {finishSection}
        {deleteSection}
      </SecondarySheet>
    </>
  )
}
