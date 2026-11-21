// Turns raw text + signal spans into render-ready segments. Pure data: the UI
// builds DOM nodes from these with textContent, never innerHTML.

/**
 * @param {string} raw
 * @param {{n:number, spans:[number,number][]}[]} signals
 * @returns {{text:string, ids:number[]}[]} segments whose text joins back to `raw`
 */
export function buildSegments(raw, signals) {
  const marks = [];
  for (const s of signals) {
    for (const [a, b] of s.spans) {
      const start = Math.max(0, Math.min(a, raw.length));
      const end = Math.max(start, Math.min(b, raw.length));
      if (end > start) marks.push({ start, end, n: s.n });
    }
  }
  // Sweep line: walk the sorted boundaries once, keeping a count of open marks
  // per reason number. O((n + m) log m) instead of re-filtering every mark per cut.
  const events = new Map();
  const bump = (pos, n, delta) => {
    if (!events.has(pos)) events.set(pos, []);
    events.get(pos).push([n, delta]);
  };
  for (const m of marks) { bump(m.start, m.n, 1); bump(m.end, m.n, -1); }
  const points = [...new Set([0, raw.length, ...events.keys()])].sort((x, y) => x - y);

  const open = new Map();
  const out = [];
  for (let i = 0; i < points.length - 1; i++) {
    for (const [n, delta] of events.get(points[i]) ?? []) {
      const count = (open.get(n) ?? 0) + delta;
      if (count > 0) open.set(n, count); else open.delete(n);
    }
    const a = points[i];
    const b = points[i + 1];
    const ids = [...open.keys()].sort((x, y) => x - y);
    const last = out[out.length - 1];
    if (last && last.ids.join() === ids.join()) last.text += raw.slice(a, b);
    else out.push({ text: raw.slice(a, b), ids });
  }
  return out;
}
