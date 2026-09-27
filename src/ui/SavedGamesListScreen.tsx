import { useState } from 'react'
import { deleteGame, listGames } from '../application'
import type { Game } from '../domain'
import type { GameStore } from '../persistence'
import {
  formatGameCreatedAt,
  formatPlayerNames,
} from './gameList'
import {
  AppShell,
  Button,
  ConfirmPanel,
  FormError,
  ListRowButton,
  ScreenHeader,
} from './primitives'
import { strings } from './strings'

type SavedGamesListScreenProps = {
  store: GameStore
  title: string
  emptyMessage: string
  openLabel: string
  /**
   * Selects and orders games for this list (continue vs history).
   *
   * @param games - All saved games from `listGames`
   */
  selectGames: (games: readonly Game[]) => Game[]
  /**
   * Timestamp shown under the player names (created vs finished).
   *
   * @param game - Listed game
   */
  dateIsoForGame: (game: Game) => string
  onBack: () => void
  onOpen: (gameId: string) => void
}

/**
 * Shared list screen for continue and history (T4.5).
 *
 * Shows selectable game rows plus delete with confirm (D29).
 * Open-game delete lives on ActiveGameScreen (D30 / T7.2).
 * Visual chrome comes from primitives (D27); callers pass Finnish titles and
 * the filter/sort helper for in-progress vs finished.
 */
export function SavedGamesListScreen({
  store,
  title,
  emptyMessage,
  openLabel,
  selectGames,
  dateIsoForGame,
  onBack,
  onOpen,
}: SavedGamesListScreenProps) {
  const [, setListRevision] = useState(0)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Re-render after delete re-reads the store (no subscription API).
  const games = selectGames(listGames(store))

  function handleConfirmDelete() {
    if (pendingDeleteId === null) {
      return
    }
    try {
      deleteGame(store, pendingDeleteId)
      setPendingDeleteId(null)
      setDeleteError(null)
      setListRevision((value) => value + 1)
    } catch {
      setDeleteError(strings.deleteFailed)
    }
  }

  return (
    <AppShell>
      <Button variant="ghost" onClick={onBack}>
        {strings.back}
      </Button>

      <ScreenHeader title={title} />

      {deleteError !== null ? (
        <div className="mt-4">
          <FormError>{deleteError}</FormError>
        </div>
      ) : null}

      {games.length === 0 ? (
        <p className="mt-6 text-ink-muted">{emptyMessage}</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {games.map((game) => (
            <li key={game.id} className="flex flex-col gap-2">
              <ListRowButton onClick={() => onOpen(game.id)}>
                <span className="font-medium text-ink">
                  {formatPlayerNames(game)}
                </span>
                <span className="text-sm text-ink-muted">
                  {formatGameCreatedAt(dateIsoForGame(game))}
                  {' · '}
                  {strings.turnsCount(game.turns.length)}
                </span>
                <span className="mt-1 text-sm font-medium text-board">
                  {openLabel}
                </span>
              </ListRowButton>

              {pendingDeleteId === game.id ? (
                <ConfirmPanel
                  prompt={strings.deleteConfirmPrompt}
                  confirmLabel={strings.confirmDelete}
                  cancelLabel={strings.cancel}
                  onConfirm={handleConfirmDelete}
                  onCancel={() => {
                    setPendingDeleteId(null)
                    setDeleteError(null)
                  }}
                />
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setPendingDeleteId(game.id)
                    setDeleteError(null)
                  }}
                >
                  {strings.deleteGame}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  )
}
