# MVP backlog

Small implementation tasks for the scorekeeping app. **Do not start application code until stack choices in `docs/decisions.md` (O1–O3) are decided**, except documentation work.

Each task should be one focused change, with tests where the task says so. Commit when the user asks.

Suggested order is the numbering below. A task may be split further if it grows.

---

## 0. Foundations (no product UI yet)

### T0.1 Confirm open decisions needed to scaffold

- **Goal:** Record choices for language/framework (O1), persistence (O2), offline definition (O3), and confirm proposed defaults P1–P4 / product opens O4–O12 as needed.
- **Acceptance:**
  - `docs/decisions.md` updated: relevant items `accepted` or explicitly deferred with a default.
  - No app code required.

### T0.2 Scaffold the project

- **Goal:** Empty runnable app shell with the chosen stack, lint/test command, and layer folders matching `docs/architecture.md`.
- **Acceptance:**
  - App starts locally (hello/placeholder screen is enough).
  - Test runner runs (even if only a placeholder test).
  - Domain / application / persistence / UI folders (or equivalent) exist and are empty-or-minimal.
  - No feature logic yet.
  - No extra dependencies beyond what the stack needs to run and test.

### T0.3 Domain types and invariants (tests first)

- **Goal:** `Game`, `Player`, `Turn` plus functions to create a game with 2–4 players.
- **Acceptance:**
  - Creating a game with 1 or 5+ players is rejected.
  - Creating with 2–4 unique players succeeds.
  - Game starts `in_progress` with empty turns.
  - Tests cover these cases.

---

## 1. Scoring core (no persistence required if in-memory is used in tests)

### T1.1 Record a turn

- **Goal:** Append a turn: player, integer score, timestamp, optional word.
- **Acceptance:**
  - Turn is added for a player on the game.
  - Unknown player is rejected.
  - Missing/empty word is allowed.
  - Tests cover success and rejection.

### T1.2 Derived totals and standings

- **Goal:** Compute totals and ranking from turns only.
- **Acceptance:**
  - Totals equal the sum of that player’s turn scores.
  - Players with no turns total 0.
  - Ranking uses the agreed tie rule (O7).
  - Tests cover several turns, zeros, and a tie.

### T1.3 Undo / edit turns

- **Goal:** Implement the correction model decided in O4 (and P3 if accepted).
- **Acceptance:**
  - After undo/edit, standings match the remaining/changed turns.
  - Invalid edits are rejected (e.g. unknown turn).
  - Tests cover at least: undo last; one edit that changes a total.

### T1.4 Finish a game

- **Goal:** Mark a game finished; block further scoring (unless O8 says otherwise).
- **Acceptance:**
  - `status` is `finished` and `finishedAt` is set.
  - Recording a turn on a finished game is rejected (if finish is irreversible).
  - Tests cover finish and the mutation rule.

---

## 2. Persistence

### T2.1 Local game store

- **Goal:** Save and load a full game document.
- **Acceptance:**
  - Round-trip preserves id, players, turns, status, timestamps, optional words.
  - Works with no network.
  - Tests (unit or integration) cover save/load.

### T2.2 Resume in-progress game

- **Goal:** Unfinished games survive restart (O9; recommended yes).
- **Acceptance:**
  - After reload, the same in-progress game and turns are present.
  - Covered by test or a documented manual check if the environment cannot simulate reload easily.

---

## 3. Application use cases

Thin functions/services used by the UI. Keep them free of widget/DOM types.

### T3.1 Create-game and list-games use cases

- **Acceptance:** Creating persists a game; listing returns saved games (in progress and finished). Tests with a fake or real store.

### T3.2 Record / correct / finish use cases

- **Acceptance:** Each operation loads, updates domain, saves. Errors from domain surface clearly. Tests with a store.

---

## 4. UI (mobile-first)

Build screens against the use cases. Visual polish is secondary to usable flow.

### T4.1 New game screen

- **Acceptance:** User can enter 2–4 names and start a game. Invalid counts are blocked in the UI.

### T4.2 Active game: standings + add turn

- **Acceptance:** User picks a player, enters a score, optionally a word, submits. Standings update immediately. Usable on a phone-width layout.

### T4.3 Active game: undo/edit

- **Acceptance:** User can correct a turn per O4 without leaving a broken total.

### T4.4 Finish game

- **Acceptance:** User can finish; game no longer accepts new scores (per O8).

### T4.5 History list + past game detail

- **Acceptance:** Finished (and, if applicable, in-progress) games appear in a list. Opening one shows players, totals, and turn history including optional words.

---

## 5. Offline and wrap-up

### T5.1 Offline core check

- **Goal:** Meet the chosen definition of offline (O3).
- **Acceptance:**
  - Scoring and history work with network disabled after the app is available per O3.
  - Document how to verify (and implement shell caching only if O3 requires it).

### T5.2 MVP review

- **Goal:** Walk `docs/product-spec.md` MVP list 1–7 and tick each item.
- **Acceptance:** Gaps filed as follow-up tasks; no extra features added “while we’re here.”

---

## Out of backlog (do not pull in)

- Word validation, auto-scoring, accounts, sync, sharing, stats, payments, rulesets.

When those are wanted, add new tasks and a decision; do not expand T1–T5 silently.

---

## Implementation order (summary)

1. Decide stack and remaining product opens (T0.1)
2. Scaffold (T0.2)
3. Domain + tests: game, turns, standings, undo/edit, finish (T0.3–T1.4)
4. Persistence + resume (T2)
5. Use cases (T3)
6. UI flows (T4)
7. Offline verification (T5)

Domain before UI so the learning project practices testable logic first.
