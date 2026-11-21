// Core analysis: normalise -> match rules -> URL forensics -> combine -> explain.
// Pure functions, no DOM, no network, no storage. Messages never leave the caller.

import { normalize, toRawSpan } from './normalize.js';
import { RULES, ADVICE } from './rules.js';
import { extractUrls, analyzeUrl } from './urls.js';
import { buildSegments } from './highlight.js';
import { recoveryFor } from './playbook.js';
import { REPORT_ADVICE, LOW_RISK_ADVICE } from './messages.js';

export const MAX_MESSAGE_CHARS = 5000;
export const THRESHOLDS = { suspicious: 30, scam: 60 };

const NEGATION_BEFORE = /(do\s+not|don['’]?t|dont|never|not\s+to|should\s+not|shouldn['’]?t)\s*$/;

export const DEFAULT_CONTEXT = Object.freeze({ channel: 'sms', sender: 'unsure', acted: 'none' });

export const VERDICT_LABEL = {
  low: 'No strong scam signals found',
  suspicious: 'Suspicious: treat with caution',
  scam: 'Likely a scam',
};

/** @param {number} score 0-100 */
export function verdictFor(score) {
  if (score >= THRESHOLDS.scam) return 'scam';
  if (score >= THRESHOLDS.suspicious) return 'suspicious';
  return 'low';
}

/**
 * Noisy-OR over categories: risk = 1 - prod(1 - w_c), where w_c is the strongest
 * signal in category c. Independent evidence compounds; repeating one kind of
 * evidence (ten urgency words) does not.
 * @param {{category:string, weight:number}[]} signals
 */
export function combine(signals) {
  const best = new Map();
  for (const s of signals) best.set(s.category, Math.max(best.get(s.category) ?? 0, s.weight));
  let keep = 1;
  for (const w of best.values()) keep *= 1 - w;
  return 1 - keep;
}

function clean(ctx) {
  return { ...DEFAULT_CONTEXT, ...(ctx ?? {}) };
}

/**
 * @param {string} input
 * @param {{channel?:string, sender?:'known'|'unknown'|'unsure', acted?:string}} [context]
 */
export function analyzeMessage(input, context) {
  const ctx = clean(context);
  const raw = String(input ?? '').slice(0, MAX_MESSAGE_CHARS);
  const norm = normalize(raw);
  const found = [];

  for (const rule of RULES) {
    const spans = [];
    for (const m of norm.text.matchAll(rule.re)) {
      if (m[0].length === 0) continue;
      if (rule.negation) {
        const before = norm.text.slice(Math.max(0, m.index - 20), m.index);
        if (NEGATION_BEFORE.test(before)) continue;
      }
      const span = toRawSpan(norm, m.index, m.index + m[0].length);
      if (span) spans.push(span);
    }
    if (spans.length) {
      found.push({ id: rule.id, kind: 'text', category: rule.category, weight: rule.weight, label: rule.title, why: rule.why, spans });
    }
  }

  const links = [];
  for (const u of extractUrls(norm.text)) {
    const span = toRawSpan(norm, u.start, u.end);
    const result = analyzeUrl(u.raw);
    links.push({ raw: raw.slice(span[0], span[1]), host: result.host, registrable: result.registrable, official: result.official, flags: result.flags.map((f) => f.id) });
    for (const f of result.flags) {
      found.push({ id: f.id, kind: 'link', category: f.category, weight: f.weight, label: f.label, why: f.why, spans: [span] });
    }
    if (result.flags.length === 0 && !result.official) {
      found.push({ id: 'link_present', kind: 'link', category: 'link_other', weight: 0.08, label: 'Contains a link',
        why: 'Links in unexpected messages are the usual delivery route for phishing.', spans: [span] });
    }
  }

  if (ctx.sender === 'unknown' && raw.trim()) {
    found.push({ id: 'sender_unknown', kind: 'context', category: 'sender', weight: 0.08, label: 'Sender is unknown to you',
      why: 'Messages from numbers you do not know deserve more suspicion.', spans: [] });
  }

  // Merge duplicate ids (several URLs raising the same flag) and number by strength.
  const byId = new Map();
  for (const s of found) {
    const prev = byId.get(s.id);
    if (prev) prev.spans.push(...s.spans);
    else byId.set(s.id, { ...s, spans: [...s.spans] });
  }
  const signals = [...byId.values()]
    .sort((a, b) => b.weight - a.weight || a.id.localeCompare(b.id))
    .map((s, i) => ({ ...s, n: i + 1 }));

  const score = Math.round(100 * combine(signals));
  const verdict = verdictFor(score);
  const segments = buildSegments(raw, signals);
  const advice = buildAdvice(signals, verdict, ctx);
  const recovery = ctx.acted !== 'none' ? recoveryFor(ctx.acted) : null;

  return {
    score,
    verdict,
    label: VERDICT_LABEL[verdict],
    signals,
    links,
    segments,
    advice,
    recovery,
    context: ctx,
    summary: summarise(score, verdict, signals),
    truncated: String(input ?? '').length > MAX_MESSAGE_CHARS,
  };
}

function buildAdvice(signals, verdict, ctx) {
  const out = [];
  const seen = new Set();
  // `signals` arrives sorted strongest first, so no re-sort is needed.
  for (const s of signals) {
    const text = ADVICE[s.category];
    if (text && s.weight >= 0.2 && !seen.has(text)) { seen.add(text); out.push(text); }
    if (out.length >= 4) break;
  }
  const money = signals.some((s) => ['payment', 'credential', 'family'].includes(s.category) && s.weight >= 0.3);
  if (ctx.sender === 'known' && (money || signals.some((s) => s.kind === 'link' && s.weight >= 0.25))) {
    out.push('If this really came from someone you know, their account may be hacked. Call them on their saved number before doing anything.');
  }
  if (verdict !== 'low') {
    out.push(REPORT_ADVICE);
  } else {
    out.push(LOW_RISK_ADVICE);
  }
  return out;
}

function summarise(score, verdict, signals) {
  const top = signals.filter((s) => s.weight >= 0.2).slice(0, 3).map((s) => s.label);
  const why = top.length ? ` Main reasons: ${top.join('; ')}.` : '';
  return `${VERDICT_LABEL[verdict]} (risk ${score} out of 100).${why}`;
}
