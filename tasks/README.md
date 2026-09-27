# MVP backlog

Small implementation tasks for the scorekeeping app. Stack and MVP defaults are **accepted** in `docs/decisions.md` (D8–D30), including soft rotation. **T0.1–T7.1 are done** (MVP closed; post-MVP triage locked; brand/tiles landed). Continue from **T7.2**.

Each task should be one focused change, with tests where the task says so. Commit when the user asks. **One task (or one numbered chunk) per agent chat.**

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
- **Notes:** Finnish labels: “Uusi peli”, “Jatka”, “Kesken olevat pelit”. T4.5 turned home into a hub (D29) with separate continue/history lists. Navigation uses React screen state (no URL router yet, D24). Screens use theme tokens + UI primitives (D27). GitHub Pages deploy workflow added (D28).

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
- **Notes:** Score helpers in `src/ui/activeGame.ts`. Player pick + standings use primitives (`PlayerPickList`, `StandingsList`). Pass shortcut submits score 0. Undo/edit (T4.3) and finish/reopen (T4.4) follow.

### T4.3 Active game: undo/edit

- **Status:** done (2026-09-26).
- **Acceptance:** User can undo the last turn and edit score/word/player on any turn without leaving a broken total.
- **Notes:** Turn history below the score form (newest first). Undo last uses a short confirm (`ConfirmPanel`). Tap a turn to edit player/score/word inline (`TurnHistoryList`). Helpers in `activeGame.ts` (`turnsNewestFirst`). Finish/reopen follow in T4.4.

### T4.4 Finish / reopen

- **Status:** done (2026-09-26).
- **Acceptance:** User can finish an in-progress game from the active-game screen; scoring is blocked until they reopen.
- **Notes:** “Lopeta peli” at the bottom of the active-game screen with confirm (`ConfirmPanel`). Finished state hides scoring/undo/edit, shows read-only notice + “Avaa peli uudelleen” (D16). Header subtitle includes “Päättynyt”. History list for finished games is T4.5.

### T4.5 History list + past game detail

- **Status:** done (2026-09-26).
- **Acceptance:**
  - Home is a hub: primary **Uusi peli**, secondary **Kesken olevat pelit** and **Päättyneet pelit** (D29).
  - Opening an **in-progress** game continues scoring (active game). Opening a **finished** game reuses the active-game finished/read-only view (reopen still available).
  - **Delete** with confirmation on the **continue and history lists only** (not inside the open game). Covers both in-progress and finished games (T3.2 use case).
  - Finished list sorts by `finishedAt` newest first (D26).
- **Notes:** Finnish: “Päättyneet pelit”, “Ei päättyneitä pelejä.”, “Poista peli”, “Poistetaanko peli?”. Dedicated past-game summary UI is backlog **P7** if the reused finished view feels thin later.

---

## 5. Offline and wrap-up

### T5.1 Offline core check

- **Status:** done (2026-09-26).
- **Goal:** Confirm data works offline after load (D10); document verification. PWA shell caching was optional stretch — deferred.
- **Acceptance:**
  - Scoring and history work with network disabled after the app is loaded (local `GameStore`; see persistence tests + `docs/offline.md`).
  - How to verify is documented in `docs/offline.md`.
  - PWA / cold-start offline shell **not** added in T5.1 — captured as backlog **P8**. Cross-device shared history / cabin family stats over time captured as **P9**.
- **Notes:** MVP remains one scorepad device per sitting. T5.2 (MVP checklist walk) is a separate follow-up chat.

### T5.2 MVP review

- **Status:** done (2026-09-26).
- **Goal:** Walk `docs/product-spec.md` MVP list 1–7 and tick each item; capture UX ideas for backlog.
- **Acceptance:**
  - Product-spec MVP **1–7** walked against a full sitting (create → scores/pass/off-rotation → undo → edit older turn → finish → history → reopen → delete → resume); all **PASS**.
  - No true MVP gaps (docs-only task; no product-feature code).
  - Improvement ideas filed as backlog **P10–P14** (and notes on existing **P2/P3/P7**); no “while we’re here” feature work.
- **Notes:** Point-in-time review report was not kept as a living doc once insights were in the backlog. Next numbered work is **T6.0** (triage backlog into an implementation plan).

---

## 6. Post-MVP planning (after MVP close)

### T6.0 Backlog triage and implementation plan

- **Status:** done (2026-09-27).
- **Goal:** Review the full post-MVP backlog (**P1–P17**), prioritize with the human, and break the chosen slice into small numbered implementation tasks for separate chats.
- **Acceptance:**
  - Ordered shortlist (what to build next vs later / park).
  - Chosen items split into focused tasks with rough acceptance notes (no need to implement yet).
  - `tasks/README.md` updated so tomorrow’s work can pick one task at a time.
- **Notes:** Docs/planning only. Human priorities from family play + triage chat: (1) brand + falling tiles as one visual chunk, (2) turn-focused scoring with calculator keypad, (3) delete from open game detail, (4) Finnish dictionary later with feasibility notes. New backlog: **P15–P17**. Decisions: **D30** (delete from open game), **D31** (numeric keypad), **D32** (dictionary approach). **T7.1** done; next **T7.2**.

---

## 7. Post-MVP implementation (one chunk per agent)

Build in this order. Do not start the next numbered task until the previous is reviewed/merged unless the human says otherwise.

### Priority shortlist (T6.0)

| Priority | Build now | Park / later |
| --- | --- | --- |
| 1 | **P10 + P2** brand atmosphere + falling tiles (grouped) | **P1** celebration / turn timer |
| 2 | **P16** delete from open game detail | **P4** stats / leaderboards |
| 3 | **P3 + P15 + P13** turn-focused UI + calculator keypad + action hierarchy | **P5** rack runoff |
| 4 | **P11, P12, P14** polish | **P6** skip-twice elimination |
| 5 | **P17** Finnish word check (phased; after scoring UX) | **P7** dedicated past-game summary |
| — | — | **P8** PWA shell; **P9** cross-device sync |

### T7.1 Brand home + falling Scrabble tiles (P10 + P2)

- **Status:** done (2026-09-27).
- **Goal:** Give the home hub a strong brand/atmosphere signal, with ambient rectangular letter tiles that fall top → bottom and slowly spin (letter face sometimes visible). Same motion may run dimmed on other screens so focus stays on controls.
- **Acceptance:**
  - Home first viewport reads as one branded composition (product name hero-level; not a sparse button list on a flat green field).
  - Visual direction uses existing D27 tokens/primitives; extend `@theme` as needed. Avoid purple/AI-generic clichés and the cream/terracotta/serif cluster.
  - Falling tiles: mathematical fall/spin (no game-engine dependency); do not block taps; respect `prefers-reduced-motion` (static or no motion).
  - Other screens: tiles absent or clearly dimmed/pushed back.
  - No scorepad behavior changes.
- **Notes:** CSS/DOM tiles (no canvas). Square bevelled faces with Finnish point values; slow-ish fall, faster variable spin; near/far size. Light sage `AppShell` family. App display-font pass deferred. Next: **T7.2**.

### T7.2 Delete from open game detail (P16 / D30)

- **Status:** todo.
- **Goal:** Allow deleting the currently open game (in progress or finished) from the active-game / detail view, with the same confirm pattern as list delete.
- **Acceptance:**
  - Destructive control is secondary (not competing with “Tallenna vuoro”); confirm required.
  - After delete, navigate back to home (or continue/history list); game gone from store.
  - List delete remains.
  - Works for both `in_progress` and `finished`.
- **Notes:** Small independent chunk. Use cases already support delete (T3.2); this is UI + D30. Good to land before or right after the turn-UI rewrite so abandoned sittings are easy to clear while staring at the game.

### T7.3 Turn-focused active-game shell (P3)

- **Status:** todo.
- **Goal:** Reshape active game so the first viewport is “this turn,” not a long dashboard scroll.
- **Acceptance:**
  - Compact standings banner at top.
  - Primary content: current/suggested player, large score/pass actions, optional word secondary.
  - Hint of who’s next (soft rotation) without forcing that seat.
  - History / undo / finish as secondary navigation or sheets — not dominating the first viewport.
  - Domain soft-rotation rules unchanged (D13).
- **Notes:** Presentation only. Wire existing record/undo/edit/finish use cases. Numeric keypad is **T7.4** (can be same PR if small; prefer separate if either grows). Dimmed tiles from T7.1 may sit behind content.

### T7.4 Calculator-style score keypad (P15 / D31)

- **Status:** todo.
- **Goal:** Enter turn points with a large on-screen digit pad (no system keyboard for the score), plus a large primary OK / save control sized for fat-finger table use.
- **Acceptance:**
  - Digit pad primitive (D27): big hit targets; clear/backspace; builds an integer score.
  - Large primary confirm (e.g. OK / Tallenna) — hard to miss-tap.
  - Pass remains a clear secondary path (score 0).
  - Optional word still uses a text field when the user wants it; points entry must not require the system keyboard.
  - Works in add-turn and edit-turn flows (or edit gets the pad in a follow-up if scope blows up — note in PR).
  - Unit tests for pad value building / parse helpers where non-trivial.
- **Notes:** Depends on T7.3 layout (or lands together). Do not invent auto-scoring.

### T7.5 Action hierarchy pass (P13)

- **Status:** todo.
- **Goal:** Differentiate primary scoring actions from pass / undo / finish / delete so the eye lands on save first.
- **Acceptance:** New or extended Button / ConfirmPanel variants in primitives; screens compose them (no one-off chrome in `*Screen.tsx`).
- **Notes:** Often natural to fold into T7.3/T7.4; keep as its own checkbox so it is not forgotten. Skip a separate PR if already satisfied in those tasks.

### T7.6 Edit-turn affordance (P11)

- **Status:** todo.
- **Goal:** Make “edit a turn from two–three turns ago” obvious without teaching.
- **Acceptance:** Visible edit affordance or hint on history rows / under Vuorot; behavior still D11.

### T7.7 Richer game-list rows (P12)

- **Status:** todo.
- **Goal:** Continue/history rows show enough to recognize a sitting (e.g. leader or ordered totals), not only names + date + turn count.
- **Acceptance:** Derived from existing standings helpers; delete control stays clearly tied to its row.

### T7.8 Lightweight save feedback (P14)

- **Status:** todo.
- **Goal:** Brief confirmation after record/edit so table users trust the save.
- **Acceptance:** Subtle (toast, inline flash, or standings highlight) — not a noisy snackbar farm.

### T8.1 Dictionary seam + advisory headword check (P17 phase A)

- **Status:** todo (after T7 scoring UX; not top priority).
- **Goal:** First offline word-check slice: advisory lookup against Kotus **Nykysuomen sanalista** (CC BY 4.0), wired through the empty dictionary seam — not a scrape of kielitoimistonsanakirja.fi.
- **Acceptance:**
  - Optional word field can show valid / unknown against headwords (lemmas).
  - Never blocks recording a score (advisory only).
  - Attribution for Kotus / CC BY visible where appropriate.
  - Bundle or lazy-load strategy documented (size vs offline).
  - Tests for normalize + lookup helpers.
- **Notes:** Full Kielitoimiston sanakirja content/API is copyrighted and has no sanctioned public API for bulk use. See **P17** feasibility. Inflected forms (plurals, cases) are **T8.2**.

### T8.2 Inflected-form checking (P17 phase B)

- **Status:** todo (after T8.1).
- **Goal:** Check played surface forms (e.g. plural/case), not only dictionary headwords — via expanding Kotus inflection types and/or an offline morphology engine (e.g. Voikko WASM), still advisory.
- **Acceptance:**
  - Common noun/adjective/verb surface forms resolve when the lemma would.
  - Still offline-capable after assets cached; still advisory.
  - Decision update if a specific engine/dependency is chosen.
- **Notes:** Larger than T8.1; do not start until phase A proves useful at the table.

---

## Post-MVP ideas (reference)

Capture product wishes here. Promoted items stay listed with pointer to T7/T8 tasks.

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

- **Status:** done via **T7.1** (with P10).
- **Goal:** Ambient rectangular letter tiles (like physical Scrabble tiles) fall slowly top → bottom with a slow spin (letter face sometimes visible, sometimes the back).
- **Screen treatment:** Home = key visual; other screens = dimmed via `AppShell`.
- **Shipped approach:** CSS/DOM + `buildFallingTileSpecs`; `prefers-reduced-motion` → static mix of faces/backs; `pointer-events: none`.
- **Notes:** Grouped with **P10** as one agent chunk.

### P3. Turn-focused active-game UI (per-turn screen)

- **Status:** promoted → **T7.3** (keypad **T7.4**, hierarchy **T7.5**).
- **Goal:** Make scoring feel turn-centric instead of one dense “dashboard” for the whole game.
- **Sketch:**
  - Compact **standings banner** at the top (who’s leading / current totals)
  - Primary content is **this turn’s player**: large actions to record score or skip/pass, optional word
  - **Hint of who’s next** (soft rotation) without forcing that seat
  - Dimmed falling tiles (P2) behind the content on this screen
  - **History / undo / finish** as secondary navigation or separate sheets/screens so the first viewport is “this turn,” not the whole sitting
- **Notes:** Does not change domain soft-rotation rules (D13); it’s presentation. Calculator pad is **P15**. Confirmed pain from family play — promote early after brand chunk.

### P4. Statistics and leaderboards

- **Status:** idea (backlog only; not MVP). Wanted “at some point.”
- **Goal:** Family-facing **statistics** and **leaderboards** across saved games (and eventually across people), not only a single finished-game recap.
- **Candidates (when promoting, pick a thin first slice):**
  - Per-person aggregates: games played, wins, average score, average points per turn, average turn duration (needs **P1** timer + a durable person identity beyond D12 per-game names)
  - Leaderboards: e.g. most wins, highest single-game total, highest single turn, fastest average turn
  - Game-level history charts / simple lists are enough for v1; no cloud sync required if data stays **on one device**
- **Notes:** Explicitly out of MVP today (product non-goals). Depends on enough finished games in history (T4.5) and likely P1 timer data for pace stats. **Cabin-wide stats for the same people across visitors’ phones** also needs **P9** (cross-device shared history + identity). Promote with a decision on player identity / display-name matching before coding.

### P5. End-of-game rack adjustment (official-style tile runoff)

- **Status:** idea (backlog only; not MVP). Revisit later.
- **Goal:** Support the common Scrabble end rule: when a player **plays out** (uses their last tiles), remaining tiles on other players’ racks are **deducted** from those players’ scores and typically **added** to the player who went out (sum of face values of unplayed tiles).
- **Sketch for a scorepad (not a board engine):**
  - At finish (or a dedicated “lopetus” step), optionally enter each other player’s **remaining rack tile values** (or letter list if we later know tile values)
  - Domain records those adjustments as explicit scoring events (or a finish adjustment) so standings still derive from history (D3) — not a silent rewrite of totals
- **Open when promoting:** exact house vs tournament rule wording; whether empty-bag / consecutive-pass endings also apply; Finnish tile values table; UI for entering leftover tiles without building a full rack editor.
- **Notes:** MVP finish stays **manual** with user-entered turn scores only (no automatic tile math). This is ruleset/scoring seam territory — leave the boundary clean until promoted.

### P7. Dedicated past-game detail / summary

- **Status:** idea (backlog only; not MVP). Product note 2026-09-26.
- **Goal:** A screen purpose-built for viewing a finished sitting (summary / recap), instead of reusing the active-game finished state.
- **Why backlog:** T4.5 reuses the finished/read-only active-game view (standings, turns, reopen). Enough for MVP; a summarized “previous game” layout can wait until family play shows the gap.
- **Notes:** May overlap celebration/recap ideas in **P1**. Do not implement until promoted.
- **T5.2 note:** Finished view is functional but reads as “blocked active game” (reopen CTA + same history list). History list rows also omit winner / final totals — only names, date, turn count (**P12**).

### P6. Skip-twice → player eliminated (with warning)

- **Status:** idea (backlog only; not MVP). Product wish 2026-09-26.
- **Goal:** Support the common tournament-style rule: if a player **passes (score 0) twice in a row while others still score**, they are **eliminated** from further play; remaining players continue.
- **Why not MVP:** Explicitly out of MVP (D13 / product non-goals). Soft rotation + manual finish stay the scorepad default until this is promoted.
- **Sketch when promoted:**
  - Domain tracks consecutive passes **per player** (or equivalent) against the elimination rule; recording another pass that would eliminate triggers the rule.
  - **UI warning before the eliminating pass is saved:** confirm something like “Oletko varma? Toinen ohitus eliminoi pelaajan pelistä.” Cancel leaves the game unchanged; confirm records the pass and marks the player eliminated.
  - Eliminated players no longer take suggested turns; standings still show their totals from history.
  - Clarify exact rule wording when promoting (house vs tournament: which passes count, interaction with undo/edit, whether two remaining players / last player standing ends the game automatically).
- **Notes:** Today you can enter `0` for the same player many times with no elimination — that is intentional for MVP. Do not implement until promoted with a decision update.

### P8. PWA / installable offline shell

- **Status:** idea (backlog only; not MVP). Deferred from T5.1 (2026-09-26).
- **Goal:** After a previous online visit, the app shell opens offline (service worker / Vite PWA plugin), with optional Add to Home Screen polish (D20).
- **Why not in T5.1:** Weekend play can load once via hotspot; MVP offline bar is “after load, network off” (D10 / `docs/offline.md`). Cold-start offline and install UX are polish.
- **Open when promoting:** plugin choice; icons / Finnish short name; GitHub Pages `base` path; whether this outranks **P9** for the next post-MVP slice.
- **Notes:** First-ever visit with no network stays out of scope. Do not implement until promoted.

### P9. Cross-device shared history (cabin family over time)

- **Status:** idea (backlog only; not MVP). Product wish 2026-09-26.
- **Goal:** Different people / devices at the cabin can see **the same** game history and, longer term, **statistics for the same people over time** — not only whatever happens to be in one iPad’s `localStorage`.
- **Why backlog:** MVP is intentionally one local scorepad (D5 / D9). Cloud sync, accounts, and sharing are product non-goals today.
- **Sketch when promoting (pick a thin first slice):**
  - Durable **person identity** beyond per-game display names (D12) — required for “same people” stats (**P4**)
  - Sync or shared store so games created on one phone appear on another (export/backup may be a smaller stepping stone)
  - Auth / invite model only as heavy as the cabin use case needs
- **Open when promoting:** sync vs export-first; identity model; whether this outranks **P8** (PWA).
- **Notes:** Parents opening the URL on their own phones today each get an independent empty local store. Do not implement until promoted with a decision update.

### P10. Visual atmosphere and brand presence (home-first)

- **Status:** done via **T7.1** (with P2).
- **Goal:** Give the scorepad a clearer visual identity beyond flat green buttons on a flat surface — especially on **home**.
- **Shipped:** Felt-green hero gradient, larger display title, cream/inverse CTAs, falling-tile motif; D27 tokens/primitives extended (no marketing-site chrome).

### P11. Edit-turn discoverability and affordance

- **Status:** promoted → **T7.6**.
- **Goal:** Make “fix a turn from two–three turns ago” obvious without teaching. Today tap-to-edit works but history rows look read-only (no Muokkaa / pencil / hint).
- **Candidates:** edit affordance on rows; short hint under **Vuorot**; dedicated edit sheet/screen; keep undo for last-only mistakes.
- **Notes:** Behavior already meets MVP (D11). This is UX clarity only.

### P12. Richer game-list rows (winner / final totals)

- **Status:** promoted → **T7.7**.
- **Goal:** On **Päättyneet pelit** (and maybe continue), show enough to recognize a sitting at a glance — e.g. winner or ordered totals — not only names + date + turn count.
- **Notes:** Presentation-only; derive from existing standings helpers. Pairs well with **P7**. Delete control should stay clearly tied to its row.

### P13. Action hierarchy and destructive/secondary styling

- **Status:** promoted → **T7.5** (may fold into T7.3/T7.4).
- **Goal:** Differentiate primary scoring actions from pass / undo / finish / delete so the eye lands on **Tallenna vuoro** first and finish/delete feel appropriately secondary or cautious.
- **Candidates:** new Button variants or ConfirmPanel emphasis in primitives (D27); keep screens free of one-off chrome.
- **Notes:** Small design-system pass; lands with turn-focused UI.

### P14. Lightweight save / state feedback

- **Status:** promoted → **T7.8**.
- **Goal:** After recording or editing a turn, give a brief confirmation (toast, inline flash, or standings highlight) so table users trust the save without re-reading the whole history list.
- **Notes:** Keep subtle — family scorepad, not a noisy snackbar farm.

### P15. Calculator-style score keypad (fat-finger OK)

- **Status:** promoted → **T7.4** (D31).
- **Goal:** Replace system-keyboard score typing with a large on-screen digit pad and a large primary OK/save — table play with thumbs, minimal fat-finger errors.
- **Why:** Family play showed point entry is the hot path; a phone keyboard is the wrong tool for “enter 24 and confirm.”
- **Notes:** Optional word can still use a text field. Pass = explicit 0 path. Pairs with **P3**.

### P16. Delete from open game detail

- **Status:** promoted → **T7.2** (D30).
- **Goal:** Delete the currently open game (in progress or finished) from the active-game / detail screen, with confirm — not only from continue/history lists.
- **Why:** List delete already works (D29 / T4.5), but during a sitting people look at the open game and expect “Poista” there too.
- **Notes:** Use case already exists; UI + navigation after delete.

### P17. Finnish word check (Kielitoimiston / Kotus lineage)

- **Status:** idea → phased **T8.1 / T8.2** (after T7; not top priority). Feasibility captured 2026-09-27.
- **Goal:** Let players optionally check whether a played word is a known Finnish word, ideally **offline**, including common **inflected forms** (plurals, cases, etc.).
- **Product constraints:**
  - **Advisory only** — never block recording a turn score (scorepad trust stays with the table).
  - Prefer offline after assets are present (cabin / weak network).
- **Feasibility (research summary):**
  - **Kielitoimiston sanakirja** (full dictionary at kielitoimistonsanakirja.fi): copyrighted database; **no sanctioned public API** for app bulk/offline use. Unofficial private web APIs / scraping are fragile and inappropriate.
  - **Nykysuomen sanalista** (Kotus): ~100k+ **headwords** derived from Kielitoimiston sanakirja, with **inflection-type** and gradation codes; published **CC BY 4.0** as downloadable TXT — suitable to ship or build from for offline lemma checks (**T8.1**).
  - **Inflected surface forms:** headword list alone is not enough for Scrabble plays like *kissoja*. Options: (a) generate paradigms from Kotus type tables, (b) offline morphology such as **Voikko** (WASM builds exist; dictionary size / licensing / dependency review required in-task). That is **T8.2**.
  - Commercial MOT / Kielikone APIs exist but need network + licensing — poor fit for offline cabin use.
- **Notes:** Architecture already has an empty dictionary seam — implement against that. Attribution required for Kotus CC BY. Do not pretend full Kielitoimiston article text is embedded.

---

## Out of backlog (do not pull into MVP silently)

- Auto-scoring from tiles, accounts, sync, sharing, payments, alternate full rulesets (still out unless promoted).
- Scraping or unofficial use of kielitoimistonsanakirja.fi private APIs (see **P17** — use Kotus open sanalista / morphology instead).

Tracked ideas: **P1** turn timer / recap, **P2** falling tiles → T7.1, **P3** turn-focused UI → T7.3, **P4** statistics & leaderboards, **P5** rack end-of-game adjustment, **P6** skip-twice elimination, **P7** dedicated past-game detail, **P8** PWA shell, **P9** cross-device shared history, **P10** visual atmosphere → T7.1, **P11** edit affordance → T7.6, **P12** richer list rows → T7.7, **P13** action hierarchy → T7.5, **P14** save feedback → T7.8, **P15** calculator keypad → T7.4, **P16** delete from detail → T7.2, **P17** Finnish word check → T8.1/T8.2.

---

## Implementation order (summary)

1. Confirm decisions (T0.1) — done
2. Scaffold Vite + React + Vitest (T0.2) — done
3. Domain + tests: game, turns, standings, undo/edit, finish/reopen (T0.3–T1.4) — done
4. Persistence + resume (T2) — done
5. Use cases (T3) — done
6. Finnish UI flows (T4): T4.0–T4.5 done
7. Offline verification (T5.1) — done; PWA deferred to **P8**
8. MVP review (T5.2) — done; UX notes → **P10–P14**
9. Backlog triage (T6.0) — done; shortlist + **T7/T8** chunks; **P15–P17** added
10. Brand home + falling tiles (T7.1) — done
11. **Next agent:** **T7.2** delete from open game detail
12. Then T7.3 → T7.8 (scoring UX + polish), then T8.1+ (dictionary) when ready

Domain before UI so the learning project practices testable logic first.
