import { useId } from 'react'

type SwitchProps = {
  id?: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

/**
 * On/off switch row (D27 / T9.1).
 *
 * One labeled control for a boolean preference. The track and knob live here
 * so screens only pass the Finnish label and the checked state.
 */
export function Switch({ id, label, checked, onChange }: SwitchProps) {
  const generatedId = useId()
  const switchId = id ?? generatedId
  const labelId = `${switchId}-label`

  return (
    <div className="flex items-center justify-between gap-4 rounded-control border border-line bg-panel px-4 py-4">
      <span id={labelId} className="text-lg font-medium text-ink">
        {label}
      </span>
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        onClick={() => onChange(!checked)}
        className={[
          'relative h-8 w-14 shrink-0 rounded-full transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-board/30',
          checked ? 'bg-board' : 'bg-line',
        ].join(' ')}
      >
        <span
          aria-hidden="true"
          className={[
            'absolute top-1 left-1 size-6 rounded-full bg-panel transition-transform',
            checked ? 'translate-x-6' : 'translate-x-0',
          ].join(' ')}
        />
      </button>
    </div>
  )
}
