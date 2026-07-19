import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { extractConst, extractFunction } from './helpers/inline-script.mjs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const CH = extractConst(html, 'CH');
const DATA = extractConst(html, 'DATA').map((item, index) => ({ ...item, id: `q${index}` }));
const XK_Q = extractConst(html, 'XK_Q');
const shuf = list => list.slice();
const bookOf = extractFunction(html, 'bookOf');
const buildXKRound = extractFunction(html, 'buildXKRound', { DATA, XK_Q, shuf, bookOf });
const trainingLevel = extractFunction(html, 'trainingLevel');

test('builds 18 unique single-choice questions with the reviewed quota', () => {
  const round = buildXKRound();
  assert.equal(round.length, 18);
  assert.equal(new Set(round.map(item => item.key)).size, 18);
  assert.deepEqual(
    Object.fromEntries(['formula','condition','calc','context'].map(kind => [kind, round.filter(item => item.kind === kind).length])),
    { formula: 6, condition: 4, calc: 6, context: 2 },
  );
});

test('covers all three compulsory books every round', () => {
  const books = new Set(buildXKRound().map(item => bookOf(item.d.c)));
  assert.deepEqual([...books].sort(), [1, 2, 3]);
});

test('keeps authored questions single-answer and within the allowed kinds', () => {
  assert.ok(XK_Q.length >= 26);
  for (const q of XK_Q) {
    assert.ok(['condition','calc','context'].includes(q.kind));
    assert.equal(q.o.length, 4);
    assert.ok(Number.isInteger(q.a) && q.a >= 0 && q.a < 4);
    assert.ok(q.x && q.timeMs >= 20000 && q.timeMs <= 30000);
  }
});

test('returns training feedback rather than official pass claims', () => {
  assert.equal(trainingLevel(16, 18).label, '较为稳固');
  assert.equal(trainingLevel(13, 18).label, '基本掌握');
  assert.equal(trainingLevel(12, 18).label, '继续巩固');
});

test('labels the mode as a non-complete Hunan qualifying drill', () => {
  assert.match(html, /湖南学考·18 题公式冲刺/);
  assert.match(html, /不是完整试卷/);
  assert.doesNotMatch(html, /学考冲刺模拟卷/);
});
