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

## Proposed (defaults if you agree; not locked)

These are **recommendations**, not implementation licenses. Confirm or replace them.

### P1. Delivery: mobile-first web app that works offline

- **Status:** proposed
- **Suggestion:** A local, mobile-first web app (later optionally installable as a PWA) rather than a native store app for MVP.
- **Why:** Fastest path for a learning project, easy to test, no app-store account. Offline via local storage + (later) a service worker if we need true offline load of the app shell.
- **Tradeoff:** “Works offline” for **data** is easier than “open the app with no network on first visit.” A native app packages the UI; a web app needs a caching story for the shell.
- **Needs your input:** web vs PWA vs Capacitor/native.

### P2. Persistence: one local document per game

- **Status:** proposed
- **Suggestion:** Store each game as one record (id, status, players, turns). Mechanism TBD with the stack.
- **Why:** Matches the aggregate; simple save/load; easy to test.

### P3. Correction model: undo last turn + edit any turn’s score/word

- **Status:** proposed (product)
- **Suggestion:** Support deleting/undoing the most recent turn, and editing score/word on an existing turn. Recalculate standings from the list. Do not require a full event-sourcing undo stack of UI actions.
- **Why:** Covers “I entered 24 instead of 26” and “I logged the wrong player just now.”
- **Needs your input:** undo-last-only vs edit-any vs both.

### P4. Player identity is per game

- **Status:** proposed
- **Suggestion:** Names live on the game. No global player roster in MVP.
- **Why:** Avoids accounts and merge logic. History still shows names as they were that day.

---

## Open — need your input

### O1. Language, framework, and runtime

What should we use (examples only: TypeScript + Vite + React; Svelte; Flutter; native Android)?

Until this is decided, do not scaffold the application.

### O2. Persistence mechanism

Once O1 is known: `localStorage`, IndexedDB, SQLite, files, something else?

Constraint: must work offline and survive app restart.

### O3. How “offline” is defined

- **A:** Data operations work offline after the app is already loaded.
- **B:** The app can be opened and used with no network (installed PWA or native).

MVP wording requires a core experience that works offline; B is stronger and affects packaging.

### O4. Undo vs edit

- Undo only the last turn?
- Edit any past turn (player, score, word)?
- Delete any turn?
- Can you change who scored after the fact?

### O5. Turn order

- Freeform: any player can be given a score at any time (flexible if someone forgot to log).
- Strict rotation: the app enforces whose turn it is.

Family scorekeeping often works better as **freeform**, but this should be chosen.

### O6. Score constraints

- Integers only?
- Zero allowed (pass)?
- Negative allowed (challenge penalty / correction)?
- Maximum score?

### O7. Ties in standings

- Equal totals share a rank?
- Stable order by player add-order?
- Something else?

### O8. Finished games

- Is finish irreversible?
- Can you reopen a finished game to fix a score?
- Can you delete a game from history?

### O9. In-progress games across sessions

Should an unfinished game persist and be resumable after closing the app? (Recommended: **yes**, given offline/family use.) How many in-progress games?

### O10. Optional word

- One string per turn (simplest)?
- Multiple words (main word + crosses)?
- Character set / Finnish letters (ä, ö) without validation?

### O11. UI language

English UI, Finnish UI, or bilingual? (Family context is Finnish; the repo and docs are currently English.)

### O12. Distribution

How will family phones run it: local URL, hosted static site, installed PWA, sideloaded native app? Hosting is out of MVP functionally but affects O1/O3.

---

## Decision log

| ID | Date | Decision |
| --- | --- | --- |
| D1–D7 | 2026-09-18 | Product/architecture principles accepted from project brief |
| P1–P4 | 2026-09-18 | Proposed defaults; awaiting confirmation |
| O1–O12 | 2026-09-18 | Open; required before or during related tasks |
