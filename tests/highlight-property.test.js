// Property test: the sweep-line highlighter must match a naive reference on random input.
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSegments } from '../src/engine/highlight.js';

function reference(raw, signals) {
  const ids = Array.from({ length: raw.length }, () => new Set());
  for (const s of signals) {
    for (const [a, b] of s.spans) {
      for (let i = Math.max(0, a); i < Math.min(b, raw.length); i++) ids[i].add(s.n);
    }
  }
  const out = [];
  for (let i = 0; i < raw.length; i++) {
    const key = [...ids[i]].sort((x, y) => x - y);
    const last = out[out.length - 1];
    if (last && last.ids.join() === key.join()) last.text += raw[i];
    else out.push({ text: raw[i], ids: key });
  }
  return out;
}

function rng(seed) {
  let x = seed;
  return () => { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648; };
}

test('sweep-line segments equal the naive reference (500 seeded cases)', () => {
  const rand = rng(42);
  for (let c = 0; c < 500; c++) {
    const raw = 'abcdefghij'.repeat(1 + Math.floor(rand() * 5)).slice(0, 1 + Math.floor(rand() * 40));
    const signals = Array.from({ length: Math.floor(rand() * 5) }, (_, k) => ({
      n: k + 1,
      spans: Array.from({ length: 1 + Math.floor(rand() * 3) }, () => {
        const a = Math.floor(rand() * (raw.length + 4)) - 2;
        return [a, a + Math.floor(rand() * 12)];
      }),
    }));
    const got = buildSegments(raw, signals);
    assert.equal(got.map((s) => s.text).join(''), raw, `case ${c}: text must round-trip`);
    assert.deepEqual(got, reference(raw, signals), `case ${c}`);
  }
});
