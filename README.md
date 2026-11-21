# Leonida Trophy Guide — GTA 6

An offline trophy guide and tracker for **Grand Theft Auto VI**: all **55 trophies** (1 Platinum, 2 Gold, 6 Silver, 46 Bronze), with a checklist tracker, a Platinum roadmap, and the 100% completion checklist.

## How to run

```sh
node main.ts
```

Then open <http://localhost:8080> in a desktop browser. Use `PORT=3000 node main.ts` to pick a different port. No build step, no dependencies, no network calls — the app only serves local files.

## What it does

- **Checklist** — every trophy with its grade, category, difficulty estimate, unlock requirement and a short "how to" tip. Check trophies off as you earn them; progress is saved in your browser (localStorage) and shown as a percentage and per-grade count.
- **Filters** — search by name or keyword, filter by grade, category, or verification status, hide earned trophies.
- **Spoiler control** — story (hidden) trophies are masked by default; click "Reveal spoiler" per trophy, or uncheck "Hide story spoilers" to show them all.
- **Platinum Roadmap** — the three-step plan (story → 100% completion → Strangers & Freaks cleanup), ~200 hours, difficulty 4/10.
- **100% Checklist** — the exact numbers for "A Long Road" (robberies, collectibles, activities) from the in-game checklist.

## Trophy list at a glance

| Grade | Count |
| --- | --- |
| Platinum — Vice Got a Price! | 1 |
| Gold — You Gotta Know When to Get Off, A Long Road | 2 |
| Silver — Cunning Stunts, The Shootist, Strangers & Freaks, Don't Touch My Deck, You WAiNKer!, Maximum Withdrawal | 6 |
| Bronze | 46 |

## Things to know before you start

- **One potentially missable trophy: Positive Mental Attitude.** After the mission "Down to Earth", find Lucia at Jason's house in the morning; when she mentions meditating, follow her to the balcony and accept — before leaving Chapter 1.
- **Cheats disable trophies** (and saving) while active.
- **There is no mission replay**, so keep manual saves at the start and end of each of the five chapters (15 manual save slots).
- **Free roam continues after the story**, and progress earned earlier already counts toward 100% completion.
- **Five trophies are marked "Unconfirmed"** in the app (In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There, Ten Pin): the public guides flag their unlock methods as still being confirmed. Don't rely on unverified methods for those.

## Sources

Trophy names and requirements were compiled from public post-release guides (KeeNgamer, Push Square, Insider Gaming, games.gg, Mobalytics), checked 21 November 2026. Difficulty ratings are this guide's own estimates, not official ratings.

## Disclaimer

Unofficial fan guide. Not affiliated with Rockstar Games or Take-Two Interactive. Grand Theft Auto and GTA are trademarks of Take-Two Interactive.

## Files

- `main.ts` — Node.js (stdlib only) static server entry point
- `app/index.html` — app shell
- `app/style.css` — Vice City neon theme
- `app/app.js` — tracker, filters, tabs, roadmap rendering
- `app/trophies.js` — the 55-trophy dataset
- `screenshots/` — desktop screenshots of the running app
- `vendor/makefun-frontend.ts` — make.fun frontend helper (vendored, unmodified)
