// Tests the import helpers (prepareImport etc.) against the kinds of messy output AI chats produce.
const { JSDOM } = require('jsdom');
const fs = require('fs'), path = require('path');
const assert = require('assert');
const html = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8');
const sample = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/sample-questions.json'), 'utf8'));

const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'https://example.com/' });
const prepareImport = dom.window.eval('prepareImport');
const AI_PROMPT = dom.window.eval('AI_PROMPT');
const plain = v => JSON.parse(JSON.stringify(v)); // jsdom objects -> plain objects for deepStrictEqual

const tests = [];
const test = (name, fn) => tests.push([name, fn]);

test('plain JSON array imports as-is', () => {
  const r = prepareImport(JSON.stringify(sample));
  assert.strictEqual(r.total, 20);
  assert.strictEqual(r.problems.length, 0);
  assert.deepStrictEqual(plain(r.valid).map(q => q.id), sample.map(q => q.id));
});

test('chat text + ```json fences + two batches, with [brackets] inside strings', () => {
  const a = sample.slice(0, 12), b = sample.slice(12);
  const text = `Sure! Here are the first 12 questions:\n\`\`\`json\n${JSON.stringify(a, null, 2)}\n\`\`\`\nReply "continue" for more.\n\n` +
               `Here is the next batch:\n\`\`\`json\n${JSON.stringify(b, null, 2)}\n\`\`\`\nDONE`;
  const r = prepareImport(text);
  assert.strictEqual(r.total, 20);
  assert.strictEqual(r.problems.length, 0);
  assert.ok(r.valid[1].question.includes('[task]'));
  assert.deepStrictEqual(plain(r.valid).map(q => q.id), sample.map((_, i) => 'q' + (i + 1)));
});

test('{"questions": [...]} wrapper is accepted', () => {
  const r = prepareImport(JSON.stringify({ questions: sample.slice(0, 3) }));
  assert.strictEqual(r.valid.length, 3);
});

test('sloppy fields are normalized', () => {
  const r = prepareImport(JSON.stringify([
    { question: 'No type, string answer', options: [{ id: 'a', text: 'x' }, { id: 'b', text: 'y' }, { id: 'c', text: 'z' }], correct: 'b, c' },
    { question: 'Numbered options', options: [{ id: '1', text: 'one' }, { id: '2', text: 'two' }], correct: ['2'] },
    { question: 'Options as plain strings', options: ['red', 'green', 'blue'], answer: 'C.' },
    { question: 'Typed answer', answer: 'sys_db_object' },
    { type: 'single', question: 'Says single but two answers', options: ['p', 'q', 'r'], correct: ['A', 'B'] },
  ]));
  assert.strictEqual(r.problems.length, 0, JSON.stringify(plain(r.problems)));
  const [a, b, c, d, e] = plain(r.valid);
  assert.deepStrictEqual([a.type, a.correct], ['multi', ['B', 'C']]);
  assert.deepStrictEqual([b.options.map(o => o.id), b.correct], [['A', 'B'], ['B']]);
  assert.deepStrictEqual([c.type, c.options[2], c.correct], ['single', { id: 'C', text: 'blue' }, ['C']]);
  assert.deepStrictEqual([d.type, d.answerText], ['text', 'sys_db_object']);
  assert.strictEqual(e.type, 'multi');
});

test('bad questions are listed and skipped; the rest are renumbered', () => {
  const r = prepareImport(JSON.stringify([
    sample[0],
    { type: 'single', question: 'No answer in the source', options: [{ id: 'A', text: 'x' }, { id: 'B', text: 'y' }], correct: [] },
    { type: 'single', question: 'Answer letter missing from options', options: [{ id: 'A', text: 'x' }, { id: 'B', text: 'y' }], correct: ['D'] },
    sample[1],
  ]));
  assert.strictEqual(r.total, 4);
  assert.deepStrictEqual(plain(r.problems).map(p => p.n), [2, 3]);
  assert.strictEqual(r.problems[0].reason, 'No answer was given for this question.');
  assert.ok(/match any of the options/.test(r.problems[1].reason), r.problems[1].reason);
  assert.deepStrictEqual(plain(r.valid).map(q => q.id), ['q1', 'q2']);
});

test('cut-off JSON gives a helpful error', () => {
  const cut = JSON.stringify(sample).slice(0, 900);
  assert.throws(() => prepareImport(cut), /cut off|broken/);
});

test('empty and non-JSON text give clear errors', () => {
  assert.throws(() => prepareImport('   '), /Nothing to import/);
  assert.throws(() => prepareImport('1. Which table stores users?\nA. sys_user'), /Couldn't find any questions/);
});

test('the AI prompt describes the format the importer expects', () => {
  for (const s of ['"single"', '"multi"', '"text"', '"options"', '"correct"', '"answerText"', '"explanation"', 'continue', 'DONE']) {
    assert.ok(AI_PROMPT.includes(s), 'prompt is missing ' + s);
  }
});

// Optional local check: a large real-world set kept outside this repo.
const big = process.env.CSA_BIG_BANK;
if (big && fs.existsSync(big)) {
  test(`large set from CSA_BIG_BANK imports cleanly`, () => {
    const list = JSON.parse(fs.readFileSync(big, 'utf8'));
    const r = prepareImport(JSON.stringify(list));
    assert.strictEqual(r.problems.length, 0, JSON.stringify(plain(r.problems).slice(0, 3)));
    assert.strictEqual(r.valid.length, list.length);
  });
}

let failed = 0;
for (const [name, fn] of tests) {
  try { fn(); console.log('PASS (import): ' + name); }
  catch (e) { failed++; console.log('FAIL (import): ' + name + '\n    ' + e.message); }
}
dom.window.close();
process.exit(failed ? 1 : 0);
