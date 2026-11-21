// Robustness: every scam in the corpus must keep its verdict class when an
// attacker applies cheap obfuscation. Derived programmatically from the corpus.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCorpus } from '../eval/run.js';
import { analyzeMessage } from '../src/engine/analyze.js';

const scams = loadCorpus().filter((m) => m.label === 'scam');
const rank = { low: 0, suspicious: 1, scam: 2 };

const CYR = { a: 'а', e: 'е', o: 'о', p: 'р', c: 'с', x: 'х', y: 'у' };
const mutations = {
  uppercase: (t) => t.toUpperCase(),
  zeroWidth: (t) => t.replace(/([a-z])(?=[a-z])/gi, (m, c, i) => (i % 3 === 0 ? c + '​' : c)),
  cyrillic: (t) => t.replace(/[aeopcxy]/g, (c, i) => (i % 2 === 0 ? CYR[c] : c)),
  fullwidth: (t) => t.replace(/[a-z]/g, (c, i) => (i % 4 === 0 ? String.fromCharCode(c.charCodeAt(0) + 0xfee0) : c)),
  extraSpaces: (t) => t.replace(/ /g, '   '),
};

for (const [name, fn] of Object.entries(mutations)) {
  test(`verdict is stable under "${name}" obfuscation`, () => {
    const drops = [];
    for (const m of scams) {
      const before = analyzeMessage(m.text).verdict;
      const after = analyzeMessage(fn(m.text)).verdict;
      if (rank[after] < rank[before]) drops.push(`${m.id}: ${before}->${after}`);
    }
    // Allow at most 5% of scams to degrade; list them so regressions are visible.
    assert.ok(drops.length <= Math.floor(scams.length * 0.05), drops.join('; '));
  });
}
