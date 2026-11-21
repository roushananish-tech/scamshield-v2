import test from 'node:test';
import assert from 'node:assert/strict';
import { parseThread, analyzeConversation, MAX_MESSAGES } from '../src/engine/conversation.js';

const THREAD = `[21/11/2026, 10:02] Unknown: Hello, a parcel in your name contains illegal items.
[21/11/2026, 10:04] Unknown: This is CBI. A case has been registered against you. Act within 2 hours.
[21/11/2026, 10:06] Unknown: Do not tell anyone and do not disconnect the video call.
[21/11/2026, 10:09] Unknown: Transfer Rs 50000 for verification.`;

test('parses WhatsApp export lines and continuation lines', () => {
  const msgs = parseThread(THREAD + '\nsecond line of last message');
  assert.equal(msgs.length, 4);
  assert.equal(msgs[0].speaker, 'Unknown');
  assert.match(msgs[3].text, /second line/);
});

test('falls back to blank-line blocks, then to single lines', () => {
  assert.equal(parseThread('one\n\ntwo\n\nthree').length, 3);
  assert.equal(parseThread('one\ntwo').length, 2);
  assert.equal(parseThread('').length, 0);
});

test('caps the number of messages', () => {
  const big = Array.from({ length: MAX_MESSAGES + 50 }, (_, i) => `m${i}`).join('\n\n');
  assert.equal(parseThread(big).length, MAX_MESSAGES);
});

test('detects the full scam script in order and escalates to scam', () => {
  const r = analyzeConversation(THREAD);
  assert.equal(r.verdict, 'scam');
  assert.ok(r.stagesReached >= 4);
  assert.equal(r.inOrder, true);
  assert.match(r.nextStep, /Stop replying/);
  const stages = Object.fromEntries(r.timeline.map((t) => [t.stage, t.reachedAt]));
  assert.ok(stages.authority < stages.isolation);
  assert.ok(stages.isolation < stages.extraction);
});

test('an ordinary chat shows no scam script', () => {
  const r = analyzeConversation('Anu: Are we meeting at 5?\n\nRavi: Yes, bring the notes.\n\nAnu: Great, see you.');
  assert.equal(r.verdict, 'low');
  assert.equal(r.stagesReached, 0);
});

test('empty input yields an empty, safe result', () => {
  const r = analyzeConversation('');
  assert.equal(r.messages.length, 0);
  assert.equal(r.verdict, 'low');
});
