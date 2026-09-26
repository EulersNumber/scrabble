type StandingRow = {
  playerId: string
  name: string
  total: number
  rank: number
}

type StandingsListProps = {
  heading: string
  standings: readonly StandingRow[]
  pointsLabel: (total: number) => string
  rankLabel: (rank: number) => string
}

/**
 * Read-only standings panel derived from turn totals (D3, D15, D27).
 *
 * Screens pass Finnish labels; this owns list chrome only. Rank and total
 * come from `getStandings` — never stored as a second source of truth.
 */
export function StandingsList({
  heading,
  standings,
  pointsLabel,
  rankLabel,
}: StandingsListProps) {
  return (
    <section
      className="rounded-control border border-line bg-panel px-4 py-4"
      aria-labelledby="standings-heading"
    >
      <h2
        id="standings-heading"
        className="font-display text-xl font-semibold text-ink"
      >
        {heading}
      </h2>
      <ol className="mt-3 flex flex-col gap-2">
        {standings.map((entry) => (
          <li
            key={entry.playerId}
            className="flex items-baseline justify-between gap-3 border-b border-line/70 pb-2 last:border-b-0 last:pb-0"
          >
            <span className="flex min-w-0 items-baseline gap-2">
              <span className="w-8 shrink-0 text-sm font-medium text-ink-muted">
                {rankLabel(entry.rank)}
              </span>
              <span className="truncate text-lg text-ink">{entry.name}</span>
            </span>
            <span className="shrink-0 text-lg font-semibold tabular-nums text-ink">
              {pointsLabel(entry.total)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
