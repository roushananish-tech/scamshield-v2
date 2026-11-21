import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const html = read('index.html');

test('accordion: every panel is a labelled region controlled by its button', () => {
  const buttons = [...html.matchAll(/<button[^>]*class="acc__btn"[^>]*>/g)].map((m) => m[0]);
  assert.ok(buttons.length >= 4);
  for (const b of buttons) {
    const id = /\bid="(acc-btn-\d+)"/.exec(b)?.[1];
    const controls = /aria-controls="(acc-\d+)"/.exec(b)?.[1];
    assert.ok(id && controls, `button needs id and aria-controls: ${b}`);
    assert.match(b, /aria-expanded="(true|false)"/);
    assert.match(html, new RegExp(`id="${controls}"[^>]*role="region"[^>]*aria-labelledby="${id}"`));
  }
});

test('accordion: exactly one panel starts open', () => {
  assert.equal((html.match(/class="acc__item is-open"/g) ?? []).length, 1);
  assert.equal((html.match(/aria-expanded="true"/g) ?? []).length, 1);
});

test('keyboard focus alone never opens a panel (no layout shift while tabbing)', () => {
  assert.doesNotMatch(read('src/site.js'), /addEventListener\(\s*['"]focus/);
});

test('live region is declared once, with a single role', () => {
  assert.equal((html.match(/id="status"/g) ?? []).length, 1);
  assert.doesNotMatch(html, /id="status"[^>]*aria-live/);
});

test('reason numbers are announced as words, not bare brackets', () => {
  const app = read('src/app.js');
  assert.match(app, /class: 'sr-only'[^)]*reason/);
  assert.doesNotMatch(app, /'sup', \{ 'aria-label'/);
});

test('every image has alt text (empty alt only when decorative)', () => {
  for (const tag of html.match(/<img\b[^>]*>/g) ?? []) assert.match(tag, /\balt="/, tag);
});
