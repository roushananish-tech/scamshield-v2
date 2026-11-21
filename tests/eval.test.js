import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCorpus, evaluate } from '../eval/run.js';

const all = loadCorpus();
const bySet = (s) => all.filter((m) => m.set === s);

test('corpus is balanced enough and ids are unique', () => {
  assert.equal(new Set(all.map((m) => m.id)).size, all.length);
  assert.ok(all.filter((m) => m.label === 'scam').length >= 25);
  assert.ok(all.filter((m) => m.label === 'legit').length >= 20);
});

test('dev set regression guard', () => {
  const r = evaluate(bySet('dev'));
  assert.ok(r.recall >= 0.9, `recall ${r.recall}`);
  assert.ok(r.falsePositiveRate <= 0.1, `fpr ${r.falsePositiveRate}`);
});

test('holdout sets stay at honest, acceptable levels', () => {
  for (const s of ['holdout', 'holdout2', 'holdout3', 'holdout4', 'holdout5']) {
    const r = evaluate(bySet(s));
    assert.ok(r.recall >= 0.75, `${s} recall ${r.recall}`);
    assert.ok(r.falsePositiveRate <= 0.15, `${s} fpr ${r.falsePositiveRate}`);
  }
});
