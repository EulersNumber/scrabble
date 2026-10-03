type StandingsSlotEntry = {
  playerId: string
  name: string
  total: number
  rank: number
}

type StandingsSlotProps = {
  heading: string
  standings: readonly StandingsSlotEntry[]
  pointsLabel: (total: number) => string
  rankLabel: (rank: number) => string
  /** Highlights this seat. Omit when the game is finished. */
  currentPlayerId?: string
}

/**
 * Thin standings line on the turn screen (D40).
 *
 * One compact row in standing order: rank, name, total. The player whose
 * turn it is is highlighted. Totals come from derived standings (D3, D15).
 * This stays a line so the screen can stay about taking the turn.
 */
export function StandingsSlot({
  heading,
  standings,
  pointsLabel,
  rankLabel,
  currentPlayerId,
}: StandingsSlotProps) {
  return (
    <section
      className="rounded-control border border-line bg-panel px-2 py-1.5"
      aria-label={heading}
    >
      <h2 className="sr-only">{heading}</h2>
      <ol className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
        {standings.map((entry) => {
          const current = entry.playerId === currentPlayerId
          return (
            <li
              key={entry.playerId}
              className={[
                'flex max-w-full items-baseline gap-1 rounded-control px-1.5 py-0.5 text-sm',
                current
                  ? 'bg-board-soft font-semibold text-ink'
                  : 'text-ink-muted',
              ].join(' ')}
              aria-current={current ? 'true' : undefined}
            >
              <span className="shrink-0">{rankLabel(entry.rank)}</span>
              <span className="truncate">{entry.name}</span>
              <span className="shrink-0 tabular-nums">{pointsLabel(entry.total)}</span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
