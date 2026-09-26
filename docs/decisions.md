# Decisions

This file records **product and architecture decisions**. Open items need an explicit choice before the related code is written.

Status: `accepted` | `proposed` | `open`

---

## Accepted (from product intent)

### D1. The app is a scorepad for a physical game

- **Status:** accepted
- **Decision:** Users play real Scrabble. The app records scores and shows standings. It does not simulate the board or enforce word legality.
- **Why:** Matches the family use case; keeps MVP small; supports the learning goal of simple, testable software.

### D2. MVP feature set is fixed

- **Status:** accepted
- **Decision:** MVP is: create game, 2–4 players, enter turn scores, derived standings, undo/edit, finish and save, view history, optional word, offline core.
- **Out:** word validation, auto-scoring, rulesets, stats, leaderboards, sharing, cloud sync, accounts, social, payments.
- **Why:** Clear learning-sized scope.

### D3. Turn history is the source of truth

- **Status:** accepted
- **Decision:** Persist players + ordered turns + game status. Derive cumulative scores and rankings from turns. Do not keep a second authoritative score table.
- **Why:** Undo/edit stays consistent; totals cannot drift from history.

### D4. Separate UI, application logic, persistence, and future Scrabble logic

- **Status:** accepted
- **Decision:** Keep those boundaries in the codebase. Dictionary and automatic scoring are unused seams, not implemented modules.
- **Why:** Testable core; later features can attach without a rewrite; avoid mixing UI with rules.

### D5. Offline-first local data

- **Status:** accepted
- **Decision:** Creating, scoring, correcting, finishing, and viewing saved games must work without a network. No cloud in MVP.
- **Why:** Family table play; product requirement.

### D6. Prefer simple solutions; small tasks; tests for important logic

- **Status:** accepted
- **Decision:** Incremental Git-sized work. Test domain/use-case rules. Do not add architecture or tooling “for scale.”
- **Why:** Stated learning goal.

### D7. Players per game: 2–4

- **Status:** accepted
- **Decision:** A game cannot start with fewer than 2 or more than 4 players.
- **Why:** Product constraint. Standard Scrabble is often 2–4; keeps UI simple.

---

## Accepted (MVP architecture, 2026-09-18)

Chosen with the user (stack, UI language) or as recorded agent defaults after the planning review. Override here explicitly if the product changes.

### D8. Stack: TypeScript + React + Vite (was O1)

- **Status:** accepted
- **Decision:** Mobile-first web app: TypeScript, React, Vite. Not React Native / Expo, Flutter, or a native store app for MVP.
- **Why:** Simplest Windows workflow, strong learning overlap with AI-assisted web development, enough mobile UX for a scorepad, easy local testing. Domain stays plain TypeScript so it could move later.
- **Rejected:** Expo (native UX, but heavier tooling and family/iOS distribution). Other UI kits: no strong reason.

### D9. Persistence: localStorage behind a GameStore (was O2, P2)

- **Status:** accepted
- **Decision:** Each game is one JSON document (id, status, players, ordered turns). Persist via `localStorage`, accessed only through a `GameStore` (or equivalent) interface so IndexedDB or sync can replace it later. No database library in MVP.
- **Why:** Game data is tiny; round-trips are easy to test; matches the `Game` aggregate.

### D10. Offline bar for MVP (was O3)

- **Status:** accepted
- **Decision:** After the app has loaded, scoring and history work with the network off. An installable / offline app shell (PWA service worker) is **T5**, not a scaffold requirement. First-ever visit with no network, and App Store binaries, are out of MVP.

### D11. Correction model (was O4, P3)

- **Status:** accepted
- **Decision:**
  - Undo / remove the **last** turn only.
  - **Edit** score, optional word, and **player** on **any** turn.
  - Do not delete arbitrary older turns.
  - Standings always recompute from the turn list.
- **Why:** Covers “wrong points two turns ago” and “I logged the last play on the wrong person” without a full history editor.

### D12. Players are per game (was P4)

- **Status:** accepted
- **Decision:** Display names live on the game. No global player roster in MVP.

### D13. Turn order: soft rotation (was O5)

- **Status:** accepted
- **Decision:** Soft rotation.
  - Players have a **seating order** (`Game.players` list order). At create time the user picks who **starts** (after the physical letter draw); that player is placed first in the list and is the initial suggested current. Other players follow in seating order after the starter (see D25).
  - The domain tracks a **suggested current player** (whose turn it is at the table).
  - After a turn is recorded for player P, the suggested player becomes the **next seat after P** (wrap around).
  - The UI highlights the suggested player, but the user **may still record a turn for a different player** (late logging / catch-up).
  - A **pass** is a normal turn with score `0` (optional empty word). No separate pass entity in MVP.
  - **Undo last turn** also restores the previous suggested current player (so the pointer stays consistent with history).
- **In domain (tested game logic):** seating order, suggested-current pointer (or equivalent), advance-after-turn rule, allow non-suggested player when recording, restore pointer on undo-last.
- **Not in MVP domain:** tile bag, exchanges as a special action, challenges, “skip twice → eliminated,” automatic end when everyone passes in a row. The user still **finishes** the game manually.
- **Why soft, not strict:** Physical Scrabble is rotational; the app should reflect that. Soft mode keeps the rule in logic without blocking the scorepad when logging lags the board.
- **Why not full Scrabble turn ruleset now:** This product is a scorepad (D1). Encoding every official end-condition and house rule (e.g. two skips → drop out) is a scope expansion; leave seams, implement later if wanted.

### D14. Score constraints (was O6)

- **Status:** accepted
- **Decision:** Integer scores only. Zero is allowed (pass). Negatives are allowed (challenge / table correction). No automatic bingo rule. Reject non-integers. No domain max; the UI may use a sanity cap (e.g. 9999) to catch typos.

### D15. Ties in standings (was O7)

- **Status:** accepted
- **Decision:** Rank by total descending. Equal totals **share a rank** (1, 1, 3). Display order: total descending, then original player order. No extra tie-break.

### D16. Finished games (was O8)

- **Status:** accepted
- **Decision:** Finish is **reversible** (reopen to fix a missed turn). Finished games are read-only until reopened. Deleting a game is allowed, with confirmation (list UI placement in D29).

### D17. Resume in-progress games (was O9)

- **Status:** accepted
- **Decision:** Unfinished games persist across reload/restart. More than one in-progress game is allowed. Home is a **hub**: primary action is new game; secondary entry points open the continue list (in-progress) and history list (finished). See D29.

### D18. Optional word (was O10)

- **Status:** accepted
- **Decision:** At most one optional Unicode string per turn (Finnish letters allowed). Empty/omitted means not recorded. Do not model extra crossword words. No dictionary in MVP. Players may enter **points only**; typing a word is never required. Word autocomplete / lexicon lookup is **out of MVP** (future seam only).

### D19. Finnish UI, English code (was O11)

- **Status:** accepted
- **Decision:** User-facing copy is Finnish. Identifiers, comments, docs, and tests stay English. No i18n framework; a small strings module is enough.

### D20. Distribution shape (was O12, P1)

- **Status:** accepted
- **Decision:** Family distribution is a **static HTTPS URL** plus optional Add to Home Screen. Local Vite dev server remains fine for day-to-day coding. Not TestFlight, Play Store, or sideloaded native builds for MVP.
- **Host:** GitHub Pages (see D28; closes O12b).

---

### D21. Package manager: npm

- **Status:** accepted
- **Decision:** Use npm (not pnpm/yarn) for install and scripts.
- **Why:** No extra tool on Windows; matches Vite defaults.

### D22. Styling: Tailwind CSS

- **Status:** accepted
- **Decision:** Use Tailwind CSS for UI styling in MVP.
- **Why:** User preference; speeds mobile-first layout work. Still keep visual design simple.

### D23. Player names unique within a game

- **Status:** accepted
- **Decision:** Display names must be unique within a game after trim. Reject blank/whitespace-only names. Case handling: compare trimmed names case-insensitively for uniqueness (so “Aino” and “aino” collide).
- **Why:** User preference; avoids ambiguous standings labels.

### D24. Routing deferred past scaffold

- **Status:** accepted
- **Decision:** T0.2 scaffold has a single placeholder screen and no router. Add a router when multi-screen UI work starts (T4), if still needed.
- **Why:** Avoid an early dependency for a hello screen; routing is not required to start the app or run Vitest.

---

### D27. UI theme tokens and primitives

- **Status:** accepted
- **Decision:** Visual design lives in the UI layer only:
  - **Tokens** in `src/index.css` (`@theme`: board green, ink, surfaces, fonts, radii).
  - **Primitives** in `src/ui/primitives/` (`AppShell`, `Button`, `TextField`, `ChoiceChip`, `RadioGroup`, `FormError`, `ListRowButton`, `ScreenHeader`, …).
  - Screens **compose** primitives. They must not hard-code one-off control chrome (button/chip/input/radio/alert colors, borders, radii, focus rings) in screen files. Layout-only spacing/arrangement utilities on screens are allowed.
  - When a screen needs a new control look, **add or extend a primitive first**, then use it. Do not inline “just this once” control styles in `*Screen.tsx`.
  - Feature helpers that are pure functions for one flow may live beside that flow (e.g. `newGameSetup.ts`); split when large or reused. Not a global utils dump.
- **Layout:** Mobile-first scorepad column; wider on tablet (`md` / `lg` max-widths) so iPad use is comfortable without a full desktop dashboard.
- **Why:** Color/spacing edits stay in one place; domain and use cases stay design-agnostic; avoids the same review comment on every UI PR.
- **Out:** Component library packages, design-tool sync, dark mode for MVP.

### D28. Hosting: GitHub Pages (was O12b)

- **Status:** accepted
- **Decision:** Deploy the Vite production build to **GitHub Pages** from `main` via GitHub Actions (`.github/workflows/deploy-pages.yml`). Site path is `/scrabble/` → `https://eulersnumber.github.io/scrabble/`. Custom domain is optional later (priority 2; domain registration may cost money).
- **Why:** Free for a public repo; no extra hosting account; fits static SPA (client screen state, no server).
- **Enable once:** Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**, then merge to `main` (or run the workflow manually).

### D29. Home hub, history list, and list-only delete (T4.5)

- **Status:** accepted
- **Decision:**
  - **Home** focuses on starting a game: primary control is **Uusi peli** (board-green primary button, large — spans the top row of a 2×2-style hub). Secondary controls open **Kesken olevat pelit** (continue list) and **Päättyneet pelit** (history list), side by side on the second row.
  - Continue list: in-progress only, newest `createdAt` first. History list: finished only, newest `finishedAt` first.
  - Opening an in-progress game goes to the active-game screen. Opening a finished game **reuses** that screen in its finished/read-only mode (reopen remains available). A dedicated past-game summary screen is post-MVP (**P7**).
  - **Delete** (with confirm) is available on the **continue and history lists only**, for both in-progress and finished games. Not on the open active-game screen in MVP.
- **Why:** Matches how the family plays (usually start → finish in one sitting); keeps home uncluttered; list delete covers abandoned/test games without opening them; avoids another destructive control on the busy score screen.

## Open

### Possible scope expansion (not in MVP)

- **Skip-twice → player eliminated** — direction captured in backlog **P6** (warn before the eliminating pass; remaining players continue). Exact tournament vs house wording still open when promoted.
- Automatic game end after a full round of consecutive passes (official-style), instead of only manual finish.
- Tile exchange as a first-class turn type (vs recording 0).
- **Real per-turn timer + cross-game pace/points stats** — direction captured in backlog **P1** (timer duration on each turn; later per-person averages across games). Still needs a decision on player identity across games when promoted (D12 has no roster in MVP).
- **Falling tile ambient UI** — backlog **P2** (strong on home, dimmed elsewhere).
- **Turn-focused active-game layout** — backlog **P3** (standings banner + per-turn primary actions). Presentation-only vs soft rotation (D13); promote after MVP T4 screens work.
- **Statistics and leaderboards** — backlog **P4** (family stats / boards across games; depends on identity + ideally P1 timer).
- **End-of-game rack tile runoff** — backlog **P5** (when someone plays out, leftover rack values deducted from others and credited to the player who went out; scorepad entry, not a board engine).
- **Dedicated past-game detail / summary** — backlog **P7** (purpose-built finished-game view instead of reusing active-game read-only).

---

### D25. New-game starter pick and name suggestions

- **Status:** accepted
- **Decision:**
  - On the new-game screen (T4.1), after 2–4 names are entered, the user **selects the starting player** (reflecting the physical letter draw). Seating order is rotated so that player is first; suggested current starts as that player (D13).
  - Name entry may **suggest** display names derived from saved game history: a combination of **most recently seen** and **most frequently appearing** names. This is UI convenience only — still no global player roster (D12); suggestions are plain strings from past `Game.players`.
- **Why:** Matches table ritual (lowest letter starts) without encoding tile draws in domain; reuse of family names speeds setup once history exists.
- **Out:** Word autocomplete, dictionary, accounts, or a persisted player directory.

### D26. Game list presentation order is a UI concern

- **Status:** accepted
- **Decision:** `listGames` (and `GameStore.list`) return saved games with **undefined order**. Home, continue, and history screens choose sorting and filtering (e.g. newest first, in-progress vs finished).
- **Why:** Presentation varies by screen; the local game set is tiny. Keeping order out of domain and out of the list use case avoids baking a single ranking into the core. If a shared default or server paging is needed later, add it at the application/API boundary without touching scoring rules.
- **Rejected for MVP:** Sorting inside `listGames` or the store as the long-term “scalability” strategy.

## Decision log

| ID | Date | Decision |
| --- | --- | --- |
| D1–D7 | 2026-09-18 | Product/architecture principles accepted from project brief |
| D8–D20 | 2026-09-18 | Stack (Vite + React + TS), Finnish UI, and MVP defaults from planning review |
| O12b | 2026-09-18 | Hosting provider deferred until distribution |
| D13 | 2026-09-18 | Soft rotation accepted; full Scrabble turn/end rules deferred |
| D21–D24 | 2026-09-18 | npm, Tailwind, unique names, routing deferred |
| D13 (clarify), D18 (clarify), D25 | 2026-09-26 | Starter pick + history name suggestions at create; word entry stays optional / no autocomplete in MVP |
| D26 | 2026-09-26 | List/history sort and filter belong in UI; store/use-case list order undefined |
| D27 | 2026-09-26 | UI theme tokens + primitives; tablet-friendly shell |
| D27 (clarify) | 2026-09-26 | Screens must not inline control chrome; new controls → primitives first |
| D28 | 2026-09-26 | GitHub Pages hosting (closes O12b) |
| P6 (backlog) | 2026-09-26 | Skip-twice elimination + warning confirm captured as post-MVP idea |
| D29 | 2026-09-26 | Home hub + continue/history lists; list-only delete; reuse finished active-game view |
| P7 (backlog) | 2026-09-26 | Dedicated past-game summary captured as post-MVP idea |
