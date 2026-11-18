# CSA Trainer

A free, single-page study app for the **ServiceNow Certified System Administrator (CSA)** exam.
It uses spaced repetition (flashcards that come back when you're about to forget them) plus timed-style quizzes,
tracks your mistakes, and estimates how ready you are.

**Open the app:** https://shakilsustswe.github.io/csa-trainer/

No account, no sign-up, nothing is sent to a server — your progress is saved in your own browser.

> Not affiliated with or endorsed by ServiceNow. The built-in questions are original practice questions written for this project.

---

## How to use it (2 minutes)

1. Open the link above.
2. Go to **Study**, pick an answer, press **Check answer**, then honestly press **✓ Knew it** or **✗ Didn't know it**.
   Your honest choice is what schedules the card, so be truthful.
3. Questions you miss go to **Mistakes**. Answer one correctly **5 times in a row** to clear it.
4. Check **Overview** any time for your estimated score and the 15 questions worth studying next.

### The tabs

| Tab | What it's for |
|---|---|
| **Overview** | Estimated score, progress breakdown, and a "focus" list of your weakest questions |
| **Study** | Flashcards with spaced repetition (1 day → 2 → 4 → 9 → 20 days → mastered) |
| **Quiz** | 10 / 25 / 50 questions from: due & new, new only, all, or your mistakes — or a question range |
| **Mistakes** | *Active* (clear with 5 correct in a row) and *Hard* (missed 3+ times, kept permanently) |
| **Browse** | Search all questions, or read through them in order |
| **Fixes** | Think an answer is wrong? Override it — your fix is used everywhere from then on |

### Keep your progress safe

Progress lives in the browser you study in. To move it to another browser or device, or to keep a copy,
click **Back up / restore progress** at the bottom of the page, copy the text, and paste it into **Restore** on the other side.

---

## Use your own questions

Click **Import your own questions** under the title and choose a `.json` file.
The file is read **only inside your browser** — it is never uploaded. Each question bank keeps its own progress,
and you can switch back to the built-in set at any time.

The file is a JSON list of questions:

```json
[
  {
    "id": "q1",
    "type": "single",
    "question": "Which table stores user accounts?",
    "options": [
      { "id": "A", "text": "sys_user" },
      { "id": "B", "text": "sys_user_group" }
    ],
    "correct": ["A"],
    "explanation": "User records live in sys_user."
  },
  {
    "id": "q2",
    "type": "multi",
    "question": "Which tables extend Task? (Choose two.)",
    "options": [
      { "id": "A", "text": "incident" },
      { "id": "B", "text": "problem" },
      { "id": "C", "text": "sys_user" }
    ],
    "correct": ["A", "B"],
    "explanation": "Incident and Problem both extend Task."
  },
  {
    "id": "q3",
    "type": "text",
    "question": "Name the table that holds every table definition.",
    "answerText": "sys_db_object",
    "explanation": "sys_db_object has one record per table."
  }
]
```

Rules the importer checks:

- `id` is `q` + a number (`q1`, `q2`, …) and is unique.
- `type` is `single` (exactly one correct option), `multi` (one or more), or `text` (typed answer in `answerText`).
- `single` / `multi` need at least 2 `options`, each with an `id` and `text`, and `correct` must use those option ids.
- `explanation` is optional.

If something is wrong, the app tells you which question and why.
A complete example is in [`data/sample-questions.json`](data/sample-questions.json).

> Please only import questions you have the right to use, and don't commit copyrighted exam material to a public repository.

---

## For developers

The whole app is one file: [`template.html`](template.html) (HTML, CSS and plain JavaScript, no framework).
`build.py` injects a question file into it and writes `dist/index.html`.

Requirements: Python 3 and Node.js (Node is only needed for the test).

```bash
python build.py                          # build with the sample questions -> dist/index.html
python build.py --data my-questions.json # build with your own file (keep that build private)
npm install                              # once, installs jsdom for the test
npm test                                 # smoke test: every tab + a quiz, with the built-in and an imported bank
```

Open `dist/index.html` in a browser to try it.

### Deploying

Every push to `main` runs [`.github/workflows/pages.yml`](.github/workflows/pages.yml):
it builds the app, runs the test, and publishes `dist/` to GitHub Pages.
To publish your own copy: fork this repo, then in **Settings → Pages** set **Source** to **GitHub Actions**.
