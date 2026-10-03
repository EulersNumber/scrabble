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
  playerNameById,
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
  BottomActionBar,
  Button,
  ConfirmPanel,
  FormError,
  MenuSheet,
  PodiumStandings,
  ScoreDisplay,
  ScoreKeypad,
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
 * Single-player turn screen (T7.5 / T7.6 / D33 / D36).
 *
 * In progress: podium standings, the current player's name (not a picker),
 * score keypad, optional word, and the bottom bar (Kumoa, Ohi, Seuraava
 * pelaaja). A new turn is always for `currentPlayerId`. Finished games show
 * the podium as the final result, a read-only notice, and reopen — no keypad
 * or bar. History, finish, and delete stay in the top-bar menu (D34).
 */
export function ActiveGameScreen({
  store,
  gameId,
  onBack,
  onOpenTurns,
}: ActiveGameScreenProps) {
  const initial = store.getById(gameId)
  const [game, setGame] = useState<Game | null>(initial)
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
      <AppShell pad="compact">
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
  const currentName = playerNameById(game.players, game.currentPlayerId)
  const scoreErrorMessage =
    showValidation && scoreEntry.value === null
      ? strings.scoreRequired
      : undefined

  function resetEntry() {
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
    if (finished || game === null) {
      return
    }

    setSubmitError(null)
    try {
      const updated = recordTurn(store, gameId, {
        playerId: game.currentPlayerId,
        score,
        word: normalizeOptionalWord(wordText),
      })
      setGame(updated)
      resetEntry()
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
      resetEntry()
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
      resetEntry()
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
    <AppShell pad="compact">
      <div className="flex min-h-0 flex-1 flex-col">
        <TopBar
          title={formatPlayerNames(game)}
          subtitle={finished ? strings.gameFinishedSubtitle : undefined}
          backLabel={strings.back}
          onBack={onBack}
          menuLabel={strings.menuLabel}
          menuExpanded={menuOpen}
          menuControlsId={GAME_MENU_ID}
          onMenu={openMenu}
        />

        {finished ? (
          <div className="mt-4 flex flex-col gap-4">
            <PodiumStandings
              heading={strings.standingsHeading}
              standings={standings}
              pointsLabel={strings.pointsLabel}
              rankLabel={strings.rankLabel}
            />
            <p className="text-sm text-ink-muted">{strings.gameFinishedReadOnly}</p>
            <Button variant="primary" fullWidth onClick={handleReopen}>
              {strings.reopenGame}
            </Button>
            {reopenError ? <FormError>{reopenError}</FormError> : null}
          </div>
        ) : (
          <form
            className="mt-2 flex min-h-0 flex-1 flex-col gap-2"
            onSubmit={handleRecord}
          >
            <PodiumStandings
              heading={strings.standingsHeading}
              standings={standings}
              pointsLabel={strings.pointsLabel}
              rankLabel={strings.rankLabel}
              currentPlayerId={game.currentPlayerId}
            />

            <p className="truncate text-center font-display text-3xl font-semibold leading-tight text-ink">
              <span className="sr-only">{strings.currentTurn}</span>
              {currentName}
            </p>

            <ScoreDisplay
              id="turn-score"
              label={strings.scoreLabel}
              display={scoreEntry.display}
              emptyLabel={strings.scoreEmpty}
              error={scoreErrorMessage}
              density="compact"
            />
            <ScoreKeypad
              id="turn-score-keypad"
              label={strings.keypadLabel}
              fill
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
              density="compact"
              onChange={(value) => {
                setSubmitError(null)
                setWordText(value)
              }}
              autoComplete="off"
              placeholder={strings.wordPlaceholder}
            />

            {submitError ? <FormError>{submitError}</FormError> : null}
            {undoError ? <FormError>{undoError}</FormError> : null}

            <BottomActionBar
              undoLabel={strings.undoTurn}
              passLabel={strings.passTurn}
              nextLabel={strings.nextPlayer}
              undoDisabled={game.turns.length === 0}
              nextDisabled={scoreEntry.value === null}
              confirmingUndo={confirmUndo}
              undoConfirmPrompt={strings.undoConfirmPrompt}
              confirmUndoLabel={strings.confirmUndo}
              cancelUndoLabel={strings.cancel}
              onUndo={() => {
                setUndoError(null)
                setConfirmUndo(true)
              }}
              onPass={handlePass}
              onConfirmUndo={handleUndoConfirm}
              onCancelUndo={() => setConfirmUndo(false)}
              nextType="submit"
            />
          </form>
        )}
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
