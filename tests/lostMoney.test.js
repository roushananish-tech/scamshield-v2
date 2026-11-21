import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INCIDENTS, INCIDENT_IDS, STEP_LIBRARY, buildPlan, buildSummary, inr, minutesSince, urgencyNote, DISCLAIMER,
} from '../src/engine/lostMoney.js';

test('every incident references only existing steps and starts with an urgent action', () => {
  assert.ok(INCIDENT_IDS.length >= 8);
  for (const id of INCIDENT_IDS) {
    const plan = buildPlan(id);
    assert.ok(plan.steps.length >= 5, id);
    for (const s of plan.steps) assert.ok(STEP_LIBRARY[s.id], `${id}: ${s.id}`);
    assert.equal(plan.steps[0].urgent, true, `${id} first step should be urgent`);
    assert.deepEqual(plan.steps.map((s) => s.n), plan.steps.map((_, i) => i + 1));
  }
  assert.equal(buildPlan('nope'), null);
});

test('money-loss plans route through 1930 and the bank; no plan promises a refund or quotes a percentage', () => {
  for (const id of ['upi_paid', 'card_misused', 'remote_app', 'investment', 'digital_arrest']) {
    const ids = buildPlan(id).steps.map((s) => s.id);
    assert.ok(ids.includes('call_1930'), id);
    assert.ok(ids.some((x) => x === 'call_bank' || x === 'block_card'), id);
  }
  for (const id of INCIDENT_IDS) {
    const p = buildPlan(id);
    const text = [p.reassure, p.disclaimer, ...p.steps.flatMap((s) => [s.title, s.detail])].join(' ');
    assert.equal(/%|percent/i.test(text), false, `${id} must not quote percentages`);
    assert.equal(/\b(will|shall)\s+(get|receive)\s+(your\s+)?(money|funds)\s+back|guaranteed\s+refund|100\s*%/i.test(text), false, id);
  }
  assert.match(DISCLAIMER, /no step can guarantee/i);
});

test('bank step states the RBI 3-working-day rule without promising a refund', () => {
  const d = STEP_LIBRARY.bank_written.detail;
  assert.match(d, /3 working days/);
  assert.match(d, /10 working days/);
  assert.match(d, /do not assume a refund/i);
});

test('digital-arrest plan reassures that no agency arrests over video', () => {
  assert.match(INCIDENTS.digital_arrest.reassure, /No agency arrests/);
});

test('inr groups digits the Indian way', () => {
  assert.equal(inr(999), 'Rs 999');
  assert.equal(inr(25000), 'Rs 25,000');
  assert.equal(inr(1234567), 'Rs 12,34,567');
  assert.equal(inr(1250.5), 'Rs 1,250.50');
});

test('summary is complete when all key facts are given and lists what is missing otherwise', () => {
  const full = buildSummary({ incident: 'upi_paid', amount: '25000', when: '21 Nov 9:40 am', bank: 'Test Bank',
    txnIds: '123456789012\n987654321098', paidTo: 'scam@upi', scammerContact: '+91 90000 00000', how: 'Caller claimed to be police.' });
  assert.deepEqual(full.missing, []);
  assert.match(full.text, /Amount lost: Rs 25,000/);
  assert.match(full.text, /123456789012, 987654321098/);
  assert.match(full.text, /scam@upi/);
  const empty = buildSummary({});
  assert.equal(empty.missing.length, 5);
  assert.match(empty.text, /\[fill in\]/);
});

test('summary strips control characters, caps lengths and limits transaction IDs', () => {
  const s = buildSummary({ amount: 'x'.repeat(500), how: 'a\u0000b​c\n\n\nd'.repeat(300), txnIds: Array.from({ length: 50 }, (_, i) => `T${i}`), paidTo: 'p'.repeat(1000) });
  assert.equal(/[\u0000​]/.test(s.text), false);
  assert.ok(s.text.length < 2000, `length ${s.text.length}`);
  assert.equal((s.text.match(/T\d+/g) ?? []).length, 10);
});

test('summary keeps hostile text as inert text (no markup is interpreted or removed)', () => {
  const s = buildSummary({ how: '<img src=x onerror=alert(1)>' });
  assert.match(s.text, /<img src=x onerror=alert\(1\)>/);
});

test('minutesSince and urgencyNote bands', () => {
  const now = Date.parse('2026-11-21T12:00:00Z');
  assert.equal(minutesSince('2026-11-21T11:30:00Z', now), 30);
  assert.equal(minutesSince('2026-11-21T13:00:00Z', now), null);
  assert.equal(minutesSince('garbage', now), null);
  assert.equal(minutesSince('', now), null);
  assert.equal(urgencyNote(10).phase, 'first_hour');
  assert.equal(urgencyNote(120).phase, 'early');
  assert.equal(urgencyNote(600).phase, 'late');
  assert.equal(urgencyNote(null).phase, 'unknown');
  assert.equal(urgencyNote(NaN).phase, 'unknown');
  assert.match(urgencyNote(600).message, /No outcome is guaranteed/);
});
