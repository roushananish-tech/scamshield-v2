// Length-aware text normalisation. Every normalised character remembers the
// raw span it came from, so matches found on normalised text can be mapped
// back onto the original message for highlighting.

const ZERO_WIDTH = /[​-‏‪-‮⁠﻿­]/;

// Common Cyrillic / Greek look-alikes used to dodge keyword filters.
const CONFUSABLES = {
  'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'х': 'x', 'у': 'y',
  'і': 'i', 'ј': 'j', 'ѕ': 's', 'к': 'k', 'м': 'm', 'н': 'h', 'т': 't', 'в': 'b',
  'ο': 'o', 'α': 'a', 'ε': 'e', 'ρ': 'p', 'ν': 'v', 'τ': 't', 'ι': 'i',
};

// Leet digits/symbols, replaced only when sandwiched between two letters
// ("h3llo"), so amounts such as "Rs1000" or "1930" are left alone.
const LEET = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '$': 's' };

const isLetter = (c) => c !== undefined && /[a-z]/.test(c);

/**
 * @param {string} raw
 * @returns {{text: string, starts: number[], ends: number[]}}
 */
export function normalize(raw) {
  const chars = [];
  const starts = [];
  const ends = [];
  let idx = 0;
  for (const cp of String(raw)) {
    const rawStart = idx;
    const rawEnd = idx + cp.length;
    idx = rawEnd;
    if (ZERO_WIDTH.test(cp)) continue;
    const lowered = cp.normalize('NFKC').toLowerCase();
    for (const ch of lowered) {
      let out = CONFUSABLES[ch] ?? ch;
      if (/[ \t\u00a0\u2000-\u200a\u202f\u3000]/.test(out)) {
        out = ' ';
        // Collapse runs of blanks into one space; the kept space spans the run.
        if (chars.length && chars[chars.length - 1] === ' ') {
          ends[ends.length - 1] = rawEnd;
          continue;
        }
      }
      // One entry per UTF-16 unit so regex indices on `text` line up.
      for (let k = 0; k < out.length; k++) {
        chars.push(out[k]);
        starts.push(rawStart);
        ends.push(rawEnd);
      }
    }
  }
  for (let i = 1; i < chars.length - 1; i++) {
    const rep = LEET[chars[i]];
    if (rep && isLetter(chars[i - 1]) && isLetter(chars[i + 1])) chars[i] = rep;
  }
  return { text: chars.join(''), starts, ends };
}

/** Map a [start, end) range on normalised text back to the raw string. */
export function toRawSpan(norm, start, end) {
  if (end <= start || start < 0 || end > norm.starts.length) return null;
  return [norm.starts[start], norm.ends[end - 1]];
}
