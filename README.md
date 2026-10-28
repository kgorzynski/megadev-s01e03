# megadev-s01e03: what ticket #4471 really holds

The support desk merged 412 date reports into one ticket, #4471, and marked it "known": one bug, one fix queued.
The reports describe three different problems. Each one needs its own fix.

| problem | reports | ticket |
|---|---|---|
| `parser`: the shared parser reads every date month first | 374 | (pending) |
| `hint`: the booking-v3 form tells people to type month first | 33 | (pending) |
| `one-day move`: a date lands one day early (time zone or day boundary) | 5 | (pending) |
| **total** | **412** | |

The export has 427 rows. 15 reports appear twice as exact copies. Each id counts once, so the total is 412.

## The three problems

1. **parser (374 reports).** All 11 tenants write the day first. The shared parser reads month first, so day and month swap: 7 April becomes 4 July. It comes in on every channel (app, email, the booking-v2 form). 4 of these reports name no dates, only "the wrong day"; the kb rule files them under parser and so do we.
2. **hint (33 reports).** The booking-v3 form prints `MM/DD/YYYY` under its date field. People type month first, as told. The form reads the date day first. Only the form channel of the 3 booking-v3 tenants (alder.physio, copper.studio, pale.harbour). A parser fix does not fix it. The kb already says it "has no ticket of its own".
3. **one-day move (5 reports: R-41202, R-41209, R-41236, R-41344, R-41620).** The date does not swap; it moves by one day (Tuesday shows as Monday). A day/month swap cannot do that. It looks like a time zone or day-boundary bug: "Client in Lisbon got Tuesday. Client in Toronto got Monday."

**Where we differ from the kb.** The kb rule (`src/lib/kb/causes.ts`) knows two causes. It counts parser = 379, because it files the 5 one-day moves under parser by tenant and only footnotes them (the desk lists them in `src/lib/data/desk-notes.json`). We file them as their own problem: 379 − 5 = 374.

## What is in this repo

- `src/`: the kb export (unchanged, from `kb-export-267efc5e.zip`), plus:
  - `src/routes/kb/incidents/4471-causes/+page.svx`: the new signed page.
  - `src/lib/kb/problems.ts`, `src/lib/kb/ProblemSplit.svelte`: the three-way split. The page types no counts; the component computes them from the data at render time.
- `KB-README.md`: the kb export's own README and conventions.
- `scripts/analyze.py` and its output `scripts/analysis.md`: an independent check in Python. It reads every report body and groups by cause and by what the dates do (swap or one-day move). It lists every report id per problem.
- `docs/4471-causes.png`: the page as the desk sees it (headless browser). `docs/4471-causes.html`: the built HTML.

## Build

```sh
npm ci
npm run build        # SvelteKit + mdsvex, static site in build/
npm run shot         # screenshot the page into docs/ (needs Brave or Chromium)
npm run analyze      # re-run the Python check
```

Signed page: signature `kgorzynski`, desk ref `DR-TSAA-0674`.
