// Smoke test: loads dist/index.html in jsdom (localStorage fallback), clicks every tab and answers
// a quiz question. Then repeats with an imported ("custom") question bank pre-seeded in storage.
const { JSDOM } = require('jsdom');
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8');
const wait = ms => new Promise(r => setTimeout(r, ms));

const customBank = [
  { id: 'q1', type: 'single', question: 'Imported question one?', options: [{ id: 'A', text: 'Yes' }, { id: 'B', text: 'No' }], correct: ['A'], explanation: 'x' },
  { id: 'q2', type: 'multi', question: 'Imported question two?', options: [{ id: 'A', text: 'a' }, { id: 'B', text: 'b' }, { id: 'C', text: 'c' }], correct: ['A', 'B'], explanation: 'y' },
  { id: 'q3', type: 'text', question: 'Imported question three?', answerText: 'abc', explanation: 'z' },
];

async function run(label, seed) {
  const dom = new JSDOM(html, {
    runScripts: 'dangerously', url: 'https://example.com/',
    beforeParse(win) { if (seed) seed(win.localStorage); },
  });
  const errors = [];
  dom.window.addEventListener('error', e => errors.push(e.message));
  await wait(300);
  const doc = dom.window.document;
  for (const tab of ['overview', 'study', 'quiz', 'mistakes', 'browse', 'fixes']) {
    doc.querySelector(`[data-tab="${tab}"]`).click(); await wait(50);
  }
  doc.querySelector('[data-tab="quiz"]').click(); await wait(50);
  doc.getElementById('startquiz').click(); await wait(50);
  const opt = doc.querySelector('.opt'); if (opt) opt.click();
  doc.getElementById('submit').click(); await wait(50);
  doc.getElementById('bank-toggle').click(); await wait(20);
  if (!doc.getElementById('bank-file')) errors.push('import panel did not open');
  const sub = doc.querySelector('.sub').textContent;
  dom.window.close();
  return { label, errors, sub };
}

(async () => {
  const results = [];
  results.push(await run('built-in bank', null));
  results.push(await run('imported bank', ls => {
    ls.setItem('csa_trainer_active-bank', 'custom');
    ls.setItem('csa_trainer_custom-bank', JSON.stringify({ name: 'my-test-bank', questions: customBank }));
  }));
  const imported = results[1];
  if (!/\b3 questions\b/.test(imported.sub) || !imported.sub.includes('my-test-bank')) {
    imported.errors.push('imported bank not shown in header: ' + imported.sub.trim());
  }
  let failed = false;
  for (const r of results) {
    if (r.errors.length) { failed = true; console.log(`FAIL (${r.label}): ${r.errors.join('; ')}`); }
    else console.log(`PASS (${r.label}): all tabs + quiz flow OK`);
  }
  process.exit(failed ? 1 : 0);
})();
