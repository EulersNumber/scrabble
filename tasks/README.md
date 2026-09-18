# MVP backlog

Small implementation tasks for the scorekeeping app. Stack and MVP defaults are **accepted** in `docs/decisions.md` (D8–D24), including soft rotation. **T0.1–T0.3 are done.** Continue from T1.1.

Each task should be one focused change, with tests where the task says so. Commit when the user asks.

Suggested order is the numbering below. A task may be split further if it grows.

---

## 0. Foundations (no product UI yet)

### T0.1 Confirm open decisions needed to scaffold

- **Status:** done (docs only; 2026-09-18).
- **Goal:** Record choices for language/framework, persistence, offline definition, and product defaults.
- **Acceptance:**
  - `docs/decisions.md` updated: D8–D24 accepted; hosting deferred (O12b).
  - No app code required.

### T0.2 Scaffold the project

- **Status:** done (2026-09-18).
- **Goal:** Empty runnable app shell: TypeScript + React + Vite, Tailwind CSS, Vitest, npm, layer folders matching `docs/architecture.md`.
- **Acceptance:**
  - App starts locally (hello/placeholder screen is enough; Finnish UI later).
  - Vitest runs (even if only a placeholder test).
  - Tailwind is configured and usable on the placeholder screen.
  - Domain / application / persistence / UI folders (or equivalent) exist and are empty-or-minimal.
  - No router yet.
  - No feature logic yet.
  - Dependencies limited to Vite, React, TypeScript, Tailwind, and the test runner.

### T0.3 Domain types and invariants (tests first)

- **Status:** done (2026-09-18).
- **Goal:** `Game`, `Player`, `Turn` plus functions to create a game with 2–4 players.
- **Acceptance:**
  - Creating a game with 1 or 5+ players is rejected.
  - Creating with 2–4 players with unique non-blank names succeeds.
  - Duplicate names (case-insensitive after trim) and blank names are rejected.
  - Game starts `in_progress` with empty turns.
  - Seating order = player list order; suggested current starts as the first player.
  - Tests cover these cases.

---

## 1. Scoring core (no persistence required if in-memory is used in tests)

### T1.1 Record a turn

- **Goal:** Append a turn; soft rotation advances suggested current player (D13).
- **Acceptance:**
  - Turn is added for any player on the game (soft: non-suggested allowed).
  - After a turn for P, suggested current becomes the next seat after P (wrap).
  - Unknown player is rejected.
  - Missing/empty word is allowed.
  - Non-integer scores are rejected; 0 and negatives are allowed (0 = pass).
  - New game starts with suggested current = first seated player.
  - Tests cover success, rejection, and pointer advance (including wrap and logging a non-suggested player).

### T1.2 Derived totals and standings

- **Goal:** Compute totals and ranking from turns only.
- **Acceptance:**
  - Totals equal the sum of that player’s turn scores.
  - Players with no turns total 0.
  - Ranking uses shared ranks on a tie (D15: 1, 1, 3), display order total then player order.
  - Tests cover several turns, zeros, and a tie.

### T1.3 Undo / edit turns

- **Goal:** Undo/remove last turn; edit score, word, and player on any turn (D11).
- **Acceptance:**
  - After undo/edit, standings match the remaining/changed turns.
  - Cannot delete a non-last turn.
  - Invalid edits are rejected (e.g. unknown turn).
  - Tests cover at least: undo last (including restored suggested player); one edit that changes a total; edit player.

### T1.4 Finish, reopen, and reject mutations while finished

- **Goal:** Finish a game; block scoring until reopen (D16).
- **Acceptance:**
  - `status` is `finished` and `finishedAt` is set.
  - Recording a turn on a finished game is rejected until reopen.
  - Reopen returns `in_progress` and allows scoring again.
  - Tests cover finish, blocked mutation, and reopen.

---

## 2. Persistence

### T2.1 Local game store

- **Goal:** Save and load a full game document via `GameStore` on `localStorage`.
- **Acceptance:**
  - Round-trip preserves id, players, turns, status, timestamps, optional words.
  - Works with no network.
  - Tests (unit or integration) cover save/load. Use a fake `localStorage` if needed.

### T2.2 Resume in-progress game

- **Goal:** Unfinished games survive restart (D17). Multiple in-progress games allowed.
- **Acceptance:**
  - After reload, the same in-progress game and turns are present.
  - Covered by test or a documented manual check if the environment cannot simulate reload easily.

---

## 3. Application use cases

Thin functions/services used by the UI. Keep them free of widget/DOM types.

### T3.1 Create-game and list-games use cases

- **Acceptance:** Creating persists a game; listing returns saved games (in progress and finished). Tests with a fake or real store.

### T3.2 Record / correct / finish / reopen / delete use cases

- **Acceptance:** Each operation loads, updates domain, saves. Errors from domain surface clearly. Delete requires an explicit confirm at the UI layer; the use case deletes. Tests with a store.

---

## 4. UI (mobile-first, Finnish copy)

Build screens against the use cases. Visual polish is secondary to usable flow. Visible strings in Finnish.

### T4.1 New game screen

- **Acceptance:** User can enter 2–4 names and start a game. Invalid counts are blocked in the UI.

### T4.2 Active game: standings + add turn

- **Acceptance:** UI highlights suggested current player; user may pick another. Integer score, optional word (0 = pass). Standings update immediately. Usable on a phone-width layout. Tailwind for layout.

### T4.3 Active game: undo/edit

- **Acceptance:** User can undo the last turn and edit score/word/player on any turn without leaving a broken total.

### T4.4 Finish / reopen

- **Acceptance:** User can finish; scoring is blocked until they reopen.

### T4.5 History list + past game detail

- **Acceptance:** In-progress and finished games appear in a list. Opening one shows players, totals, and turn history including optional words. Delete is available with confirmation.

---

## 5. Offline and wrap-up

### T5.1 Offline core check

- **Goal:** Data works offline after load (D10). Optionally add a Vite PWA plugin so a previously visited app opens offline.
- **Acceptance:**
  - Scoring and history work with network disabled after the app is loaded.
  - Document how to verify. Add shell caching only if implementing the PWA stretch.

### T5.2 MVP review

- **Goal:** Walk `docs/product-spec.md` MVP list 1–7 and tick each item.
- **Acceptance:** Gaps filed as follow-up tasks; no extra features added “while we’re here.”

---

## Out of backlog (do not pull in)

- Word validation, auto-scoring, accounts, sync, sharing, stats, payments, rulesets.

When those are wanted, add new tasks and a decision; do not expand T1–T5 silently.

---

## Implementation order (summary)

1. Confirm decisions (T0.1) — done
2. Scaffold Vite + React + Vitest (T0.2) — done
3. Domain + tests: game, turns, standings, undo/edit, finish/reopen (T0.3–T1.4) — T0.3 done
4. Persistence + resume (T2)
5. Use cases (T3)
6. Finnish UI flows (T4)
7. Offline verification / optional PWA (T5)

Domain before UI so the learning project practices testable logic first.
