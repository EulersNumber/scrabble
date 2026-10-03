# Offline core (MVP)

How the scorekeeping app meets **D5 / D10**, and how to verify it.

## What “offline” means in MVP

After the app **has loaded** in the browser, creating a game, scoring, undo/edit, finish/reopen, and viewing local history must work **with the network off**.

That is already true by design:

- Game data is stored only in the browser (`localStorage` via `GameStore`).
- App settings (sounds on/off) use a separate `localStorage` key via `SettingsStore`.
- Scoring and history use cases do not call a network API.
- There is no cloud sync in MVP.

**Not** in MVP (see backlog **P8** / **P9**):

- Opening the app for the first time with no network at all
- Installable PWA / service-worker shell so a cold start works offline
- Sharing the same games and person stats across phones (cabin / multi-device)

## One scorepad per device

MVP assumes **one device** is the scorepad for a sitting (e.g. an iPad at the table). History on that device stays on that device. Another phone that opens the site gets its own empty local store until we add cross-device sync (**P9**).

For a weekend game with a hotspot: open the site once while online, then play. If the hotspot drops mid-game, scoring should still work after the page is loaded.

## Automated evidence

Persistence tests in `src/persistence/localStorageGameStore.test.ts` round-trip games through an in-memory `localStorage` stand-in (no network). Resume / multi-game cases in the same file cover surviving a “reload” by constructing a fresh store on the same storage.

Domain and application tests likewise run without network.

## Manual verification (browser)

Use a desktop browser with DevTools (Chrome or Firefox). Against a local build or the deployed GitHub Pages site:

1. Open the app while online so scripts and assets load.
2. Create a game with 2–4 players, record a few turns (including a pass / score `0`), optionally finish one game.
3. Open DevTools → **Network** → check **Offline** (or equivalent “go offline”).
4. Confirm you can still:
   - Record another turn and see standings update
   - Undo / edit a turn
   - Open **Kesken olevat pelit** / **Päättyneet pelit** and open a saved game
   - Finish or reopen if you exercise those controls
5. Reload while still offline:
   - **Expected without PWA:** the tab may fail to reload (shell not cached). That is acceptable for MVP; data remains in `localStorage` for the next **online** load.
   - **With PWA later (P8):** a previously visited install should open and show the same local games.

Optional: on an iPad/phone, load the site on Wi‑Fi or hotspot, enable Airplane Mode (keep the tab open), and confirm scoring still works. Do not require a successful cold launch offline until **P8**.

## Production URL

Hosted build: `https://eulersnumber.github.io/scrabble/` (D28). First visit needs network to download the app shell.
