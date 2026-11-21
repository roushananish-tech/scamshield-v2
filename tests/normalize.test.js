import test from 'node:test';
import assert from 'node:assert/strict';
import { normalize, toRawSpan } from '../src/engine/normalize.js';

test('lowercases and keeps plain text unchanged in length', () => {
  const n = normalize('Hello World');
  assert.equal(n.text, 'hello world');
  assert.equal(n.starts.length, n.text.length);
});

test('strips zero-width characters but keeps span mapping to the raw text', () => {
  const raw = 'ur​gent now';
  const n = normalize(raw);
  assert.equal(n.text, 'urgent now');
  const i = n.text.indexOf('urgent');
  const [a, b] = toRawSpan(n, i, i + 6);
  assert.equal(raw.slice(a, b), 'ur​gent');
});

test('folds Cyrillic look-alikes', () => {
  assert.equal(normalize('sbiоnline').text, 'sbionline'); // Cyrillic о
  assert.equal(normalize('Рaytm').text, 'paytm');           // Cyrillic Р
});

test('folds full-width characters (NFKC)', () => {
  assert.equal(normalize('ＯＴＰ').text, 'otp');
});

test('leet substitution only inside words, never in amounts or numbers', () => {
  assert.equal(normalize('sh4re pa5sword').text, 'share password');
  assert.equal(normalize('Rs1000 and 1930').text, 'rs1000 and 1930');
});

test('handles astral characters and empty input', () => {
  assert.equal(normalize('').text, '');
  const n = normalize('a😀b');
  assert.equal(n.starts.length, n.text.length);
  const j = n.text.indexOf('b');
  assert.equal('a😀b'.slice(...toRawSpan(n, j, j + 1)), 'b');
});

test('toRawSpan rejects empty or out-of-range spans', () => {
  const n = normalize('abc');
  assert.equal(toRawSpan(n, 2, 2), null);
  assert.equal(toRawSpan(n, 0, 99), null);
});
