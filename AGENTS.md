# Agent instructions

This is a small family Scrabble **scorekeeping** app. It accompanies a physical game. It does not play Scrabble, validate words, or calculate tile scores.

## Read first

Before changing code or expanding scope, read:

1. `docs/product-spec.md` — what to build and what not to build
2. `docs/architecture.md` — layers, domain model, boundaries
3. `docs/decisions.md` — decided vs still open
4. `tasks/README.md` — current backlog and suggested order

Do not invent product features that are not in the spec.

## Development workflow

Do **one task at a time**, then stop for human review.

### Branch hygiene (do this before any code change)

Continuing a chat does **not** mean continuing the old branch. Merged task branches must not receive the next task’s work.

Before implementing (or when picking up the next task in an existing chat):

1. `git fetch origin --prune`
2. Check `git status` and `git branch -vv`. If the current branch is already merged, deleted on remote, or named for a previous task, leave it.
3. Update local `main`: `git checkout main` then `git pull origin main` (fast-forward only).
4. Create a **new** feature branch from that updated `main`, named for **this** task (e.g. `cursor/domain-finish-reopen` for T1.4).
5. If there is already uncommitted work on the wrong branch, move it onto the new branch (stash → update main → new branch → stash pop) before editing further.
6. Call `SetActiveBranch` for the new branch so the UI tracks the correct PR/diff base.

Never commit or push follow-up task work onto a branch whose PR is merged or whose remote was deleted. Do not reuse `main` for feature commits.

### Task loop

1. Read the task and only the docs needed for it.
2. State the approach briefly. Ask before a product or architecture decision that is not already in `docs/decisions.md`.
3. Implement only that task. Prefer a simple, readable solution. Do not add dependencies or extra abstractions unless they are clearly needed.
4. Add or update tests for important logic. Run the relevant tests, typecheck, and build. Check the task’s acceptance criteria and fix obvious issues.
5. Summarize what changed, what was verified, and anything still open. Then stop.

Do not start the next task, merge, open a PR, or push unless asked. Do not add agent/subagent/tooling complexity that was not requested.

When asked to commit, make one focused commit for the task on the current feature branch.

### Human review

The human decides when a task is ready to merge.

They do not need every line explained. The summary should make clear what changed, why it mattered, how it was tested, and any architectural implications.

If they ask about unfamiliar technology or code, explain it before making further changes. If they request a fix, change it and re-verify.

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

### Docstrings (required for exported logic)

Exported domain and application functions must have a short JSDoc comment that makes the code easy to read without tracing callers. Include:

- **Purpose** — what the function is for (and relevant decision IDs when helpful).
- **Behavior** — important rules, side effects, or invariants (e.g. soft rotation, read-only when finished).
- **Params** — `@param` for non-obvious inputs (types already appear in signatures; note constraints).
- **Returns** — `@returns` what the caller gets (especially when a new immutable value is returned).
- **Throws** — `@throws` for domain/application errors the caller should expect.

Prefer clarity over length. Skip noisy restatements of the type signature alone. Private helpers may use a one-line doc when the name is not enough.
