# Architecture

Initial architecture for a small, testable, offline scorekeeping app. Stack and MVP product defaults are recorded in `docs/decisions.md` (D8–D24).

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
- **Delivery:** Mobile-first web app; PWA shell caching is a later task (T5), not part of first scaffold
- **Persistence:** JSON game documents in `localStorage`, behind a `GameStore` interface
- **Tests:** Vitest for domain and use cases (pure TypeScript)
- **UI language:** Finnish copy; English code and docs
- **Routing:** Not in scaffold; add when multi-screen UI starts

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
- Does not own scoring rules or persistence details.
- Should remain replaceable without rewriting domain logic. Domain must not import React.

### Application / game use cases

- Orchestrates one user action: validate input at the use-case level, update the `Game`, persist, return data for the UI.
- Examples: `createGame`, `recordTurn`, `editTurn` / `undoTurn`, `finishGame`, `reopenGame`, `deleteGame`, `listGames`, `getGame`.

### Domain

- Pure data + functions (or small types) for Game / Player / Turn.
- Cumulative totals and rankings are **functions of the turn list**.
- No I/O, no framework types if avoidable.
- This is the first code worth testing thoroughly.

### Persistence

- Saves and loads games locally so a refresh, app restart, or offline session does not lose an in-progress or finished game.
- Mechanism: `localStorage` + JSON, wrapped so the rest of the app depends on a store interface, not on `localStorage` directly.
- Store the **game document** (players + ordered turns + status). Do not persist derived standings as an independent source of truth. Derived values may be cached in memory for the UI.

### Future Scrabble-specific logic (boundary only)

Two empty seams, unused in MVP:

1. **Word validation** — would accept a word (and later a language/lexicon) and return valid/invalid.
2. **Automatic scoring** — would accept a play description and return a point value.

MVP records a user-supplied integer score and an optional string word. Do not call these modules. Do not build a fake dictionary “to be ready.”

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
| `currentPlayerId` | Suggested whose-turn (soft rotation); advanced after each recorded turn |

Suggested invariants:

- `players.length` is 2, 3, or 4.
- Player ids are unique within the game.
- Player display names are unique within the game (trimmed, case-insensitive); blank names rejected.
- Turns refer to a player id that exists on the game.
- Turns are ordered. Append a turn for any player (soft rotation: suggested player is highlighted in UI, not enforced). Remove only the last turn; edit score/word/player on any turn.
- After recording a turn for player P, set suggested current to the next seat after P (wrap).
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

### Derived values

Not stored as authority:

- **Player total** = sum of `turn.score` where `turn.playerId` matches.
- **Standings** = rank by total descending; equal totals share a rank (1, 1, 3); display order is total desc then original player order.
- **Final result** of a finished game = standings at finish time, which equals standings from the same turn list.

## Data flow (happy path)

1. User creates a game with 2–4 names → application creates a `Game` (`in_progress`) → persistence saves it.
2. User enters a score (optional word) for a player (default: suggested current; other players allowed) → application appends a `Turn`, advances suggested current to next seat → persistence saves → UI shows derived standings.
3. User corrects a mistake → application removes or replaces a turn → persistence saves → standings recompute from turns.
4. User finishes the game → status becomes `finished`, `finishedAt` set → persistence saves. Reopen returns it to `in_progress` so scores can be fixed.
5. User opens history → persistence lists in-progress and finished games → UI shows summaries derived from stored turns.

## UI shape (conceptual, not a design system)

Enough screens to support MVP; names can change:

1. **Home / history** — list of games; start new game.
2. **New game** — enter 2–4 player names; start.
3. **Active game** — standings + add turn (player, score, optional word) + undo/edit + finish.
4. **Game detail (past)** — read-only until reopened; turn list and final standings.

Mobile-first: one primary column, large tap targets, standings always visible during an active game if practical.

## Testing strategy

- **Domain/unit tests** (Vitest) for invariants and derivations: player count, turn append, totals, rankings, undo/edit, finish/reopen, reject invalid operations.
- **Persistence tests** for the `GameStore` / `localStorage` round-trip of a game document.
- **UI tests** only as needed; not a blocker for the first domain slice.

## What this architecture deliberately does not include

- Backend, API, or multi-device sync
- Auth
- Event sourcing as a productized store (an in-memory ordered turn list is enough)
- Plugin architecture for rulesets
- Shared kernel / DDD ceremony beyond one aggregate (`Game`)

## Deferred (does not block scaffold)

- Static hosting provider for family phones (`docs/decisions.md` O12b)
- PWA service worker / Add to Home Screen polish (task T5)
- Client-side router until multi-screen UI (T4)
- Full Scrabble turn/end rules beyond soft rotation (elimination, auto-end on all-pass, exchanges)
