// UI wiring. All user text is rendered with textContent / createTextNode:
// this file builds the DOM from text nodes only; no HTML strings, no dynamic code.

import { analyzeMessage } from './engine/analyze.js';
import { analyzeConversation } from './engine/conversation.js';
import { THREAD_LOW_ADVICE, THREAD_SCAM_ADVICE, SHARE_SUFFIX } from './engine/messages.js';

const ICON = { low: '✔', suspicious: '⚠', scam: '✖' };
function STRENGTH(weight) {
  if (weight >= 0.5) return 'High';
  if (weight >= 0.3) return 'Medium';
  return 'Low';
}

const EXAMPLES = [
  { name: 'Bank KYC link', mode: 'single', text: 'Dear customer, your SBI account will be blocked today. Update KYC now: http://sbi-kyc-update.com/login' },
  { name: 'Parcel fee', mode: 'single', text: 'Your parcel is held at customs. Pay Rs 49 redelivery fee at http://indiapost-track.top/pay' },
  { name: 'Hinglish OTP', mode: 'single', text: 'Aapka account block ho jayega. Turant OTP batao.' },
  { name: 'Genuine OTP', mode: 'single', text: 'Your OTP for HDFC Bank NetBanking is 482913. Do not share it with anyone. Valid for 10 minutes.' },
  {
    name: 'Digital-arrest chat', mode: 'thread',
    text: '[21/11/2026, 10:02] Unknown: Hello, I am calling from the courier company. A parcel in your name contains illegal items.\n[21/11/2026, 10:04] Unknown: This is CBI. A case has been registered against you and an arrest warrant is ready. You must act within 2 hours.\n[21/11/2026, 10:06] Unknown: Do not tell anyone and do not disconnect the video call.\n[21/11/2026, 10:09] Unknown: Transfer Rs 50000 for verification. You will be refunded after the case is cleared.',
  },
];

const $ = (id) => document.getElementById(id);

/** Tiny safe element builder: strings become text nodes, never HTML. */
function el(tag, attrs = {}, ...kids) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v == null) continue;
    if (k === 'class') node.className = v;
    else node.setAttribute(k, v === true ? '' : String(v));
  }
  for (const kid of kids.flat()) node.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  return node;
}

function announce(msg) { $('status').textContent = ''; setTimeout(() => { $('status').textContent = msg; }, 30); }

function verdictBox(r, heading) {
  return el('div', { class: 'verdict', 'data-level': r.verdict },
    el('p', { class: 'label' }, el('span', { 'aria-hidden': 'true' }, `${ICON[r.verdict]} `), r.label),
    el('p', { class: 'score' }, `${heading} ${r.score} out of 100`),
    el('progress', { value: r.score, max: 100, 'aria-label': `${heading} ${r.score} out of 100` }),
  );
}

function renderMarked(segments) {
  const box = el('p', { class: 'message-view', lang: 'und' });
  for (const seg of segments) {
    if (seg.ids.length === 0) box.append(document.createTextNode(seg.text));
    else {
      box.append(el('mark', {}, seg.text,
        el('sup', { 'aria-hidden': 'true' }, `[${seg.ids.join(',')}]`),
        el('span', { class: 'sr-only' }, ` (reason ${seg.ids.join(' and ')})`)));
    }
  }
  return box;
}

function renderReasons(signals) {
  const real = signals.filter((s) => s.weight >= 0.1 || s.kind === 'link');
  if (!real.length) return el('p', {}, 'No scam signals matched.');
  return el('ol', { class: 'reasons' },
    real.map((s) => el('li', { id: `reason-${s.n}`, value: s.n },
      el('strong', {}, s.label), ' ', el('span', { class: 'badge' }, `${STRENGTH(s.weight)} signal`),
      el('p', { class: 'reason-why' }, s.why))));
}

function renderList(items, cls) { return el('ul', { class: cls }, items.map((t) => el('li', {}, t))); }

function renderRecovery(rec) {
  if (!rec) return null;
  return el('section', { class: 'card', 'aria-labelledby': 'recovery-h' },
    el('h2', { id: 'recovery-h' }, `If you already acted: ${rec.title}`),
    el('ol', {}, rec.steps.map((s) => el('li', {}, s))));
}

function renderLinks(links) {
  if (!links.length) return null;
  return el('section', { 'aria-labelledby': 'links-h' },
    el('h2', { id: 'links-h' }, 'Links found (not opened)'),
    el('ul', { class: 'links' }, links.map((l) => el('li', {},
      el('code', {}, l.raw), ' → site: ', el('strong', {}, l.registrable),
      l.official ? ' (matches a known official domain)' : l.flags.length ? ` (${l.flags.length} warning${l.flags.length > 1 ? 's' : ''})` : ' (no specific warnings, still verify)'))));
}

function toolbar(summary) {
  const row = el('div', { class: 'actions' });
  const copy = el('button', { type: 'button' }, 'Copy a warning to share');
  copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(`ScamShield check: ${summary} ${SHARE_SUFFIX}`); announce('Warning copied.'); }
    catch { announce('Could not copy. Select the text and copy it manually.'); }
  });
  row.append(copy);
  if ('speechSynthesis' in window) {
    const speak = el('button', { type: 'button' }, 'Read result aloud');
    speak.addEventListener('click', () => {
      if (speechSynthesis.speaking) { speechSynthesis.cancel(); return; }
      const u = new SpeechSynthesisUtterance(summary);
      u.lang = 'en-IN';
      speechSynthesis.speak(u);
    });
    row.append(speak);
  }
  return row;
}

function renderSingle(r) {
  return [
    el('h2', {}, 'Result'),
    verdictBox(r, 'Risk score'),
    r.truncated ? el('p', { class: 'meta' }, 'Only the first 5,000 characters were checked.') : null,
    el('h3', {}, 'Your message, with reasons marked'),
    renderMarked(r.segments),
    el('h2', {}, 'Why it was flagged'),
    renderReasons(r.signals),
    el('h2', {}, 'What to do now'),
    renderList(r.advice, 'advice'),
    renderRecovery(r.recovery),
    renderLinks(r.links),
    toolbar(r.summary),
  ];
}

function renderThread(r) {
  if (!r.messages.length) return [el('h2', {}, 'Result'), el('p', {}, 'No messages found. Paste the conversation text.')];
  return [
    el('h2', {}, 'Result'),
    verdictBox(r, 'Conversation risk'),
    el('h2', {}, 'How far the scam script has gone'),
    el('p', { class: 'meta' }, `${r.stagesReached} of 5 stages seen${r.stagesReached >= 2 ? (r.inOrder ? ', in the typical order.' : ', not in the typical order.') : '.'}`),
    el('ol', { class: 'timeline' }, r.timeline.map((t) => el('li', {},
      el('strong', {}, t.label), ': ',
      t.reachedAt !== null ? `seen at message ${t.reachedAt}` : 'not seen', '. ',
      el('span', { class: 'meta' }, t.meaning)))),
    el('p', {}, el('strong', {}, r.nextStep)),
    el('h2', {}, `Messages (${r.messages.length})`),
    el('ol', { class: 'messages' }, r.messages.map((m) => el('li', {},
      el('strong', {}, m.speaker || `Message ${m.index}`), ' ',
      el('span', { class: 'badge' }, `${m.result.score}/100`),
      el('p', { class: 'meta' }, m.text.length > 160 ? `${m.text.slice(0, 160)}...` : m.text),
      m.result.signals.filter((s) => s.weight >= 0.2).length
        ? el('p', { class: 'reason-why' }, 'Signals: ', m.result.signals.filter((s) => s.weight >= 0.2).map((s) => s.label).join('; '))
        : null))),
    el('h2', {}, 'What to do now'),
    renderList(r.verdict === 'low' ? [THREAD_LOW_ADVICE] : [...THREAD_SCAM_ADVICE], 'advice'),
    toolbar(`${r.label} (conversation risk ${r.score} out of 100). ${r.nextStep}`),
  ];
}

function run(event) {
  event.preventDefault();
  const text = $('input').value;
  const results = $('results');
  results.replaceChildren();
  if (!text.trim()) {
    results.append(el('p', { role: 'alert' }, 'Paste a message first.'));
    results.hidden = false;
    $('input').focus();
    return;
  }
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const ctx = { sender: $('sender').value, acted: $('acted').value };
  const nodes = mode === 'thread' ? renderThread(analyzeConversation(text, ctx)) : renderSingle(analyzeMessage(text, ctx));
  results.append(...nodes.filter(Boolean));
  results.hidden = false;
  results.focus();
  announce('Result ready.');
}

function init() {
  $('check-form').addEventListener('submit', run);
  $('input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      $('check-form').requestSubmit();
    }
  });
  $('clear').addEventListener('click', () => {
    $('input').value = '';
    $('results').replaceChildren();
    $('results').hidden = true;
    $('input').focus();
  });
  const list = $('example-list');
  for (const ex of EXAMPLES) {
    const b = el('button', { type: 'button' }, ex.name);
    b.addEventListener('click', () => {
      $('input').value = ex.text;
      document.querySelector(`input[name="mode"][value="${ex.mode}"]`).checked = true;
      $('check-form').requestSubmit();
    });
    list.append(el('li', {}, b));
  }
}

init();
