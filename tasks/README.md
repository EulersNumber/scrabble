# MVP backlog

Small implementation tasks for the scorekeeping app. Stack and MVP defaults are **accepted** in `docs/decisions.md` (D8–D26), including soft rotation. **T0.1–T4.2 are done.** Continue from T4.3.

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

- **Status:** done (2026-09-18).
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

- **Status:** done (2026-09-18).
- **Goal:** Compute totals and ranking from turns only.
- **Acceptance:**
  - Totals equal the sum of that player’s turn scores.
  - Players with no turns total 0.
  - Ranking uses shared ranks on a tie (D15: 1, 1, 3), display order total then player order.
  - Tests cover several turns, zeros, and a tie.

### T1.3 Undo / edit turns

- **Status:** done (2026-09-18).
- **Goal:** Undo/remove last turn; edit score, word, and player on any turn (D11).
- **Acceptance:**
  - After undo/edit, standings match the remaining/changed turns.
  - Cannot delete a non-last turn.
  - Invalid edits are rejected (e.g. unknown turn).
  - Tests cover at least: undo last (including restored suggested player); one edit that changes a total; edit player.

### T1.4 Finish, reopen, and reject mutations while finished

- **Status:** done (2026-09-18).
- **Goal:** Finish a game; block scoring until reopen (D16).
- **Acceptance:**
  - `status` is `finished` and `finishedAt` is set.
  - Recording a turn on a finished game is rejected until reopen.
  - Reopen returns `in_progress` and allows scoring again.
  - Tests cover finish, blocked mutation, and reopen.

---

## 2. Persistence

### T2.1 Local game store

- **Status:** done (2026-09-26).
- **Goal:** Save and load a full game document via `GameStore` on `localStorage`.
- **Acceptance:**
  - Round-trip preserves id, players, turns, status, timestamps, optional words.
  - Works with no network.
  - Tests (unit or integration) cover save/load. Use a fake `localStorage` if needed.

### T2.2 Resume in-progress game

- **Status:** done (2026-09-26).
- **Goal:** Unfinished games survive restart (D17). Multiple in-progress games allowed.
- **Acceptance:**
  - After reload, the same in-progress game and turns are present.
  - Covered by test or a documented manual check if the environment cannot simulate reload easily.
- **Verified:** Unit tests create a fresh `GameStore` on the same memory storage (reload stand-in) and assert in-progress games, turns, and multi-game coexistence. UI continue entry point is T4.0 / T4.5.

---

## 3. Application use cases

Thin functions/services used by the UI. Keep them free of widget/DOM types.

### T3.1 Create-game and list-games use cases

- **Status:** done (2026-09-26).
- **Acceptance:** Creating persists a game; listing returns saved games (in progress and finished). Tests with a fake or real store.
- **Notes:** `listGames` does not sort (D26); home/history UI owns presentation order.

### T3.2 Record / correct / finish / reopen / delete use cases

- **Status:** done (2026-09-26).
- **Acceptance:** Each operation loads, updates domain, saves. Errors from domain surface clearly. Delete requires an explicit confirm at the UI layer; the use case deletes. Tests with a store.
- **Notes:** Also adds `getGame` for single-game load. Missing game id throws `ApplicationError`; domain rule failures remain `DomainError`.

---

## 4. UI (mobile-first, Finnish copy)

Build screens against the use cases. Visual polish is secondary to usable flow. Visible strings in Finnish.

Home must support both **new game** and **continue** (resume an in-progress game from local storage — D17 / T2.2). Exact Finnish labels are chosen when building the screens (candidates: “Uusi peli”, “Jatka”); no i18n framework (D19).

### T4.0 Home: new game + continue

- **Status:** done (2026-09-26).
- **Goal:** First screen after open: start a new game or continue an unfinished one.
- **Acceptance:**
  - User can start a **new game** (navigates to T4.1).
  - In-progress games are listed and can be **continued** into the active game screen (T4.2), not only viewed as read-only history.
  - Multiple in-progress games are allowed; each is selectable.
  - Finished games may appear here or only under history (T4.5); either is fine if continue vs past-game detail stays clear.
  - Finnish copy for the primary actions is set in this task (or with T4.5 if home and history share one screen).
- **Notes:** Finnish labels: “Uusi peli”, “Jatka”, “Kesken olevat pelit”. Home lists only in-progress games (newest first); finished games deferred to T4.5. New-game and active-game destinations are placeholders until T4.1 / T4.2. Navigation uses React screen state (no URL router yet, D24). Screens use theme tokens + UI primitives (D27). GitHub Pages deploy workflow added (D28) — enable Pages source once, then merge to `main` for `https://eulersnumber.github.io/scrabble/`.

### T4.1 New game screen

- **Status:** done (2026-09-26).
- **Acceptance:**
  - User can enter 2–4 names and start a game. Invalid counts are blocked in the UI.
  - After names are set, the user **picks who starts** (physical letter-draw at the table). That player becomes seat 1 / first suggested current; remaining players keep relative seating order after them (D13 / D25).
  - Name fields may **suggest** known names from saved history: prefer a mix of **most recently seen** and **most games played** (unique display names from past games only — no global player roster, D12). Suggestions are optional; empty history means no suggestions.
  - Autocomplete / dictionary for turn **words** is out of scope here (and out of MVP).
- **Notes:** Setup helpers in `src/ui/newGameSetup.ts` (validate, rotate starter, suggest). After create, navigates to the active-game placeholder (T4.2).

### T4.2 Active game: standings + add turn

- **Status:** done (2026-09-26).
- **Acceptance:** UI highlights suggested current player; user may pick another. Integer score, optional word (0 = pass). Standings update immediately. Usable on a phone-width layout. Tailwind for layout.
- **Notes:** Score helpers in `src/ui/activeGame.ts`. Player pick + standings use primitives (`PlayerPickList`, `StandingsList`). Pass shortcut submits score 0. Undo/edit and finish remain T4.3 / T4.4.

### T4.3 Active game: undo/edit

- **Acceptance:** User can undo the last turn and edit score/word/player on any turn without leaving a broken total.

### T4.4 Finish / reopen

- **Acceptance:** User can finish; scoring is blocked until they reopen.

### T4.5 History list + past game detail

- **Acceptance:**
  - In-progress and finished games appear in a list (may share the home screen from T4.0).
  - Opening an **in-progress** game continues scoring (active game). Opening a **finished** game shows detail: players, totals, turn history including optional words (read-only until reopen).
  - Delete is available with confirmation.

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

## Post-MVP ideas (not scheduled)

Capture product wishes here without pulling them into T1–T5. Promote to numbered tasks only after a decision update when we choose to build them.

### P1. End-of-game celebration + light recap (+ turn timer foundation)

- **Status:** idea (backlog only; not MVP).
- **Goal:** When a game is finished, show a short, light celebration moment, then a small recap screen (or overlay) with a few highlights.
- **Recap candidates:**
  - Winner and a simple podium / final standings
  - Highest single-turn score
  - Overall game length (`createdAt` → `finishedAt`)
  - Pace highlights driven by a **real per-turn timer** (not inferred from log timestamps)
- **Turn timer (product choice — accepted for post-MVP):**
  - Record **how long each turn took** as first-class data on the turn (start/stop or duration when the turn is saved).
  - Enables later stats: average time per turn, average points per turn, and **cross-game per-person** aggregates (how long someone usually takes, etc.).
  - Cross-game person stats imply a later naming/identity approach beyond today’s per-game display names (still no roster in MVP — D12); decide that when promoting stats work.
- **Notes:** Clock/timer and detailed stats stay out of MVP product scope until this is promoted. Celebration animation should stay modest. Depends on finish flow (T4.4) and history detail (T4.5). Do not implement until promoted.

### P2. Falling Scrabble-tile background animation

- **Status:** idea (backlog only; not MVP).
- **Goal:** Ambient rectangular letter tiles (like physical Scrabble tiles) fall slowly top → bottom with a slow spin (letter face sometimes visible, sometimes the back).
- **Screen treatment (product choice — accepted for post-MVP):**
  - **Home:** tiles are a **key visual** — prominent and engaging.
  - **Other screens** (new game, active game, history, etc.): same animation may still run, but **dimmed / pushed back** so focus stays on scores, words, and controls.
- **Approach sketch (when promoted):**
  - Store tile geometry (and letter face styling) in the codebase
  - Drive motion with a mathematical fall/spin definition (no heavy game-engine dependency unless we later decide otherwise)
  - Must not block taps or compete with primary content
- **Still open when promoting:** canvas vs CSS/WebGL; `prefers-reduced-motion` behavior; performance on older phones/iPads.
- **Notes:** Pure polish / engagement. Do not pull into T4–T5.

### P3. Turn-focused active-game UI (per-turn screen)

- **Status:** idea (backlog only; not MVP). Bigger UX direction than T4.2’s combined standings + form layout.
- **Goal:** Make scoring feel turn-centric instead of one dense “dashboard” for the whole game.
- **Sketch:**
  - Compact **standings banner** at the top (who’s leading / current totals)
  - Primary content is **this turn’s player**: large actions to record score or skip/pass, optional word
  - **Hint of who’s next** (soft rotation) without forcing that seat
  - Dimmed falling tiles (P2) behind the content on this screen
- **Why backlog, not now:** Needs undo/edit (T4.3) and finish (T4.4) designed into the same flow; reworking mid-T4 would churn unfinished screens. Finish the MVP scorepad path first, then promote this as a visual/UX pass (can replace or reshape the T4.2 layout).
- **Notes:** Does not change domain soft-rotation rules (D13); it’s presentation. Promote with a short decision + acceptance criteria before coding.

### P4. Statistics and leaderboards

- **Status:** idea (backlog only; not MVP). Wanted “at some point.”
- **Goal:** Family-facing **statistics** and **leaderboards** across saved games (and eventually across people), not only a single finished-game recap.
- **Candidates (when promoting, pick a thin first slice):**
  - Per-person aggregates: games played, wins, average score, average points per turn, average turn duration (needs **P1** timer + a durable person identity beyond D12 per-game names)
  - Leaderboards: e.g. most wins, highest single-game total, highest single turn, fastest average turn
  - Game-level history charts / simple lists are enough for v1; no cloud sync required if data stays local
- **Notes:** Explicitly out of MVP today (product non-goals). Depends on enough finished games in history (T4.5) and likely P1 timer data for pace stats. Promote with a decision on player identity / display-name matching before coding.

### P5. End-of-game rack adjustment (official-style tile runoff)

- **Status:** idea (backlog only; not MVP). Revisit later.
- **Goal:** Support the common Scrabble end rule: when a player **plays out** (uses their last tiles), remaining tiles on other players’ racks are **deducted** from those players’ scores and typically **added** to the player who went out (sum of face values of unplayed tiles).
- **Sketch for a scorepad (not a board engine):**
  - At finish (or a dedicated “lopetus” step), optionally enter each other player’s **remaining rack tile values** (or letter list if we later know tile values)
  - Domain records those adjustments as explicit scoring events (or a finish adjustment) so standings still derive from history (D3) — not a silent rewrite of totals
- **Open when promoting:** exact house vs tournament rule wording; whether empty-bag / consecutive-pass endings also apply; Finnish tile values table; UI for entering leftover tiles without building a full rack editor.
- **Notes:** MVP finish stays **manual** with user-entered turn scores only (no automatic tile math). This is ruleset/scoring seam territory — leave the boundary clean until promoted.

---

## Out of backlog (do not pull into MVP silently)

- Word validation, auto-scoring, accounts, sync, sharing, payments, alternate full rulesets.

Tracked as post-MVP ideas above (do not expand T1–T5 without a decision): **P1** turn timer / recap, **P2** falling tiles, **P3** turn-focused UI, **P4** statistics & leaderboards, **P5** rack end-of-game adjustment.

---

## Implementation order (summary)

1. Confirm decisions (T0.1) — done
2. Scaffold Vite + React + Vitest (T0.2) — done
3. Domain + tests: game, turns, standings, undo/edit, finish/reopen (T0.3–T1.4) — done
4. Persistence + resume (T2) — done
5. Use cases (T3) — done
6. Finnish UI flows (T4): T4.0–T4.2 done; continue from T4.3
7. Offline verification / optional PWA (T5)

Domain before UI so the learning project practices testable logic first.
