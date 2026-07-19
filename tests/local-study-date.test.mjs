import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { extractFunction } from './helpers/inline-script.mjs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const localDateKey = extractFunction(html, 'localDateKey');
const previousLocalDateKey = extractFunction(html, 'previousLocalDateKey', { localDateKey });

test('rolls the study date over at China midnight instead of UTC midnight', () => {
  assert.equal(localDateKey(new Date('2026-07-17T15:59:59Z')), '2026-07-17');
  assert.equal(localDateKey(new Date('2026-07-17T16:00:00Z')), '2026-07-18');
});

test('calculates the previous China-local calendar day', () => {
  assert.equal(previousLocalDateKey(new Date('2026-07-17T16:30:00Z')), '2026-07-17');
});

test('removes UTC ISO slicing from streak logic', () => {
  const streakBlock = html.slice(html.indexOf('function touchStreak'), html.indexOf('function startLevel'));
  assert.doesNotMatch(streakBlock, /toISOString/);
  assert.match(streakBlock, /localDateKey/);
});
