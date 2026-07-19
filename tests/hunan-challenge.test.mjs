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

test('uses accuracy-based training results and leaderboard copy', () => {
  assert.match(html, /训练正确率/);
  assert.match(html, /big:`\$\{qRight\} \/ \$\{qList\.length\}`/);
  for (const banned of ['合格线 60 分','未合格 · 等级','合格 ✓ · 等级','学考模拟最高分']) {
    assert.doesNotMatch(html, new RegExp(banned));
  }
});

test('shows the official Hunan paper structure without claiming full simulation', () => {
  assert.match(html, /物理考试 60 分钟，满分 100 分/);
  assert.match(html, /18 道单项选择题.*3 道实验题.*3 道计算题/s);
  assert.match(html, /训练只对应单选题基础部分/);
});
