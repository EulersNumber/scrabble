type PlayerOption = {
  id: string
  name: string
}

type PlayerPickListProps = {
  /** Radio group name; must be unique when multiple pickers are on one screen. */
  name: string
  legend: string
  hint?: string
  players: readonly PlayerOption[]
  value: string
  suggestedId?: string
  suggestedBadge?: string
  onChange: (playerId: string) => void
  disabled?: boolean
}

/**
 * Exclusive player choice for correcting a past turn (D11, D27).
 *
 * Any seated player can be selected. `suggestedId` can mark the current seat.
 * The in-progress turn screen does not use this picker (D36); history edit does.
 */
export function PlayerPickList({
  name,
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
          const inputId = `${name}-${player.id}`
          const selected = value === player.id
          const suggested =
            suggestedId !== undefined &&
            suggestedBadge !== undefined &&
            player.id === suggestedId

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
                  name={name}
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
