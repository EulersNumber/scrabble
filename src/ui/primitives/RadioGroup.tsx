type RadioOption = {
  value: string
  label: string
}

type RadioGroupProps = {
  name: string
  legend: string
  hint?: string
  options: readonly RadioOption[]
  value: string | null
  onChange: (value: string) => void
}

/**
 * Labeled radio list for exclusive choices (D27).
 *
 * Used for starter pick on the new-game screen. Keeps fieldset chrome and
 * accent colors in primitives so screens only supply options and selection.
 */
export function RadioGroup({
  name,
  legend,
  hint,
  options,
  value,
  onChange,
}: RadioGroupProps) {
  return (
    <fieldset className="rounded-control border border-line bg-panel px-4 py-4">
      <legend className="px-1 text-base font-medium text-ink">{legend}</legend>
      {hint ? <p className="mb-3 text-sm text-ink-muted">{hint}</p> : null}
      <ul className="flex flex-col gap-2">
        {options.map((option) => {
          const inputId = `${name}-${option.value}`
          return (
            <li key={option.value}>
              <label
                htmlFor={inputId}
                className="flex cursor-pointer items-center gap-3 rounded-control px-1 py-2"
              >
                <input
                  id={inputId}
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => onChange(option.value)}
                  className="size-5 accent-board"
                />
                <span className="text-lg text-ink">{option.label}</span>
              </label>
            </li>
          )
        })}
      </ul>
    </fieldset>
  )
}
