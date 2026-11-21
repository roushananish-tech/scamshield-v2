import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSegments } from '../src/engine/highlight.js';

test('segments always concatenate back to the raw text', () => {
  const raw = 'Your account will be blocked today. Click now!';
  const segs = buildSegments(raw, [
    { n: 1, spans: [[5, 34]] },
    { n: 2, spans: [[21, 34], [36, 45]] },
  ]);
  assert.equal(segs.map((s) => s.text).join(''), raw);
});

test('overlapping signals share a segment', () => {
  const segs = buildSegments('abcdef', [{ n: 1, spans: [[0, 4]] }, { n: 2, spans: [[2, 6]] }]);
  assert.deepEqual(segs.map((s) => [s.text, s.ids]), [['ab', [1]], ['cd', [1, 2]], ['ef', [2]]]);
});

test('no signals gives one plain segment; empty text gives none', () => {
  assert.deepEqual(buildSegments('hello', []), [{ text: 'hello', ids: [] }]);
  assert.deepEqual(buildSegments('', []), []);
});

test('out-of-range spans are clamped, never throw', () => {
  const segs = buildSegments('abc', [{ n: 1, spans: [[-5, 99]] }]);
  assert.equal(segs.map((s) => s.text).join(''), 'abc');
});
