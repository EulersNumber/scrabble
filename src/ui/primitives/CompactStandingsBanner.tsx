type StandingRow = {
  playerId: string
  name: string
  total: number
  rank: number
}

type CompactStandingsBannerProps = {
  /** Accessible name for the banner region. */
  label: string
  standings: readonly StandingRow[]
  pointsLabel: (total: number) => string
  /** Optional player to emphasize (e.g. suggested current). */
  highlightId?: string
}

/**
 * Compact horizontal standings strip for the turn-focused shell (T7.3, D3, D27).
 *
 * Shows name + total for each seat without the full standings card so the
 * first viewport stays about “this turn.” Totals still come from derived
 * standings — never a second source of truth.
 */
export function CompactStandingsBanner({
  label,
  standings,
  pointsLabel,
  highlightId,
}: CompactStandingsBannerProps) {
  return (
    <section
      className="rounded-control border border-line bg-panel/90 px-3 py-2.5 backdrop-blur-sm"
      aria-label={label}
    >
      <ol className="flex flex-wrap items-stretch justify-between gap-2">
        {standings.map((entry) => {
          const highlighted =
            highlightId !== undefined && entry.playerId === highlightId
          return (
            <li
              key={entry.playerId}
              className={[
                'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-control px-2 py-1.5 text-center',
                highlighted ? 'bg-board-soft' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span
                className={[
                  'w-full truncate text-sm font-medium',
                  highlighted ? 'text-board' : 'text-ink-muted',
                ].join(' ')}
              >
                {entry.name}
              </span>
              <span className="text-base font-semibold tabular-nums text-ink">
                {pointsLabel(entry.total)}
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
