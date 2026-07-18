import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const html = readFileSync(new URL('../daan.html', import.meta.url), 'utf8');

const previews = {
  'yuwen-sj': 8,
  'yuwen-da': 2,
  'shuxue-sj': 4,
  'shuxue-da': 4,
  'yingyu-sj': 10,
  'yingyu-da': 3,
  'wuli-sj': 6,
  'wuli-da': 2,
  'huaxue-sj': 8,
  'huaxue-da': 1,
  'shengwu-sj': 6,
  'shengwu-da': 1,
  'zhengzhi-sj': 6,
  'zhengzhi-da': 1,
  'lishi-sj': 4,
  'lishi-da': 2,
  'dili-sj': 6,
  'dili-da': 1,
};

const originalDownloads = [
  'papers/yuwen-shijuan.pdf',
  'papers/yuwen-daan.docx',
  'papers/shuxue-shijuan.pdf',
  'papers/shuxue-daan.pdf',
  'papers/yingyu-shijuan.pdf',
  'papers/yingyu-daan.pdf',
  'papers/wuli-shijuan.pdf',
  'papers/wuli-daan.pdf',
  'papers/huaxue-shijuan.pdf',
  'papers/huaxue-daan.pdf',
  'papers/shengwu-shijuan.pdf',
  'papers/shengwu-daan.pdf',
  'papers/zhengzhi-shijuan.pdf',
  'papers/zhengzhi-daan.pdf',
  'papers/lishi-shijuan.pdf',
  'papers/lishi-daan.docx',
  'papers/dili-shijuan.pdf',
  'papers/dili-daan.pdf',
];

test('puts the physics full-color solution before the all-subject section', () => {
  const physicsIndex = html.indexOf('id="physics-color"');
  const subjectsIndex = html.indexOf('id="all-subjects"');
  assert.notEqual(physicsIndex, -1, 'missing physics full-color section');
  assert.notEqual(subjectsIndex, -1, 'missing all-subject section');
  assert.ok(physicsIndex < subjectsIndex, 'physics full-color section must come first');
});

test('connects every rendered paper and answer to the inline preview viewer', () => {
  for (const [key, pageCount] of Object.entries(previews)) {
    assert.match(html, new RegExp(`data-preview=["']${key}["']`), `missing preview button for ${key}`);
    assert.match(html, new RegExp(`["']${key}["']\\s*:\\s*${pageCount}`), `wrong page count for ${key}`);
  }
});

test('keeps all original paper and answer downloads available', () => {
  for (const href of originalDownloads) {
    assert.match(html, new RegExp(`href=["']${href.replaceAll('.', '\\.') }["']`), `missing original download ${href}`);
  }
});

test('provides an accessible, navigable in-page preview dialog', () => {
  assert.match(html, /id=["']previewViewer["'][^>]*role=["']dialog["']/);
  assert.match(html, /id=["']previewImage["']/);
  assert.match(html, /id=["']previewPrev["']/);
  assert.match(html, /id=["']previewNext["']/);
  assert.match(html, /id=["']previewClose["']/);
  assert.match(html, /keydown/);
  assert.match(html, /touchstart/);
  assert.match(html, /touchend/);
});
