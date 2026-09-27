type TopBarProps = {
  title: string
  subtitle?: string
  backLabel: string
  onBack: () => void
  /** Accessible name for the icon button. Omit `onMenu` to hide the control. */
  menuLabel?: string
  menuExpanded?: boolean
  /** Id of the dialog the menu button controls. */
  menuControlsId?: string
  onMenu?: () => void
}

/**
 * Compact screen bar: back, title, and an optional menu icon (T7.3 / D34).
 *
 * Chrome lives here so game and history screens only pass labels and handlers.
 * The menu button is icon-only; `menuLabel` is its accessible name.
 */
export function TopBar({
  title,
  subtitle,
  backLabel,
  onBack,
  menuLabel,
  menuExpanded = false,
  menuControlsId,
  onMenu,
}: TopBarProps) {
  const showMenu = onMenu !== undefined && menuLabel !== undefined

  return (
    <header className="flex items-center gap-2">
      <button
        type="button"
        onClick={onBack}
        className={[
          'shrink-0 rounded-control px-2 py-2 text-base font-medium text-ink-muted',
          'underline-offset-2 hover:underline',
          'focus:outline-none focus:ring-2 focus:ring-board/30',
        ].join(' ')}
      >
        {backLabel}
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-lg font-semibold tracking-tight text-ink md:text-xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="truncate text-sm text-ink-muted">{subtitle}</p>
        ) : null}
      </div>

      {showMenu ? (
        <button
          type="button"
          onClick={onMenu}
          aria-label={menuLabel}
          aria-haspopup="dialog"
          aria-expanded={menuExpanded}
          aria-controls={menuControlsId}
          className={[
            'inline-flex size-11 shrink-0 items-center justify-center rounded-control text-ink',
            'hover:bg-board-soft active:bg-board-soft',
            'focus:outline-none focus:ring-2 focus:ring-board/30',
          ].join(' ')}
        >
          <MenuIcon />
        </button>
      ) : null}
    </header>
  )
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}
