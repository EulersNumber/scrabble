# Agent instructions

This is a small family Scrabble **scorekeeping** app. It accompanies a physical game. It does not play Scrabble, validate words, or calculate tile scores.

## Read first

Before changing code or expanding scope, read:

1. `docs/product-spec.md` — what to build and what not to build
2. `docs/architecture.md` — layers, domain model, boundaries
3. `docs/decisions.md` — decided vs still open
4. `tasks/README.md` — current backlog and suggested order

Do not invent product features that are not in the spec.

## How to work

- Implement **one small task at a time**, with tests for important logic.
- Prefer Git-based incremental development: one focused change per commit when the user asks to commit.
- Keep the code easy to understand. Prefer a simple solution over premature extensibility.
- Do not add dependencies unless they are clearly needed for the current task. Ask first if unsure.
- Do not introduce agent/subagent/tooling complexity that the user did not request.

## Scope rules

**In MVP:** create a game, 2–4 players, enter turn scores, derived standings, undo/edit turns, finish and save, view history, optional word on a turn, works offline.

**Out of MVP:** Finnish word validation, automatic Scrabble scoring, rulesets, stats, leaderboards, sharing, cloud sync, accounts/auth, social features, payments.

Leave a **clean boundary** for later dictionary/scoring modules. Do not implement them.

## Architecture constraints

Separate, where practical:

- UI
- application / game use cases
- domain (Game, Player, Turn)
- persistence
- future Scrabble-specific logic (empty for now)

Turn history is the source of truth. Cumulative scores and rankings are derived from turns, not stored as a second source of truth.

## Technical choices (locked for MVP)

- TypeScript + React + Vite (mobile-first web). Not Expo / React Native.
- Package manager: npm. Styling: Tailwind CSS.
- Persist games as JSON in `localStorage` behind a store interface. No database library.
- UI copy in Finnish; code, comments, tests, and docs in English. No i18n framework.
- Domain must not import React.
- Do not add a PWA plugin until task T5.
- Do not add a router in scaffold; add when multi-screen UI needs it.
- Player names unique within a game (trimmed, case-insensitive).
- Soft rotation: seating order + suggested current player in domain; logging other players still allowed; pass = score 0.
- If a task requires a **new** major choice not in `docs/decisions.md`, stop and ask.

## Tests

- Domain and game-logic rules must have tests (player count, scoring, undo/edit, finish/reopen, derived standings).
- Do not require heavy UI E2E coverage for the first vertical slices.
- Do not skip tests in order to “move faster” on core logic.

## Documentation

When a product or architecture decision is made, update `docs/decisions.md` (and the spec/architecture if behavior changed). Keep docs as the source of truth; do not let the code silently diverge.
