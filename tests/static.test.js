// Static checks on the shipped UI: security headers, accessibility basics.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const html = read('../index.html');
const app = read('../src/app.js');

test('page declares language, title and viewport', () => {
  assert.match(html, /<html lang="en">/);
  assert.match(html, /<title>[^<]+<\/title>/);
  assert.match(html, /name="viewport"/);
});

test('strict Content-Security-Policy forbids network and inline code', () => {
  const csp = /http-equiv="Content-Security-Policy" content="([^"]+)"/.exec(html)?.[1] ?? '';
  assert.match(csp, /default-src 'none'/);
  assert.match(csp, /connect-src 'none'/);
  assert.match(csp, /script-src 'self'/);
  assert.equal(/unsafe-inline|unsafe-eval/.test(csp), false);
});

test('no inline scripts, inline handlers, inline styles or external resources', () => {
  assert.equal(/<script(?![^>]*\bsrc=)/i.test(html), false);
  assert.equal(/\son[a-z]+\s*=/i.test(html), false);
  assert.equal(/\sstyle\s*=/i.test(html), false);
  assert.equal(/(src|href)="https?:\/\//i.test(html), false);
});

test('every form control has an associated label', () => {
  const ids = [...html.matchAll(/<(?:textarea|select)[^>]*\bid="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(ids.length >= 3);
  for (const id of ids) assert.match(html, new RegExp(`<label[^>]*for="${id}"`), id);
  assert.match(html, /<legend>/);
});

test('has skip link, live regions and landmarks', () => {
  assert.match(html, /class="skip" href="#input"/);
  assert.match(html, /role="status"/);
  assert.match(html, /<main/);
  assert.match(html, /<header/);
  assert.match(html, /<footer/);
});

test('UI code never uses innerHTML, eval or network calls', () => {
  assert.equal(/innerHTML|outerHTML|insertAdjacentHTML|document\.write|\beval\(|new Function|\bfetch\(|XMLHttpRequest|localStorage|sessionStorage/.test(app), false);
});

test('results do not rely on colour alone (icon and text label present)', () => {
  assert.match(app, /ICON/);
  assert.match(app, /aria-hidden/);
});
