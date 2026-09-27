import { useState, type FormEvent } from 'react'
import {
  deleteGame,
  finishGame,
  recordTurn,
  reopenGame,
  undoLastTurn,
} from '../application'
import { DomainError, getStandings, type Game } from '../domain'
import type { GameStore } from '../persistence'
import {
  gameMenuActions,
  normalizeOptionalWord,
  type GameMenuAction,
} from './activeGame'
import {
  appendScoreDigit,
  backspaceScore,
  clearScoreKeypad,
  emptyScoreKeypad,
  toggleScoreSign,
  type ScoreKeypadState,
} from './scoreKeypad'
import { formatPlayerNames } from './gameList'
import {
  AppShell,
  Button,
  ConfirmPanel,
  FormError,
  MenuSheet,
  PlayerPickList,
  ScoreDisplay,
  ScoreKeypad,
  StandingsList,
  TextField,
  TopBar,
  type MenuSheetItem,
} from './primitives'
import { strings } from './strings'

const GAME_MENU_ID = 'game-menu'

type MenuConfirm = 'finish' | 'delete' | null

type ActiveGameScreenProps = {
  store: GameStore
  gameId: string
  onBack: () => void
  /** Opens the turn-history screen (T7.3). */
  onOpenTurns: () => void
}

/**
 * Active-game screen: standings, add turn, and undo (T4.2–T4.4, T7.3).
 *
 * Highlights the suggested current player but still allows logging any seat
 * until strict rotation (D36 / T7.5). Points use the on-screen keypad (D31);
 * pass stays the separate zero button (D33). Word is optional. History,
 * finish, reopen, and delete live in the top-bar menu (D34 / D30). Undo last
 * stays here with a short confirm.
 */
export function ActiveGameScreen({
  store,
  gameId,
  onBack,
  onOpenTurns,
}: ActiveGameScreenProps) {
  const initial = store.getById(gameId)
  const [game, setGame] = useState<Game | null>(initial)
  const [playerId, setPlayerId] = useState(
    () => initial?.currentPlayerId ?? '',
  )
  const [scoreEntry, setScoreEntry] = useState<ScoreKeypadState>(emptyScoreKeypad)
  const [wordText, setWordText] = useState('')
  const [showValidation, setShowValidation] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [confirmUndo, setConfirmUndo] = useState(false)
  const [undoError, setUndoError] = useState<string | null>(null)

  const [menuOpen, setMenuOpen] = useState(false)
  const [menuConfirm, setMenuConfirm] = useState<MenuConfirm>(null)
  const [finishError, setFinishError] = useState<string | null>(null)
  const [reopenError, setReopenError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

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

  const standings = getStandings(game)
  const finished = game.status === 'finished'
  const scoreErrorMessage =
    showValidation && scoreEntry.value === null
      ? strings.scoreRequired
      : undefined

  function resetAddForm(nextGame: Game) {
    setPlayerId(nextGame.currentPlayerId)
    setScoreEntry(emptyScoreKeypad())
    setWordText('')
    setShowValidation(false)
    setSubmitError(null)
  }

  function updateScore(reduce: (current: ScoreKeypadState) => ScoreKeypadState) {
    setSubmitError(null)
    setShowValidation(false)
    setScoreEntry(reduce)
  }

  function closeMenu() {
    setMenuOpen(false)
    setMenuConfirm(null)
  }

  function openMenu() {
    setConfirmUndo(false)
    setUndoError(null)
    setFinishError(null)
    setReopenError(null)
    setDeleteError(null)
    setMenuConfirm(null)
    setMenuOpen(true)
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
    if (scoreEntry.value === null) {
      setShowValidation(true)
      return
    }
    submitScore(scoreEntry.value)
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
    } catch (error) {
      if (error instanceof DomainError) {
        setUndoError(strings.undoFailed)
        setConfirmUndo(false)
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
      setConfirmUndo(false)
      setUndoError(null)
      setSubmitError(null)
      setReopenError(null)
      closeMenu()
    } catch (error) {
      if (error instanceof DomainError) {
        setFinishError(strings.finishFailed)
        setMenuConfirm(null)
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
      closeMenu()
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
      closeMenu()
      onBack()
    } catch {
      setDeleteError(strings.deleteFailed)
      setMenuConfirm(null)
    }
  }

  function menuItem(action: GameMenuAction): MenuSheetItem {
    switch (action) {
      case 'turns':
        return {
          id: action,
          label: strings.turnsHeading,
          onSelect: () => {
            closeMenu()
            onOpenTurns()
          },
        }
      case 'finish':
        return {
          id: action,
          label: strings.finishGame,
          onSelect: () => {
            setFinishError(null)
            setMenuConfirm('finish')
          },
        }
      case 'reopen':
        return {
          id: action,
          label: strings.reopenGame,
          onSelect: handleReopen,
        }
      case 'delete':
        return {
          id: action,
          label: strings.deleteGame,
          tone: 'danger',
          onSelect: () => {
            setDeleteError(null)
            setMenuConfirm('delete')
          },
        }
    }
  }

  const menuNotice = finishError ?? deleteError ?? reopenError
  const headerSubtitle = finished
    ? `${strings.gameFinishedSubtitle} · ${strings.turnsCount(game.turns.length)}`
    : strings.turnsCount(game.turns.length)

  const confirmPanel =
    menuConfirm === 'finish' ? (
      <div className="mt-4">
        <ConfirmPanel
          prompt={strings.finishConfirmPrompt}
          confirmLabel={strings.confirmFinish}
          cancelLabel={strings.cancel}
          onConfirm={handleFinishConfirm}
          onCancel={() => setMenuConfirm(null)}
        />
      </div>
    ) : menuConfirm === 'delete' ? (
      <div className="mt-4">
        <ConfirmPanel
          prompt={strings.deleteConfirmPrompt}
          confirmLabel={strings.confirmDelete}
          cancelLabel={strings.cancel}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setMenuConfirm(null)}
        />
      </div>
    ) : undefined

  return (
    <AppShell>
      <TopBar
        title={formatPlayerNames(game)}
        subtitle={headerSubtitle}
        backLabel={strings.back}
        onBack={onBack}
        menuLabel={strings.menuLabel}
        menuExpanded={menuOpen}
        menuControlsId={GAME_MENU_ID}
        onMenu={openMenu}
      />

      <div className="mt-6 flex flex-col gap-6">
        <StandingsList
          heading={strings.standingsHeading}
          standings={standings}
          pointsLabel={strings.pointsLabel}
          rankLabel={strings.rankLabel}
        />

        {finished ? (
          <p className="text-sm text-ink-muted">{strings.gameFinishedReadOnly}</p>
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

            <ScoreDisplay
              id="turn-score"
              label={strings.scoreLabel}
              display={scoreEntry.display}
              emptyLabel={strings.scoreEmpty}
              error={scoreErrorMessage}
            />
            <p className="-mt-2 text-sm text-ink-muted">{strings.scoreHint}</p>
            <ScoreKeypad
              id="turn-score-keypad"
              label={strings.keypadLabel}
              onDigit={(digit) =>
                updateScore((current) => appendScoreDigit(current, digit))
              }
              onBackspace={() => updateScore(backspaceScore)}
              onClear={() => updateScore(() => clearScoreKeypad())}
              onToggleSign={() => updateScore(toggleScoreSign)}
              toggleSignLabel={strings.keypadToggleSign}
              backspaceLabel={strings.keypadBackspace}
              clearHint={strings.keypadClearHint}
            />

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

        {!finished && game.turns.length > 0 ? (
          <div className="flex flex-col gap-3">
            {confirmUndo ? (
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
                  setConfirmUndo(true)
                }}
              >
                {strings.undoLast}
              </Button>
            )}
            {undoError ? <FormError>{undoError}</FormError> : null}
          </div>
        ) : null}
      </div>

      <MenuSheet
        id={GAME_MENU_ID}
        open={menuOpen}
        title={
          menuConfirm === 'finish'
            ? strings.finishGame
            : menuConfirm === 'delete'
              ? strings.deleteGame
              : strings.gameMenuTitle
        }
        closeLabel={strings.closeMenu}
        onClose={closeMenu}
        items={gameMenuActions(game.status).map(menuItem)}
        panel={confirmPanel}
        focusKey={menuConfirm ?? 'menu'}
        notice={menuNotice ? <FormError>{menuNotice}</FormError> : undefined}
      />
    </AppShell>
  )
}
