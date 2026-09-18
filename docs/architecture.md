# Architecture

Initial architecture for a small, testable, offline scorekeeping app. **Stack (language, UI framework, persistence library, packaging) is not decided.** This document describes layers, the domain model, and boundaries so implementation can stay simple once those choices are made.

## Design goals

- Mobile-first UI
- Simple and easy to understand
- Offline-capable core
- Testable game logic without a UI
- Few dependencies
- Clear separation of UI, application logic, persistence, and future Scrabble-specific logic
- Prefer simple solutions over speculative frameworks or plugin systems

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
│  local store of games               │
└─────────────────────────────────────┘

Later (not now), isolated modules:
  dictionary / word validation
  automatic scoring
```

### UI

- Presents screens and collects input.
- Does not own scoring rules or persistence details.
- Should remain replaceable (e.g. if the delivery model changes) without rewriting domain logic.

### Application / game use cases

- Orchestrates one user action: validate input at the use-case level, update the `Game`, persist, return data for the UI.
- Examples: `createGame`, `recordTurn`, `editTurn` / `undoTurn`, `finishGame`, `listGames`, `getGame`.

### Domain

- Pure data + functions (or small types) for Game / Player / Turn.
- Cumulative totals and rankings are **functions of the turn list**.
- No I/O, no framework types if avoidable.
- This is the first code worth testing thoroughly.

### Persistence

- Saves and loads games locally so a refresh, app restart, or offline session does not lose an in-progress or finished game.
- Mechanism (files, SQLite, IndexedDB, etc.) is an open technical decision.
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
| `players` | 2–4 players, order as added (or seating order if we later define it) |
| `turns` | Ordered list of turns; **source of truth** for scores |

Suggested invariants:

- `players.length` is 2, 3, or 4.
- Player ids are unique within the game.
- Turns refer to a player id that exists on the game.
- Turns are ordered (append-only except for undo/edit).
- When `status` is `finished`, scoring mutations are not allowed (unless a later decision allows reopening).
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
- **Standings** = players ordered by total (tie-break rule is an open decision).
- **Final result** of a finished game = standings at finish time, which equals standings from the same turn list.

## Data flow (happy path)

1. User creates a game with 2–4 names → application creates a `Game` (`in_progress`) → persistence saves it.
2. User enters a score (optional word) for a player → application appends a `Turn` → persistence saves → UI shows derived standings.
3. User corrects a mistake → application removes or replaces a turn → persistence saves → standings recompute from turns.
4. User finishes the game → status becomes `finished`, `finishedAt` set → persistence saves.
5. User opens history → persistence lists games → UI shows summaries derived from stored turns.

## UI shape (conceptual, not a design system)

Enough screens to support MVP; names can change:

1. **Home / history** — list of games; start new game.
2. **New game** — enter 2–4 player names; start.
3. **Active game** — standings + add turn (player, score, optional word) + undo/edit + finish.
4. **Game detail (past)** — read-only (or same view with mutations disabled) turn list and final standings.

Mobile-first: one primary column, large tap targets, standings always visible during an active game if practical.

## Testing strategy

- **Domain/unit tests** for invariants and derivations: player count, turn append, totals, rankings, undo/edit, finish, reject invalid operations.
- **Persistence tests** once a store is chosen: save/load round-trip of a game document.
- **UI tests** only as needed; not a blocker for the first domain slice.

## What this architecture deliberately does not include

- Backend, API, or multi-device sync
- Auth
- Event sourcing as a productized store (an in-memory ordered turn list is enough)
- Plugin architecture for rulesets
- Shared kernel / DDD ceremony beyond one aggregate (`Game`)

## Open technical choices

See `docs/decisions.md`. Implementation must not assume a stack until those are decided:

- Delivery: e.g. installable web app vs native wrapper vs native app
- Language and UI framework
- Local persistence mechanism
- How the app is run on a family phone (browser bookmark vs installed PWA vs store)
