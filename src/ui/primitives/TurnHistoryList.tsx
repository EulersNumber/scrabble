import type { ReactNode } from 'react'

export type TurnHistoryRow = {
  id: string
  playerName: string
  score: number
  word?: string
  isLast: boolean
}

type TurnHistoryListProps = {
  heading: string
  turns: readonly TurnHistoryRow[]
  pointsLabel: (score: number) => string
  noWordLabel: string
  lastBadge: string
  selectedId: string | null
  onSelect: (turnId: string) => void
  /** Inline edit UI rendered directly under the selected row. */
  editPanel?: ReactNode
  disabled?: boolean
}

/**
 * Newest-first turn history with selectable rows for inline edit (T4.3, D27).
 *
 * Screens own edit form state and pass `editPanel` for the open row. Visual
 * chrome stays here so active-game screens only arrange layout.
 */
export function TurnHistoryList({
  heading,
  turns,
  pointsLabel,
  noWordLabel,
  lastBadge,
  selectedId,
  onSelect,
  editPanel,
  disabled = false,
}: TurnHistoryListProps) {
  return (
    <section
      className="rounded-control border border-line bg-panel px-4 py-4"
      aria-labelledby="turn-history-heading"
    >
      <h2
        id="turn-history-heading"
        className="font-display text-xl font-semibold text-ink"
      >
        {heading}
      </h2>
      <ol className="mt-3 flex flex-col gap-2">
        {turns.map((turn) => {
          const selected = turn.id === selectedId
          return (
            <li key={turn.id} className="flex flex-col gap-2">
              <button
                type="button"
                disabled={disabled}
                aria-expanded={selected}
                onClick={() => onSelect(turn.id)}
                className={[
                  'flex w-full items-baseline justify-between gap-3 rounded-control border px-3 py-3 text-left',
                  selected
                    ? 'border-board bg-board-soft'
                    : 'border-transparent bg-transparent',
                  disabled
                    ? 'cursor-not-allowed opacity-50'
                    : 'active:bg-board-soft hover:bg-board-soft',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="flex min-w-0 items-baseline gap-2">
                    <span className="truncate text-lg text-ink">
                      {turn.playerName}
                    </span>
                    {turn.isLast ? (
                      <span className="shrink-0 text-sm font-medium text-board">
                        {lastBadge}
                      </span>
                    ) : null}
                  </span>
                  <span className="truncate text-sm text-ink-muted">
                    {turn.word ?? noWordLabel}
                  </span>
                </span>
                <span className="shrink-0 text-lg font-semibold tabular-nums text-ink">
                  {pointsLabel(turn.score)}
                </span>
              </button>
              {selected && editPanel ? (
                <div className="rounded-control border border-line bg-board-soft px-3 py-3">
                  {editPanel}
                </div>
              ) : null}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
