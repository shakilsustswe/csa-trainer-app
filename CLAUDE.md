# CSA Trainer (public repo)

Single-file study app (spaced repetition + quizzes) for ServiceNow CSA exam prep, published on GitHub Pages.
Source: `template.html` (HTML/CSS/vanilla JS). `build.py` injects a question JSON into it -> `dist/index.html` (gitignored).

## Commands
- `python build.py` (default data: `data/sample-questions.json`; `--data FILE` for another set)
- `npm install && npm test` -> jsdom smoke test (built-in bank + a pre-seeded imported bank)
- Push to `main` -> `.github/workflows/pages.yml` builds, tests and deploys to Pages.

## Rules
- PUBLIC repo: never commit copyrighted exam-dump questions. Only original questions go in `data/`.
  Larger private question sets are loaded only through the in-app import, never committed here.
- Format of a question file and the import rules are documented in README.md; `validateBank()` in template.html enforces them.

## Architecture notes
- Question bank: `BUILTIN_DATA` (injected) or an imported bank stored in browser storage (`custom-bank`, `active-bank`).
  `loadBank()` runs before `loadSRS()`. `bankKey()` gives each bank separate progress keys (custom ones prefixed `custom-`).
- State: `srs` (Leitner boxes, INTERVALS), `mistakes` (REQUIRED_STREAK=5 to clear), `wrongHistory` (HARD_THRESHOLD=3 -> Hard list),
  `overrides` (Fixes tab).
- Storage: `storageGet/storageSet` use `window.storage` (Claude artifact host) else `localStorage` (prefix `csa_trainer_`).
  In jsdom tests, seed localStorage in `beforeParse`, since init runs at parse time.
- `render()` wraps `renderInner()` in try/catch with a recovery card. Backup/restore/reset panel is in the page footer.
