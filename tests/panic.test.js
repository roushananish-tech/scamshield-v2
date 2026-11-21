import test from 'node:test';
import assert from 'node:assert/strict';
import { PANIC, PANIC_KINDS, panicFor, FOUR_RULES, FAMILY_CODEWORD } from '../src/engine/panic.js';

test('every panic card is short, imperative and complete', () => {
  assert.deepEqual(PANIC_KINDS.sort(), ['bank_caller', 'digital_arrest', 'remote_help', 'voice_clone']);
  for (const k of PANIC_KINDS) {
    const p = panicFor(k);
    assert.ok(p.headline.length < 80, k);
    assert.equal(p.doNow.length, 4, k);
    assert.ok(p.doNow[0].length < 120, `${k}: first action must be quick to read`);
    assert.ok(p.theyWillSay.length >= 3 && p.afterwards.length >= 1, k);
  }
  assert.equal(panicFor('nope'), null);
});

test('digital-arrest card states that no agency arrests over video and never says to pay', () => {
  const t = PANIC.digital_arrest.doNow.join(' ');
  assert.match(t, /over a video call/);
  assert.match(t, /Do not transfer money/);
});

test('every card tells the person to end the contact first', () => {
  for (const k of ['digital_arrest', 'voice_clone', 'bank_caller']) assert.match(PANIC[k].doNow[0], /Hang up|End the call/i, k);
  assert.match(PANIC.remote_help.doNow[0], /End the call/);
});

test('four rules and code word guidance exist', () => {
  assert.equal(FOUR_RULES.length, 4);
  assert.ok(FAMILY_CODEWORD.steps.length >= 3);
});
