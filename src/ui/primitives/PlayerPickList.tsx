type PlayerOption = {
  id: string
  name: string
}

type PlayerPickListProps = {
  legend: string
  hint?: string
  players: readonly PlayerOption[]
  value: string
  suggestedId: string
  suggestedBadge: string
  onChange: (playerId: string) => void
  disabled?: boolean
}

/**
 * Soft-rotation player picker: exclusive choice with suggested highlight (D13, D27).
 *
 * The suggested seat is visually marked, but any seated player remains
 * selectable so late logging still works. Used on the active-game screen.
 */
export function PlayerPickList({
  legend,
  hint,
  players,
  value,
  suggestedId,
  suggestedBadge,
  onChange,
  disabled = false,
}: PlayerPickListProps) {
  return (
    <fieldset
      className="rounded-control border border-line bg-panel px-4 py-4"
      disabled={disabled}
    >
      <legend className="px-1 text-base font-medium text-ink">{legend}</legend>
      {hint ? <p className="mb-3 text-sm text-ink-muted">{hint}</p> : null}
      <ul className="flex flex-col gap-2">
        {players.map((player) => {
          const inputId = `player-pick-${player.id}`
          const selected = value === player.id
          const suggested = player.id === suggestedId

          return (
            <li key={player.id}>
              <label
                htmlFor={inputId}
                className={[
                  'flex cursor-pointer items-center gap-3 rounded-control border px-3 py-3',
                  selected
                    ? 'border-board bg-board-soft'
                    : 'border-transparent bg-transparent',
                  disabled ? 'cursor-not-allowed opacity-50' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <input
                  id={inputId}
                  type="radio"
                  name="active-game-player"
                  value={player.id}
                  checked={selected}
                  disabled={disabled}
                  onChange={() => onChange(player.id)}
                  className="size-5 accent-board"
                />
                <span className="flex min-w-0 flex-1 items-baseline justify-between gap-2">
                  <span className="text-lg text-ink">{player.name}</span>
                  {suggested ? (
                    <span className="shrink-0 text-sm font-medium text-board">
                      {suggestedBadge}
                    </span>
                  ) : null}
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </fieldset>
  )
}
