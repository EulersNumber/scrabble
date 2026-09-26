# MVP review (T5.2)

Walk of `docs/product-spec.md` MVP requirements **1–7** against the running app (2026-09-26).

**Verdict:** MVP checklist **met**. No true MVP gaps found; no product-feature code changes in T5.2. Improvement ideas filed as post-MVP backlog (**P1–P14**). Next numbered work is **T6.0** (backlog triage / implementation plan).

## How it was verified

Automated browser smoke (Playwright, phone viewport 390×844) against local Vite:

1. Create 3-player game; starter pick **Matti** (not first entered name).
2. Record several turns: words (incl. Finnish letters), pass via **Vuoro ohi (0)**, non-suggested player.
3. Soft rotation: after Matti’s turn, **Liisa** marked **Ehdotettu**.
4. **Kumoa viimeisin** with confirm; then record again.
5. Tap an **older** turn (word `kissa`), edit score/word (`40` / `kissat`); standings update.
6. **Lopeta peli** → read-only → history list → open → **Avaa peli uudelleen** → one more turn → finish again.
7. Delete finished game with confirm; empty history copy.
8. New 2-player game, one turn, home → **Kesken olevat pelit** → **Jatka** resumes with prior word/score.
9. New-game screen shows **Ehdotukset aiemmista peleistä**.

Unit/integration suite: `npm test` (85 tests) and `npm run build` also green at review time.

Offline-after-load remains documented in `docs/offline.md` (T5.1); not re-litigated here. PWA cold start stays **P8**.

Screenshots from the sitting (under agent artifacts): home, new game, mid-game, after edit, finished, history list, resumed game, name suggestions.

## Checklist

| # | Requirement | Result | Evidence |
| --- | --- | --- | --- |
| 1 | Create game, 2–4 players, unique names, starter pick, optional name suggestions | **PASS** | New-game flow + starter radio + suggestion chips |
| 2 | Enter turn scores; soft rotation; pass = 0; non-suggested allowed | **PASS** | Multi-turn sitting + suggested badge advance + pass button + off-rotation log |
| 3 | Derived totals and standings | **PASS** | Standings update after record/edit; totals match turn math in smoke |
| 4 | Undo last; edit score/word/player on any turn | **PASS** | Undo confirm; older-turn inline edit |
| 5 | Finish, reopen, delete with confirm | **PASS** | Finish/reopen on active game; list-only delete (D29) |
| 6 | History list; resume in-progress; multi in-progress allowed | **PASS** | Finished list + continue list resume |
| 7 | Optional word (Unicode / Finnish letters); no validation | **PASS** | Words incl. `äiti`, `sähkö`; empty word on a turn |

## True MVP gaps

None found in this review.

## Follow-ups (not MVP)

See `tasks/README.md` post-MVP ideas **P1–P14**. UX/visual notes from this sitting are captured especially under **P3** (refined), **P7**, **P10–P14**. Do not implement those in T5.2.
