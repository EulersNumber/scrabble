# Product specification

Small learning project: a **mobile-first Scrabble scorekeeping app** for family use.

The app accompanies a **physical** game of Scrabble. Players still use a real board and tiles. This app only records scores (and optionally the word played) and shows who is winning.

## Goals

- Make it easy to record a score after each turn.
- Immediately show cumulative scores and current rankings.
- Allow correcting mistakes (undo / edit a turn).
- Finish a game and keep it in history.
- Work for the core experience **offline**.

## Non-goals (not MVP)

Do not implement these unless the product spec is explicitly updated:

- Finnish (or any) word validation
- Automatic Scrabble scoring from tiles, premiums, or bingos
- Alternate Scrabble rulesets
- Detailed player statistics
- Leaderboards
- Sharing
- Cloud synchronization
- User accounts / authentication
- Social features
- Payments / subscriptions

These may be considered later. The architecture should leave a seam for **word validation** and **automatic scoring**, but MVP must not include them.

## Users and context

- Primary users: family members around a table.
- Typical session: one physical Scrabble game, 2–4 players, phone or tablet used as the scorepad.
- Connectivity: must not depend on a network for creating a game, scoring, standings, undo/edit, finishing, or viewing locally saved history.

## MVP requirements

### 1. Create a game and add 2–4 players

- A user can start a new game.
- The game has between 2 and 4 players (inclusive).
- Each player has a display name for that game.

### 2. Enter a player’s score for each turn

- After a physical turn, the user records that player’s score.
- A turn belongs to exactly one player and has a numeric score.
- The app does not calculate the score from tiles; the user types (or otherwise enters) the points.

### 3. Show cumulative scores and standings

- After each recorded turn, the UI shows each player’s **total**.
- The UI shows **current ranking** (who is ahead).
- Totals and rankings are derived from the turn list, not maintained as a separate competing record.

### 4. Undo / edit incorrect turns

- The user can correct a mistake.
- At minimum, they can undo or edit a recorded turn so the derived totals become correct again.
- Exact interaction (undo last only vs edit any turn) is an open product decision; see `docs/decisions.md`.

### 5. Finish and save a game

- The user can mark a game as finished.
- A finished game is retained in history with its players, turns, and derived final scores.

### 6. View previous games

- The user can open a list of previously saved games.
- The user can open a past game and see its outcome and turn history.

### 7. Optional word on a turn

- When recording a turn, the user **may** enter the word that was played.
- Word is optional. Empty/missing word is valid.
- The app does **not** check whether the word is legal.

## Core experience principles

- **Scorepad, not engine.** Trust the humans at the table for legality and tile math.
- **Immediate feedback.** After a turn is saved, standings update at once.
- **Forgiving.** Mistakes are expected; correction is part of the main flow.
- **Offline-first.** Local data is enough for MVP.
- **Mobile-first.** Primary layout and interaction target is a phone in the hand or on the table.

## Domain concepts (product view)

| Concept | Meaning |
| --- | --- |
| Game | One sitting of physical Scrabble: players + ordered turns + status (in progress / finished). |
| Player | A named participant in a specific game (2–4 per game). |
| Turn | One scoring event: who scored, how many points, when, optional word. |

Turn history is the source of truth. Cumulative scores are the sum of that player’s turn scores. Rankings are an ordering of those totals.

## Out of scope details (explicit)

The following are **not** required for MVP even if they often appear in “real” Scrabble apps:

- Tile rack, board, or premium-square UI
- Bingo / 50-point bonus as a special rule (user can include it in the number they enter)
- Passing, challenging, or exchanging tiles as first-class actions (a 0-point turn may be enough later; not specified)
- Clock / timer
- Multiple simultaneous in-progress games as a designed feature (not forbidden, not required)
- Player profiles that persist across games as a global identity system

## Success criteria for MVP

The family can:

1. Start a game and name 2–4 players.
2. Record scores turn by turn without the internet.
3. Always see current totals and who is winning.
4. Fix a wrong entry.
5. End the game and find it later in history.
6. Optionally note the word for a turn.

## Open product questions

Recorded in `docs/decisions.md`. They should be resolved before or during the related implementation task, not silently assumed.
