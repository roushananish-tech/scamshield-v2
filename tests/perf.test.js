import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeMessage } from '../src/engine/analyze.js';

const cases = {
  repeated: 'a'.repeat(5000),
  longHost: 'http://' + 'a.'.repeat(2000),
  repeatedKeyword: 'otp '.repeat(1500),
  punctuation: '!'.repeat(5000),
  manyLinks: 'bit.ly/x '.repeat(500),
};

for (const [name, input] of Object.entries(cases)) {
  test(`pathological input "${name}" finishes fast (no ReDoS)`, () => {
    const t = performance.now();
    const r = analyzeMessage(input);
    assert.ok(performance.now() - t < 1000);
    assert.ok(r.score >= 0 && r.score <= 100);
  });
}

test('input over the cap is truncated and flagged', () => {
  const r = analyzeMessage('x'.repeat(9000));
  assert.equal(r.truncated, true);
});
