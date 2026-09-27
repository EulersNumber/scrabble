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
- **Decision:** After the app has loaded, scoring and history work with the network off (local `GameStore` / `localStorage`; no network API). First-ever visit with no network, and App Store binaries, are out of MVP.
- **T5.1 (2026-09-26):** MVP offline core is **verified and documented** in `docs/offline.md`. An installable / offline app shell (PWA service worker, cold start offline, Add to Home Screen polish) is **deferred to post-MVP backlog P8** — not required to close T5.1. Cross-device shared history / family stats over time is backlog **P9** (separate from offline-after-load).

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
- **Post-MVP (2026-09-27):** **D36** supersedes the “log any seat” part. Seating order and pass = 0 stay. New turns must be for the current player; end-game / elimination are **D37** / **P5** / **P6**.

### D14. Score constraints (was O6)

- **Status:** accepted
- **Decision:** Integer scores only. Zero is allowed (pass). Negatives are allowed (challenge / table correction, and later end-game rack deductions in **D37**). No automatic bingo rule. Reject non-integers. No domain max; the UI may use a sanity cap (e.g. 9999) to catch typos. The keypad includes ± (D33). Everyday mid-game scores are usually 0 or positive; official leftover-tile negatives belong to the end-game flow (**D37** / **P5**), not typing −12 as a normal turn.

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

- **Status:** accepted (open-game delete added later in **D30**).
- **Decision:**
  - **Home** focuses on starting a game: primary control is **Uusi peli** (board-green primary button, large — spans the top row of a 2×2-style hub). Secondary controls open **Kesken olevat pelit** (continue list) and **Päättyneet pelit** (history list), side by side on the second row.
  - Continue list: in-progress only, newest `createdAt` first. History list: finished only, newest `finishedAt` first.
  - Opening an in-progress game goes to the active-game screen. Opening a finished game **reuses** that screen in its finished/read-only mode (reopen remains available). A dedicated past-game summary screen is post-MVP (**P7**).
  - **Delete** (with confirm) is available on the **continue and history lists**, for both in-progress and finished games.
- **Why:** Matches how the family plays (usually start → finish in one sitting); keeps home uncluttered; list delete covers abandoned/test games without opening them.
- **Follow-up:** Open-game delete added in **D30** after family play (T6.0).

### D30. Delete from open game detail (T6.0 / T7.2)

- **Status:** accepted (post-MVP).
- **Decision:** The open active-game / detail view may offer **delete with confirm** for the current game (in progress or finished), in addition to list delete (D29). After delete, leave the detail view (typically return home). Styling stays secondary/destructive so it does not compete with scoring. Placement moves into the top-bar game menu with **D34** (T7.3).
- **Why:** During a sitting, users look at the open game and expect to remove abandoned or test games there; list-only delete was easy to miss.

### D31. Calculator-style score entry (T6.0 / T7.4)

- **Status:** accepted (post-MVP).
- **Decision:** Turn point entry uses a large on-screen **digit pad** and a large primary confirm control (fat-finger friendly). The system keyboard is not required for entering points. Optional word may still use a text field. Pass remains an explicit zero path.
- **Why:** Family table play is thumb-driven; numeric `inputMode` keyboards are awkward for “enter score and OK.”
- **Shipped (T7.4):** The pad is a 3×4 calculator grid: 7 8 9 / 4 5 6 / 1 2 3 / ± 0 ⌫. Clear is a long-press on ⌫ (the grid has no separate C key). Digits that would exceed `SCORE_ABS_MAX` (9999) are ignored. No leading zeros. A lone minus is not a score yet. Pass stays **Vuoro ohi**, not a keypad key (D33). The same pad edits a turn on the history screen. Placing it in the single-player layout is T7.5.

### D32. Finnish word check approach (T6.0 / P17)

- **Status:** accepted direction (implement in **T8.x**, not before scoring UX).
- **Decision:**
  - Word check is **advisory only** — never blocks saving a turn score.
  - Do **not** scrape or depend on unofficial kielitoimistonsanakirja.fi APIs; full dictionary articles remain out of scope.
  - Prefer **offline** assets derived from Kotus open data (**Nykysuomen sanalista**, CC BY 4.0) for headword checks, then a later phase for **inflected forms** (paradigm expansion and/or Voikko-class morphology), with attribution.
  - Implement behind the existing empty dictionary seam in architecture.
- **Why:** Matches the user’s Kielitoimiston intent via the lawful open headword list; cabin play needs offline; morphology is a larger follow-up.

### D33. Single-player turn screen, keypad-dominant (replan 2026-09-27)

- **Status:** accepted (post-MVP; replaces the first T7.3 “trimmed dashboard” attempt, which was reverted).
- **Decision:** After setup (names + who starts), the in-progress game screen records **one turn for one player** at a time. Top → bottom:
  1. **Top bar** (D34): back, compact title, menu icon.
  2. **Podium standings banner**: ranked totals in a compact “olympic podium” shape (1st centre/tallest, 2nd left, 3rd right; a 4th player sits as a small chip beside the podium). Ties share a step (D15). The current player is highlighted. Totals stay derived (D3).
  3. **Current player** shown large — this is the only seat that can receive a new turn (**D36**). The name is not a picker. To fix a wrong player after the fact, use undo or edit in **Vuorot** (D11).
  4. **Score display + calculator keypad** (D31) take **most of the screen**: digits 0–9, backspace, clear, and a small sign toggle (±) for rare negative corrections (D14). **Pass is not a keypad key** — it is **Ohi** on the bottom bar.
  5. **Optional word** text field (system keyboard), visually secondary; never required (D18).
  6. **Bottom action bar**: **Kumoa** (undo last, short confirm, D11), **Ohi** (records 0, explicit pass), and the large primary **Seuraava pelaaja** (save this turn and advance to the next current player). Primary is disabled while no score is entered.
- **Finished games:** the same screen shows the podium (final result), a read-only notice, and **Avaa peli uudelleen**. There is no keypad or bottom bar (D16).
- **Not on this screen:** turn history, finish, delete, and settings. These go in the menu (D34).
- **Why:** Family play showed the table needs “enter this player’s points, next” with fat-finger targets; everything else is secondary.

### D34. Game top bar and menu (replan 2026-09-27)

- **Status:** accepted (post-MVP; refines D30 placement).
- **Decision:** Active-game secondary functions live behind a **menu icon in a top bar** and open as a sheet. Menu items: **Vuorot** (turn history screen with edit, D11), **Lopeta peli** (confirm, D16), **Poista peli** (confirm, D30), **Asetukset** (D35, once it exists). Undo stays on the turn screen's bottom bar because it is part of the scoring flow. Home gets the same top-bar pattern with a settings entry when settings land.
- **Turn history** becomes its own in-app screen (navigation state, D24): newest first, tap a row to edit player / score / word, back returns to the turn screen.
- **Why:** Keeps the first viewport about scoring; one predictable place for “more.”

### D35. App settings and sounds (replan 2026-09-27)

- **Status:** accepted (post-MVP; spec extension).
- **Decision:**
  - **Settings** are app-wide (not per game). They are stored as their own small JSON document in `localStorage` behind a `SettingsStore` (same pattern as D9). They are never mixed into the `Game` document.
  - First setting: **sounds on / off (mute)**. More settings are added only when a task needs them.
  - Sounds are short UI cues synthesized with the **Web Audio API**: no audio files, no dependency, and they work offline.
  - **Default: on.** Mute sits in Asetukset (reachable from the game menu and home top bar).
  - Cue families (confirmed):
    - **Progress** — **Seuraava pelaaja** (turn saved and the seat advances).
    - **Revert** — **Kumoa** (and a successful edit that undoes a mistake may reuse this family).
    - **Action** — **Ohi** (pass) and **Lopeta peli** (finish), so those taps are acknowledged without sounding like “next.”
  - No keypad-digit click sounds.
  - Sound playback is a UI concern. The domain and use cases never trigger sounds.
- **Why:** User wish for settings + sounds with mute; next vs undo should be distinguishable by ear.

### D36. Strict turn order (replan 2026-09-27)

- **Status:** accepted (post-MVP; supersedes D13’s “log any seat”).
- **Decision:**
  - Seating order stays `Game.players` list order. The starter is still chosen at create (D25).
  - `currentPlayerId` is **whose turn it is**, not a suggestion. A new turn must be for that player. `recordTurn` **rejects** any other `playerId`.
  - After a turn (score or pass) for the current player, the pointer advances to the **next active seat** (wrap). Until **P6** / **D37** land, every seated player is active.
  - The table must take an action for the current player: enter points and **Seuraava pelaaja**, or **Ohi**. There is no skip-ahead and no player picker on the turn screen.
  - **Undo last** still restores the previous current player. **Edit** on a historical turn may still change player / score / word (D11) — that is correction, not rotation. After edit/undo, current is recomputed from remaining history (next seat after the last remaining turn, or the starter if empty), then skip inactive seats once those exist.
  - Existing saved games stay valid: history may contain off-rotation turns from the MVP soft era. New recordings follow this rule.
- **Why:** Official Scrabble is sequential. Soft catch-up made the scorepad sloppy; mistakes are handled by undo/edit.
- **Still later:** skip eliminated players (**P6**); end when someone plays out and the bag is empty (**D37** / **P5**).

### D37. Official-style game end and leftover tiles (replan 2026-09-27)

- **Status:** accepted direction (post-MVP; do **not** implement in T7.3–T7.6). Promoted as **P5** / **T10.1**.
- **Decision:**
  - Mid-game, every active player must take a turn (D36). The game does **not** auto-end yet.
  - A later slice models the common end: a player **plays out** (uses their last tiles) **and** the pouch / bag is empty. The table confirms those facts — the app does not simulate the bag or racks until we add a thin confirmation, not a board engine.
  - Then remaining players enter **leftover rack values**. Those amounts are **deducted** from them and typically **added** to the player who went out. Record them as **explicit scoring events** on the turn list (D3 / D14 negatives live here), then **finish**.
  - Consecutive-pass endings and skip-twice elimination (**P6**) stay separate. Manual **Lopeta peli** remains until T10.1 ships.
- **Open when implementing T10.1:** Finnish tile-value table vs typing a single integer per opponent; whether empty-bag is a required confirm; house vs tournament wording; interaction with undo.
- **Why:** User confirmed negatives belong mainly to this end-game, not everyday scoring. Needs its own domain + UI, not a ± tap on a normal turn.

## Open

### Possible scope expansion (not in MVP)

- **Skip-twice → player eliminated** — direction captured in backlog **P6** (warn before the eliminating pass; remaining players continue). Exact tournament vs house wording still open when promoting.
- Automatic game end after a full round of consecutive passes (official-style), instead of only manual finish.
- Tile exchange as a first-class turn type (vs recording 0).
- **Real per-turn timer + cross-game pace/points stats** — direction captured in backlog **P1** (timer duration on each turn; later per-person averages across games). Still needs a decision on player identity across games when promoting (D12 has no roster in MVP).
- **Falling tile ambient UI** — implemented in **T7.1** (with **P10**): CSS/DOM tiles + math-driven specs (no canvas/WebGL); slow variable fall/spin; light sage shell shared by home and inner screens; `prefers-reduced-motion` uses static faces/backs.
- **Turn-focused active-game layout** — **D33 / D34** confirmed (bottom bar Kumoa · Ohi · Seuraava; pass not on keypad; ± on keypad; no player picker). Tasks **T7.3–T7.6**.
- **Strict rotation** — **D36** accepted; domain change lands with the turn-screen work (T7.5).
- **Settings / sounds** — **D35** confirmed (default on; progress / revert / action cue families).
- **Official play-out + empty bag + rack runoff** — **D37** / **P5** / **T10.1** (after the keypad screen).
- **Statistics and leaderboards** — backlog **P4** (family stats / boards across games; depends on identity + ideally P1 timer; lasting cabin-wide stats also need **P9**).
- **End-of-game rack tile runoff** — **D37** / **P5** / **T10.1** (play out + empty pouch; leftover values as explicit turns; not everyday keypad negatives).
- **Dedicated past-game detail / summary** — backlog **P7** (purpose-built finished-game view instead of reusing active-game read-only).
- **PWA / installable offline shell** — backlog **P8** (deferred from T5.1; cold start offline + Add to Home Screen).
- **Cross-device shared history** — backlog **P9** (cabin visitors on different phones; same people/stats over time). Priority vs **P8** still open when promoting.
- **Inflection engine choice for P17 phase B** — Voikko WASM vs generating forms from Kotus type tables; decide in **T8.2**.

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
| D10 (clarify) | 2026-09-26 | T5.1: offline-after-load documented; PWA stretch → P8; cross-device → P9 |
| P8 (backlog) | 2026-09-26 | PWA / installable offline shell deferred from T5.1 |
| P9 (backlog) | 2026-09-26 | Cross-device shared history + durable identity for cabin family stats |
| T6.0 / P15–P17 / D30–D32 | 2026-09-27 | Backlog triage; T7/T8 chunks; open-game delete, keypad, dictionary approach |
| T7.1 / P2+P10 | 2026-09-27 | Brand home + CSS falling tiles; AppShell atmosphere; canvas deferred |
| T6.0 / D30–D32 / P15–P17 | 2026-09-27 | Backlog triage: T7/T8 chunks; delete-from-detail; keypad; Kotus word-check approach |
| D33–D35 / P19–P20 | 2026-09-27 | Replan: single-player keypad turn screen with podium banner; top-bar game menu (history / finish / delete / settings); app settings + Web Audio sounds with mute. First T7.3 attempt reverted |
| D33–D37 confirm | 2026-09-27 | Bottom bar confirmed; strict rotation (D36); sounds default on with progress/revert/action cues; play-out + empty bag + rack runoff directed (D37) |
| T7.3 / D34 | 2026-09-27 | Top bar + game menu + turn history screen. Score form and soft picker unchanged until T7.4 / T7.5 |
| T7.4 / D31 | 2026-09-27 | Calculator keypad replaces numeric score fields on the turn form and history edit. Clear is long-press on ⌫ |
