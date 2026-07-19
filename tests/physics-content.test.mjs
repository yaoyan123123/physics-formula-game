import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { extractConst } from './helpers/inline-script.mjs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const CH = extractConst(html, 'CH');
const DATA = extractConst(html, 'DATA');

test('uses the 13 chapters from the 2019 PEP compulsory books', () => {
  assert.equal(Object.keys(CH).length, 13);
  assert.equal(CH[12].nm, '电能 能量守恒定律');
  assert.equal(CH[13].nm, '电磁感应与电磁波初步');
});

test('keeps a reviewed 71-card compulsory formula inventory', () => {
  assert.equal(DATA.length, 71);
  assert.ok(DATA.every(item => item.c >= 1 && item.c <= 13));
  assert.ok(DATA.every(item => item.n && item.f && item.k && item.t && item.w));
});

test('contains required circuit and electromagnetic foundations', () => {
  const byName = new Map(DATA.map(item => [item.n, item]));
  assert.equal(byName.get('闭合电路欧姆定律').f, 'I = 𝓔/(R + r)');
  assert.equal(byName.get('路端电压').f, 'U = 𝓔 − Ir');
  assert.match(byName.get('电磁波').f, /c = λf/);
});

test('uses magnitude formulas and explicit endpoint notation where required', () => {
  const byName = new Map(DATA.map(item => [item.n, item]));
  assert.equal(byName.get('库仑定律').f, 'F = k|q₁q₂|/r²');
  assert.equal(byName.get('点电荷的场强').f, 'E = k|Q|/r²');
  assert.equal(byName.get('电势差').f, 'U_AB = φ_A − φ_B = W_AB/q');
  assert.equal(byName.get('安培力').f, 'F = BILsinθ');
});

test('removes reviewed misleading claims and hard-coded formula marketing', () => {
  for (const banned of ['标量，恒为正', 'η 永远小于 100%', '有摩擦力做功就不守恒', '适用于金属导体和电解液']) {
    assert.doesNotMatch(html, new RegExp(banned.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.doesNotMatch(html, /67\s*条/);
  assert.doesNotMatch(html, /id="subCnt">67</);
  assert.doesNotMatch(html, /id="bM">0 \/ 67</);
  assert.doesNotMatch(html, /60\s*分合格/);
  assert.doesNotMatch(html, /评定\s*A\s*[~—-]\s*E/);
});
