# CSA Trainer

A free, single-page study app for the **ServiceNow Certified System Administrator (CSA)** exam.
It uses spaced repetition (flashcards that come back when you're about to forget them) plus timed-style quizzes,
tracks your mistakes, and estimates how ready you are.

**Open the app:** https://shakilsustswe.github.io/csa-trainer-app/

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

## Use your own questions (PDF, Excel, Word, anything)

Have practice questions in a PDF, an Excel sheet, a Word file or a CSV? Every file is laid out differently,
so the app lets an AI chat do the conversion. It takes about two minutes:

1. In the app, click **Import your own questions** (under the title), then **Copy AI prompt**.
2. Open any AI chat — ChatGPT, Claude, Gemini, Copilot… — paste the prompt, **attach your file**
   (or paste the questions under the prompt), and send.
3. For long files the AI answers in parts of 40 questions. Reply **continue** until it says **DONE**.
4. Copy **everything** the AI sent (all parts, one after another — extra chat text is fine)
   and paste it into the **Paste the AI's answer** box. Click **Check questions**.
5. The app shows how many questions it found and lists any with problems (for example, no answer).
   Ask the AI to fix those, or just click **Import** to load the rest.

Your questions stay **only in your browser** — nothing is uploaded. Each question set keeps its own progress,
and you can switch back to the built-in set at any time. Importing a new set replaces the previous imported set.

<details>
<summary><strong>The AI prompt</strong> (the same text the Copy button gives you)</summary>

```text
Convert the exam questions in my attached file (or the text below) into JSON for a study app.

Output ONLY a JSON array, with no other text before or after it. Each question is one object:

{
  "type": "single",
  "question": "Full question text, exactly as written (keep things like \"(Choose two.)\")",
  "options": [ {"id": "A", "text": "first option"}, {"id": "B", "text": "second option"} ],
  "correct": ["A"],
  "explanation": "Explanation from the source, or \"\" if there is none"
}

Rules:
1. "type" is "single" when exactly one option is correct, "multi" when two or more are correct.
2. Option ids are capital letters A, B, C, D, E, F in the order the options appear. If the source uses 1/2/3/4 or a/b/c/d, change them to A/B/C/D, and write "correct" using the same letters.
3. "correct" is always a list of letters, e.g. ["B"] or ["A", "C", "D"].
4. A question with no options, where the answer is typed in, uses "type": "text" and "answerText": "the answer" instead of "options" and "correct".
5. Copy the question, options, answers and explanations exactly. Do not invent, fix or improve anything. If a question has no answer in the source, still include it with "correct": [] (or "answerText": "" for a typed-answer question) so I can see it.
6. "explanation" gets ALL the explanation text for that question, in order: the reasoning, "why the other options are wrong", notes, tips, references. Leave out question titles/headings and the "Answer: X" line itself. Use \n between paragraphs.
7. Fix only broken line breaks and page headers/footers that interrupt a question.
8. Skip anything that is not a question (title pages, tables of contents, ads, glossaries).
9. Use straight double quotes, and escape any double quote inside text as \".
10. If there are more than 40 questions, send the first 40 as one JSON array and stop. When I reply "continue", send the next 40 as a new JSON array, and so on until all are done. Then say "DONE".

My questions:
```
</details>

**Tips**

- Scanned PDFs (photos of pages) work best with an AI that can read images, such as ChatGPT, Claude or Gemini.
- If answers are in a separate answer key at the end of the PDF, say so after the prompt:
  *"The answers are in the answer key on the last pages."*
- Questions in another language are kept in that language.
- Always spot-check a few imported questions against your source — AI can make mistakes.

### The JSON format (for people writing it by hand)

A JSON list; each question looks like the examples below.
`id` is optional (the app numbers questions in order).

```json
[
  {
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
    "type": "text",
    "question": "Name the table that holds every table definition.",
    "answerText": "sys_db_object",
    "explanation": "sys_db_object has one record per table."
  }
]
```

- `type`: `single` (one correct option), `multi` (two or more) or `text` (typed answer in `answerText`).
  If it's missing, the app works it out.
- `single`/`multi` need at least 2 `options`; `correct` lists their letters.
- `explanation` is optional.

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
npm test                                 # smoke test (every tab + a quiz) and import tests (messy AI output)
```

Open `dist/index.html` in a browser to try it.

### Deploying

Every push to `main` runs [`.github/workflows/pages.yml`](.github/workflows/pages.yml):
it builds the app, runs the test, and publishes `dist/` to GitHub Pages.
To publish your own copy: fork this repo, then in **Settings → Pages** set **Source** to **GitHub Actions**.
