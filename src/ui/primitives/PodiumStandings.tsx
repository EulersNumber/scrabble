import { podiumLayout, type PodiumPlayer, type PodiumStep } from '../podium'

type PodiumStandingsProps = {
  heading: string
  standings: readonly PodiumPlayer[]
  pointsLabel: (total: number) => string
  rankLabel: (rank: number) => string
  /** Highlights this seat. Omit on a finished game (final result, nobody's turn). */
  currentPlayerId?: string
}

/**
 * Compact olympic podium for the turn screen (T7.6 / D33 / D27).
 *
 * Rank 1 is centre and tallest, rank 2 left, rank 3 right. Shared ranks share
 * a step (D15). A 4th place is a small chip beside the podium. Totals come
 * from derived standings; this component only places them.
 */
export function PodiumStandings({
  heading,
  standings,
  pointsLabel,
  rankLabel,
  currentPlayerId,
}: PodiumStandingsProps) {
  const layout = podiumLayout(standings)
  const onlyFirst =
    layout.first !== null &&
    layout.second === null &&
    layout.third === null &&
    layout.beside === null

  return (
    <section className="shrink-0" aria-label={heading}>
      <h2 className="sr-only">{heading}</h2>
      {onlyFirst && layout.first ? (
        <SharedFirstStep
          step={layout.first}
          pointsLabel={pointsLabel}
          rankLabel={rankLabel}
          currentPlayerId={currentPlayerId}
        />
      ) : (
        <div className="flex items-end gap-1">
          <div className="grid min-w-0 flex-1 grid-cols-3 items-end gap-1">
            <PodiumColumn
              step={layout.second}
              pedestalClass="h-5"
              pointsLabel={pointsLabel}
              rankLabel={rankLabel}
              currentPlayerId={currentPlayerId}
            />
            <PodiumColumn
              step={layout.first}
              pedestalClass="h-7"
              pointsLabel={pointsLabel}
              rankLabel={rankLabel}
              currentPlayerId={currentPlayerId}
            />
            <PodiumColumn
              step={layout.third}
              pedestalClass="h-3"
              pointsLabel={pointsLabel}
              rankLabel={rankLabel}
              currentPlayerId={currentPlayerId}
            />
          </div>
          {layout.beside ? (
            <BesideChip
              step={layout.beside}
              pointsLabel={pointsLabel}
              rankLabel={rankLabel}
              currentPlayerId={currentPlayerId}
            />
          ) : null}
        </div>
      )}
    </section>
  )
}

type StepVisualProps = {
  step: PodiumStep
  pointsLabel: (total: number) => string
  rankLabel: (rank: number) => string
  currentPlayerId?: string
}

function SharedFirstStep({
  step,
  pointsLabel,
  rankLabel,
  currentPlayerId,
}: StepVisualProps) {
  const rank = step.players[0]?.rank

  return (
    <div className="overflow-hidden rounded-control border border-line bg-panel">
      <div className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-0.5 px-2 py-1">
        {rank !== undefined ? (
          <span className="text-xs font-medium text-ink-muted">{rankLabel(rank)}</span>
        ) : null}
        {step.players.map((player) => (
          <PlayerFace
            key={player.playerId}
            player={player}
            pointsLabel={pointsLabel}
            current={player.playerId === currentPlayerId}
          />
        ))}
      </div>
      <div className="h-4 bg-board" aria-hidden="true" />
    </div>
  )
}

function PodiumColumn({
  step,
  pedestalClass,
  pointsLabel,
  rankLabel,
  currentPlayerId,
}: {
  step: PodiumStep | null
  pedestalClass: string
  pointsLabel: (total: number) => string
  rankLabel: (rank: number) => string
  currentPlayerId?: string
}) {
  if (step === null) {
    return <div aria-hidden="true" />
  }

  const rank = step.players[0]?.rank

  return (
    <div className="flex min-w-0 flex-col justify-end overflow-hidden rounded-control border border-line bg-panel">
      <div className="flex flex-col gap-0.5 px-1 pt-1">
        {rank !== undefined ? (
          <span className="text-center text-xs font-medium text-ink-muted">
            {rankLabel(rank)}
          </span>
        ) : null}
        {step.players.map((player) => (
          <PlayerFace
            key={player.playerId}
            player={player}
            pointsLabel={pointsLabel}
            current={player.playerId === currentPlayerId}
          />
        ))}
      </div>
      <div className={['mt-1 w-full bg-board', pedestalClass].join(' ')} aria-hidden="true" />
    </div>
  )
}

function BesideChip({
  step,
  pointsLabel,
  rankLabel,
  currentPlayerId,
}: StepVisualProps) {
  const rank = step.players[0]?.rank

  return (
    <div className="flex max-w-24 shrink-0 flex-col justify-end self-end overflow-hidden rounded-control border border-line bg-panel px-1 py-1">
      {rank !== undefined ? (
        <span className="text-center text-xs font-medium text-ink-muted">
          {rankLabel(rank)}
        </span>
      ) : null}
      {step.players.map((player) => (
        <PlayerFace
          key={player.playerId}
          player={player}
          pointsLabel={pointsLabel}
          current={player.playerId === currentPlayerId}
        />
      ))}
    </div>
  )
}

function PlayerFace({
  player,
  pointsLabel,
  current,
}: {
  player: PodiumPlayer
  pointsLabel: (total: number) => string
  current: boolean
}) {
  return (
    <span
      className={[
        'flex min-w-0 items-baseline justify-between gap-1 rounded-control px-1 py-0.5 text-xs leading-tight',
        current ? 'bg-board-soft font-semibold text-ink' : 'text-ink',
      ].join(' ')}
      aria-current={current ? 'true' : undefined}
    >
      <span className="truncate">{player.name}</span>
      <span className="shrink-0 tabular-nums">{pointsLabel(player.total)}</span>
    </span>
  )
}
