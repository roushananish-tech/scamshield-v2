// Builds text and wa.me links for sharing. Pure functions; the UI decides what to
// do with the link. Shared text never contains the checked message itself: only
// fixed rule titles or a score, so a victim's private chat is never forwarded.

import { FOUR_RULES } from './panic.js';

const MAX_TEXT = 900;

/** Accept only plain http(s) URLs for the "check yours" link; otherwise omit it. */
export function safeBaseUrl(url) {
  const u = String(url ?? '').trim();
  return /^https?:\/\/[^\s<>"']{1,200}$/.test(u) ? u : '';
}

/** @param {string} text */
export function waLink(text) {
  return `https://wa.me/?text=${encodeURIComponent(String(text ?? '').slice(0, MAX_TEXT))}`;
}

const withUrl = (text, url) => (url ? `${text}\n${url}` : text);

/**
 * Message to send to a parent or elder.
 * @param {string} [baseUrl]
 */
export function parentMessage(baseUrl) {
  const url = safeBaseUrl(baseUrl);
  const rules = FOUR_RULES.map((r, i) => `${i + 1}. ${r}`).join('\n');
  return withUrl(`Before you click, pay or share any OTP, please check the message here first. Four rules to remember:\n${rules}`, url);
}

/**
 * Warning about a checked message. Uses the rule titles only, never the message text.
 * @param {{verdict:string, signals?:{label:string, weight:number}[]}} result
 * @param {string} [baseUrl]
 */
export function warnShare(result, baseUrl) {
  const url = safeBaseUrl(baseUrl);
  const reasons = (result?.signals ?? []).filter((s) => s.weight >= 0.2).slice(0, 3).map((s) => s.label);
  const head = result?.verdict === 'scam' ? 'A message I received looks like a scam.' : 'A message I received looks suspicious.';
  const why = reasons.length ? ` Signs: ${reasons.join('; ')}.` : '';
  return withUrl(`${head}${why} Do not click, pay or share any code. You can check yours privately here:`, url);
}

/**
 * @param {number} score
 * @param {number} total
 * @param {string} [baseUrl]
 */
export function quizShare(score, total, baseUrl) {
  const url = safeBaseUrl(baseUrl);
  const s = Math.max(0, Math.min(Number(score) || 0, Number(total) || 0));
  const t = Math.max(0, Number(total) || 0);
  return withUrl(`I scored ${s}/${t} on the ScamShield "spot the scam" test. Can you beat me?`, url);
}
