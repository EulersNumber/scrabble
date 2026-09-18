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

### D13. Turn order is freeform (was O5)

- **Status:** accepted (default; user did not override)
- **Decision:** Any player on the game may be given a score at any time. The app does **not** enforce seating rotation. A “likely next player” hint is not MVP.

### D14. Score constraints (was O6)

- **Status:** accepted
- **Decision:** Integer scores only. Zero is allowed (pass). Negatives are allowed (challenge / table correction). No automatic bingo rule. Reject non-integers. No domain max; the UI may use a sanity cap (e.g. 9999) to catch typos.

### D15. Ties in standings (was O7)

- **Status:** accepted
- **Decision:** Rank by total descending. Equal totals **share a rank** (1, 1, 3). Display order: total descending, then original player order. No extra tie-break.

### D16. Finished games (was O8)

- **Status:** accepted
- **Decision:** Finish is **reversible** (reopen to fix a missed turn). Finished games are read-only until reopened. Deleting a game from history is allowed, with confirmation.

### D17. Resume in-progress games (was O9)

- **Status:** accepted
- **Decision:** Unfinished games persist across reload/restart. Home lists in-progress and finished games. More than one in-progress game is allowed.

### D18. Optional word (was O10)

- **Status:** accepted
- **Decision:** At most one optional Unicode string per turn (Finnish letters allowed). Empty/omitted means not recorded. Do not model extra crossword words. No dictionary in MVP.

### D19. Finnish UI, English code (was O11)

- **Status:** accepted
- **Decision:** User-facing copy is Finnish. Identifiers, comments, docs, and tests stay English. No i18n framework; a small strings module is enough.

### D20. Distribution shape (was O12, P1)

- **Status:** accepted (shape); hosting provider still open
- **Decision:** Family distribution is a **static HTTPS URL** plus optional Add to Home Screen. Local Vite dev server is enough until then. Not TestFlight, Play Store, or sideloaded native builds for MVP.
- **Still open:** Which host (GitHub Pages or otherwise) — does not block scaffold.

---

## Open (does not block scaffold)

### O12b. Hosting provider

When the family should use a public URL, pick a static host. Until then, develop locally.

---

## Decision log

| ID | Date | Decision |
| --- | --- | --- |
| D1–D7 | 2026-09-18 | Product/architecture principles accepted from project brief |
| D8–D20 | 2026-09-18 | Stack (Vite + React + TS), Finnish UI, and MVP defaults from planning review |
| O12b | 2026-09-18 | Hosting provider deferred until distribution |
