// Conversation mode: real scams unfold over many messages. We tag each message
// with the scam "script" stage it shows and report how far the thread has gone.

import { analyzeMessage, combine, verdictFor, VERDICT_LABEL } from './analyze.js';
import { STAGE_OF } from './rules.js';

export const MAX_MESSAGES = 200;
export const MAX_MESSAGE_LEN = 2000;

export const STAGES = ['hook', 'authority', 'pressure', 'isolation', 'extraction'];

export const STAGE_INFO = {
  hook:       { label: 'Hook', weight: 0.15, meaning: 'A lure: prize, job, parcel, refund or an "urgent" family story.' },
  authority:  { label: 'Fake authority', weight: 0.35, meaning: 'Claims to be a bank, agency, utility or official.' },
  pressure:   { label: 'Pressure', weight: 0.3, meaning: 'Threats and deadlines to stop you thinking.' },
  isolation:  { label: 'Isolation', weight: 0.55, meaning: 'Tells you to keep it secret or stay on the line.' },
  extraction: { label: 'Extraction', weight: 0.6, meaning: 'Asks for money, OTP/PIN, an app install or a call-back.' },
};

const NEXT_STEP = {
  none: 'No scam-script pattern detected in this thread.',
  hook: 'Typical next step: they will claim to be an official or add urgency. Do not engage further.',
  authority: 'Typical next step: threats and deadlines, then secrecy. Verify using an official number you look up yourself.',
  pressure: 'Typical next step: they will tell you to keep it secret, then ask for money, codes or an app install.',
  isolation: 'Typical next step: a demand for money, an OTP or an app install. Stop now and tell someone you trust.',
  extraction: 'They are already asking for money, codes or an app install. Stop replying. Do not pay or share anything.',
};

const WA_LINE = /^\[?(\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?\s*(?:[ap]m)?)\]?\s*(?:-\s*)?([^:]{1,40}):\s?(.*)$/i;

/**
 * Split pasted text into messages. Understands WhatsApp "export chat" lines;
 * otherwise splits on blank lines, then on single lines.
 * @param {string} input
 * @returns {{index:number, speaker:string, text:string}[]}
 */
export function parseThread(input) {
  const text = String(input ?? '').replace(/\r\n?/g, '\n');
  const lines = text.split('\n');
  const waCount = lines.filter((l) => WA_LINE.test(l)).length;
  let msgs = [];

  if (waCount >= 2) {
    for (const line of lines) {
      const m = WA_LINE.exec(line);
      if (m) msgs.push({ speaker: m[3].trim(), text: m[4] });
      else if (msgs.length && line.trim()) msgs[msgs.length - 1].text += '\n' + line;
    }
  } else {
    let blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
    if (blocks.length <= 1) blocks = lines.map((l) => l.trim()).filter(Boolean);
    msgs = blocks.map((b) => {
      const m = /^([^:\n]{1,30}):\s+([\s\S]+)$/.exec(b);
      return m ? { speaker: m[1].trim(), text: m[2] } : { speaker: '', text: b };
    });
  }
  return msgs
    .filter((m) => m.text.trim())
    .slice(0, MAX_MESSAGES)
    .map((m, i) => ({ index: i + 1, speaker: m.speaker, text: m.text.slice(0, MAX_MESSAGE_LEN) }));
}

/**
 * @param {string} input
 * @param {object} [context]
 */
export function analyzeConversation(input, context) {
  const messages = parseThread(input).map((m) => ({ ...m, result: analyzeMessage(m.text, { ...context, acted: 'none' }) }));

  const reached = {};
  for (const stage of STAGES) reached[stage] = null;
  for (const m of messages) {
    for (const s of m.result.signals) {
      const stage = STAGE_OF[s.category];
      if (stage && s.weight >= 0.2 && reached[stage] === null) reached[stage] = m.index;
    }
  }

  const timeline = STAGES.map((stage) => ({ stage, ...STAGE_INFO[stage], reachedAt: reached[stage] }));
  const reachedStages = timeline.filter((t) => t.reachedAt !== null);
  const stageRisk = combine(reachedStages.map((t) => ({ category: t.stage, weight: t.weight })));
  const maxMessage = messages.reduce((mx, m) => Math.max(mx, m.result.score), 0);
  const score = Math.max(maxMessage, Math.round(100 * stageRisk));
  const verdict = verdictFor(score);
  const furthest = reachedStages.length ? reachedStages[reachedStages.length - 1].stage : 'none';
  const inOrder = reachedStages.every((t, i, a) => i === 0 || t.reachedAt >= a[i - 1].reachedAt);

  return {
    score,
    verdict,
    label: VERDICT_LABEL[verdict],
    messages,
    timeline,
    stagesReached: reachedStages.length,
    inOrder,
    nextStep: NEXT_STEP[furthest],
    truncated: false,
  };
}
