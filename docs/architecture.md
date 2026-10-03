# Architecture

Initial architecture for a small, testable, offline scorekeeping app. Stack and MVP product defaults are recorded in `docs/decisions.md` (D8–D29). Offline verification: `docs/offline.md`.

## Design goals

- Mobile-first UI
- Simple and easy to understand
- Offline-capable core
- Testable game logic without a UI
- Few dependencies
- Clear separation of UI, application logic, persistence, and future Scrabble-specific logic
- Prefer simple solutions over speculative frameworks or plugin systems

## Chosen stack

- **Language / UI:** TypeScript, React, Vite
- **Package manager:** npm
- **Styling:** Tailwind CSS
- **Delivery:** Mobile-first web app; offline-after-load is MVP (D10, `docs/offline.md`). PWA shell caching is post-MVP (**P8**), not part of scaffold or T5.1
- **Persistence:** JSON game documents in `localStorage`, behind a `GameStore` interface
- **Tests:** Vitest for domain and use cases (pure TypeScript)
- **UI language:** Finnish copy; English code and docs
- **Routing:** T4 uses in-app React screen state (home / new game / active game). No URL router dependency yet.

Do not add React Native, Expo, a database library, or an i18n framework in MVP.

## Proposed layers

Keep these as **module boundaries**, not a heavy framework:

```
┌─────────────────────────────────────┐
│  UI                                 │
│  screens, input, standings display  │
└─────────────────┬───────────────────┘
                  │ calls
┌─────────────────▼───────────────────┐
│  Application (use cases)            │
│  create game, add turn, undo/edit,  │
│  finish game, list history          │
└─────────────────┬───────────────────┘
                  │ uses
┌─────────────────▼───────────────────┐
│  Domain                             │
│  Game, Player, Turn, derived scores │
└─────────────────┬───────────────────┘
                  │ saved by
┌─────────────────▼───────────────────┐
│  Persistence                        │
│  GameStore → localStorage JSON      │
└─────────────────────────────────────┘

Later (not now), isolated modules:
  dictionary / word validation
  automatic scoring
```

### UI

- Presents screens and collects input. User-visible strings are Finnish (`strings` module, not an i18n library).
- **Theme tokens** live in `src/index.css`; reusable **primitives** in `src/ui/primitives/` (D27): `AppShell`, `Button`, `TextField`, `ChoiceChip`, `RadioGroup`, `PlayerPickList`, `StandingsList`, `StandingsSlot`, `TurnHistoryList`, `ConfirmPanel`, `FormError`, `ListRowButton`, `ScreenHeader`, `TopBar`, `MenuSheet`, `ScoreDisplay`, `ScoreKeypad`, `BottomActionBar`, `FallingTilesBackdrop`, etc.
- **Atmosphere (T7.1):** `AppShell` accepts `atmosphere` (`hero` | `dimmed` | `none`). Home and inner screens share a light sage-green token family; `hero` is a slightly richer mist wash + clearer tiles, `dimmed` is quieter. Tile specs in `src/ui/fallingTiles.ts` (large tiles, slow variable fall/spin); CSS keyframes with reduced-motion static fallback.
- **Screens compose primitives.** Do not hard-code reusable control chrome (colors, borders, radii, focus rings) inside `*Screen.tsx`. Layout-only utilities (`flex`, `gap`, `mt-*`) are fine. If a new control look is needed, add/extend a primitive first.
- Feature-specific pure helpers (list sort/filter, new-game validate/suggest) may sit next to the flow as exported functions; split when large or shared. Not a global utils dump.
- Mobile-first scorepad column; wider max-width on tablet breakpoints for iPad use.
- **Turn screen direction (D33–D37, T7.3+):**
  - **Shipped in T7.3 (D34):** `TopBar` (back, compact title, menu icon), `MenuSheet`, and `TurnHistoryScreen` (`turn-history`). The open game no longer scrolls history, finish, or delete. Menu items are Vuorot, Lopeta peli / Avaa peli uudelleen, and Poista peli. **Asetukset** waits for T9.1 (D41) and opens master settings; it does not replace this menu.
  - **Shipped in T7.4 (D31):** `scoreKeypad.ts` plus `ScoreDisplay` and `ScoreKeypad`. Points on the turn screen and on history edit use the pad (calculator order, long-press ⌫ to clear). Pass is **Ohi** on the bottom bar, not a keypad key. The optional word stays a text field.
  - **Shipped in T7.5 (D33 / D36 / D40):** `ActiveGameScreen` is the single-player turn screen. `recordTurn` rejects anyone but `currentPlayerId` and advances to the next active seat. The screen shows a thin `StandingsSlot` (standing order; current player highlighted), a large current-player name, a filling keypad, the optional word, and `BottomActionBar` (Kumoa · Ohi · Seuraava pelaaja). Finished games have no keypad or bar; they show the same line, a read-only notice, and **Avaa peli uudelleen**.
  - Screens still to come: `SettingsScreen` arrives in T9.1 (D41). Home keeps its hero and adds a top-right gear that opens it; the turn-screen hamburger gains **Asetukset** to the same screen. `navigation.ts` gains a `settings` entry then (still no URL router, D24). `turn-history` is already present. T9.1 has no sound playback; `src/ui/sound/` arrives in T9.2.
  - New pure helpers (tested): `scoreKeypad.ts` (append digit / backspace / clear / sign toggle / sanity cap → integer or empty, shipped T7.4).
  - **D40:** the olympic podium was removed. Do not replace `StandingsSlot` with steps or a green bar.
  - Sounds (T9.2, D35): `src/ui/sound/` wraps Web Audio cues (progress / revert / action) and reads the mute setting from T9.1. Screens call it after successful actions. Domain and use cases never play sounds.
  - **D36:** new turns only for `currentPlayerId`. **D37 / T10.1:** later play-out + leftover tiles; not in T7.3–T7.6.
  - **Later polish:** **D38 / T7.11** — `MenuSheet` (or a successor) opens in place at the top right instead of a bottom sheet. **D39 / T10.0** — secondary **Lopeta peli** on the turn screen with confirm; leftover variants stay T10.1.
- Does not own scoring rules or persistence details.
- Should remain replaceable without rewriting domain logic. Domain must not import React.

### Application / game use cases

- Orchestrates one user action: validate input at the use-case level, update the `Game`, persist, return data for the UI.
- Examples: `createGame`, `recordTurn`, `editTurn` / `undoTurn`, `finishGame`, `reopenGame`, `deleteGame`, `listGames`, `getGame`.
- `listGames` returns all saved games; **order is undefined** — UI sorts/filters for home vs history (D26).

### Domain

- Pure data + functions (or small types) for Game / Player / Turn.
- Cumulative totals and rankings are **functions of the turn list**.
- No I/O, no framework types if avoidable.
- This is the first code worth testing thoroughly.

### Persistence

- Saves and loads games locally so a refresh, app restart, or offline session does not lose an in-progress or finished game.
- Mechanism: `localStorage` + JSON, wrapped so the rest of the app depends on a store interface, not on `localStorage` directly.
- Store the **game document** (players + ordered turns + status). Do not persist derived standings as an independent source of truth. Derived values may be cached in memory for the UI.
- **App settings (D35 / D41, T9.1):** a separate `SettingsStore` persists one small settings document under its own `localStorage` key. T9.1 stores `{ soundsEnabled }` (default on). Later tasks may add a hidden-name list (D42) and a user-word allowlist (T8.3) to this document or a sibling store — still never inside `Game`. It has its own version/defaults handling. Application exposes `getSettings` / `updateSettings`; UI reads settings once at app start and passes them down (a small React context is fine).

### Future Scrabble-specific logic (boundary only)

Two empty seams, unused in MVP:

1. **Word validation** — would accept a word (and later a language/lexicon) and return valid/invalid. Post-MVP direction (**D32** / **P17**): advisory offline checks via Kotus **Nykysuomen sanalista** (then inflected forms); not a scrape of Kielitoimiston sanakirja. After that checker exists, settings may hold user-added words and a dictionary choice (**T8.3**). Not part of the T9.1 settings shell.
2. **Automatic scoring** — would accept a play description and return a point value.

MVP records a user-supplied integer score and an optional string word. Do not call these modules until a promoted task (T8.x) lands. Do not build a fake dictionary “to be ready.”

## Domain model

### Game

A game is the aggregate root.

| Field | Role |
| --- | --- |
| `id` | Stable identifier |
| `createdAt` | When the game was started |
| `status` | `in_progress` or `finished` |
| `finishedAt` | Set when finished; empty while in progress |
| `players` | 2–4 players, seating order = list order |
| `turns` | Ordered list of turns; **source of truth** for scores |
| `currentPlayerId` | Whose turn it is. A new turn must be this player (D36, T7.5) |

Suggested invariants:

- `players.length` is 2, 3, or 4.
- Player ids are unique within the game.
- Player display names are unique within the game (trimmed, case-insensitive); blank names rejected.
- Turns refer to a player id that exists on the game.
- Turns are ordered. Remove only the last turn; edit score/word/player on any turn (D11).
- **D36 (T7.5):** a new turn must be for `currentPlayerId`; reject others. After that turn, set current to the next **active** seat (wrap). Until T10.x, every seated player is active. Undo and edit recompute current from remaining history. Older documents may contain off-rotation turns; they stay valid.
- **Later (D37 / P5 / P6):** skip eliminated players; play-out or house leftover-deduct records leftover-tile adjustments then finish.
- When `status` is `finished`, scoring mutations are not allowed until the game is reopened.
- Deleting a game removes its document (UI confirms first).
- Totals are not stored as required fields on the game.

### Player

Scoped to a game unless a later decision introduces a global player directory.

| Field | Role |
| --- | --- |
| `id` | Stable identifier within the game |
| `name` | Display name |

No persistent rating, avatar, or account.

### Turn

| Field | Role |
| --- | --- |
| `id` | Stable identifier |
| `playerId` | Who scored |
| `score` | Integer points for this turn (user-entered) |
| `word` | Optional string; omitted or empty means “not recorded” |
| `createdAt` | When the turn was recorded in the app |
| `sequence` | Position in the game’s turn history (explicit index or implied by list order) |

The product does not require modeling the physical board. A turn is a scoring event, not a full placement of tiles.

**Later (P1, not now):** persist how long the physical turn took as first-class data (duration or start/stop). `createdAt` is when the score was logged, not how long the seat thought. A live whole-game elapsed clock is a separate later idea (**P29**). Displayed game titles may include `Game.createdAt` (**P28**) without storing a custom title field.

### Derived values

Not stored as authority:

- **Player total** = sum of `turn.score` where `turn.playerId` matches.
- **Standings** = rank by total descending; equal totals share a rank (1, 1, 3); display order is total desc then original player order.
- **Final result** of a finished game = standings at finish time, which equals standings from the same turn list.

## Data flow (happy path)

1. User creates a game with 2–4 names → application creates a `Game` (`in_progress`) → persistence saves it.
2. User enters a score (optional word) for the **current** player (D36) → application appends a `Turn`, advances current to the next active seat → persistence saves → UI shows derived standings.
3. User corrects a mistake → application removes or replaces a turn → persistence saves → standings recompute from turns.
4. User finishes the game → status becomes `finished`, `finishedAt` set → persistence saves. Reopen returns it to `in_progress` so scores can be fixed.
5. User opens history → persistence lists in-progress and finished games → UI shows summaries derived from stored turns.

## UI shape (conceptual, not a design system)

Enough screens to support MVP; names can change:

1. **Home** — hub: primary **new game**; secondary **continue** and **history** entry points (D17, D29). A gear at the top right of the hero opens master settings (D41 / T9.1). Home does not get the game hamburger.
2. **Continue list** — in-progress games (newest `createdAt` first); open resumes scoring; delete with confirm.
3. **History list** — finished games (newest `finishedAt` first); open shows read-only active-game view; delete with confirm.
4. **New game** — enter 2–4 player names (optional suggestions from history); pick who starts; start (D25).
5. **Active game** — single-player turn screen (D33 / D36 / D40, T7.5): thin standings line, large current player (not a picker), keypad score, optional word, bottom bar (Kumoa · Ohi · Seuraava pelaaja). Finish, reopen, and delete with confirm are in the top-bar menu (D30 / D34, T7.3). Finished games reuse this screen without the keypad or bar, with the standings line as the final result, a read-only notice, and **Avaa peli uudelleen**. Dedicated past-game summary remains post-MVP.
6. **Turn history** (T7.3) — separate screen from the game menu; newest first; tap to edit while in progress (D11), including the same score keypad (T7.4). Finished games are read-only here until reopen.
7. **Settings** (T9.1 / D41) — app-wide master settings. First control is sounds on/off (D35). Playback is T9.2. Later sections (remembered names, about, dictionary extras) join this screen in their own tasks. The turn-screen menu item **Asetukset** opens the same screen.

Mobile-first: one primary column, large tap targets, standings always visible during an active game if practical.

## Testing strategy

- **Domain/unit tests** (Vitest) for invariants and derivations: player count, turn append, totals, rankings, undo/edit, finish/reopen, reject invalid operations.
- **Persistence tests** for the `GameStore` / `localStorage` round-trip of a game document.
- **UI tests** only as needed; not a blocker for the first domain slice.

## What this architecture deliberately does not include

- Backend, API, or multi-device sync (desired later — backlog **P9**)
- Auth
- Event sourcing as a productized store (an in-memory ordered turn list is enough)
- Plugin architecture for rulesets
- Shared kernel / DDD ceremony beyond one aggregate (`Game`)

## Deferred (does not block scaffold)

- Custom domain for GitHub Pages (optional; D28)
- PWA service worker / Add to Home Screen polish (backlog **P8**)
- URL router (T4 currently uses React screen state; add a router if deep links are needed)
- Full Scrabble end rules beyond strict rotation (D36): elimination, auto-end on all-pass, exchanges, play-out (D37 / T10.1), visible finish on the turn screen (D39 / T10.0)
- Game menu in-place placement (D38 / T7.11)
- Post-MVP UX polish captured in backlog **P1–P29**; triage in **T6.0** after MVP close (T5.2)
- Master settings beyond the sounds toggle: remembered names (D42 / T9.3), about (T9.4), user words and dictionary choice (T8.3). UI language (P26) and per-cue sound switches (P27) stay parked
- Timestamped game titles (**P28**) and a live sitting clock (**P29**, later than the per-turn timer in **P1**)
