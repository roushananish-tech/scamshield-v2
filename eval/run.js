// Evaluation harness. Positive = flagged (verdict is "suspicious" or "scam").
// Run: npm run eval      (exits non-zero if a regression guard fails)

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { analyzeMessage } from '../src/engine/analyze.js';

const corpusPath = fileURLToPath(new URL('./corpus.json', import.meta.url));

export function loadCorpus() {
  return JSON.parse(readFileSync(corpusPath, 'utf8')).messages;
}

/** @param {{label:string, text:string, id:string}[]} items */
export function evaluate(items) {
  let tp = 0, fp = 0, fn = 0, tn = 0, strictTp = 0;
  const missed = [];
  const falseAlarms = [];
  for (const it of items) {
    const r = analyzeMessage(it.text);
    const flagged = r.verdict !== 'low';
    if (it.label === 'scam') {
      if (flagged) tp++; else { fn++; missed.push({ id: it.id, score: r.score }); }
      if (r.verdict === 'scam') strictTp++;
    } else if (flagged) { fp++; falseAlarms.push({ id: it.id, score: r.score }); } else tn++;
  }
  const scams = tp + fn;
  const legit = fp + tn;
  return {
    n: items.length, tp, fp, fn, tn,
    precision: tp + fp ? tp / (tp + fp) : 1,
    recall: scams ? tp / scams : 1,
    strictRecall: scams ? strictTp / scams : 1,
    falsePositiveRate: legit ? fp / legit : 0,
    missed, falseAlarms,
  };
}

const pct = (x) => `${(100 * x).toFixed(1)}%`;

export function report() {
  const all = loadCorpus();
  const sets = {};
  for (const m of all) (sets[m.set] ??= []).push(m);
  const lines = ['| Set | Msgs | Scam recall | Strict recall (scam verdict) | Precision | False-positive rate | Missed | False alarms |', '|---|---|---|---|---|---|---|---|'];
  const results = {};
  for (const [name, items] of Object.entries(sets)) {
    const r = evaluate(items);
    results[name] = r;
    lines.push(`| ${name} | ${r.n} | ${pct(r.recall)} | ${pct(r.strictRecall)} | ${pct(r.precision)} | ${pct(r.falsePositiveRate)} | ${r.missed.map((m) => m.id).join(', ') || '-'} | ${r.falseAlarms.map((m) => m.id).join(', ') || '-'} |`);
  }
  return { table: lines.join('\n'), results };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { table, results } = report();
  console.log(table);
  console.log('\nSmall synthetic corpus: indicative only, not a production accuracy claim.');
  const dev = results.dev;
  if (dev.recall < 0.9 || dev.falsePositiveRate > 0.1) {
    console.error('Regression guard failed on dev set.');
    process.exit(1);
  }
}
