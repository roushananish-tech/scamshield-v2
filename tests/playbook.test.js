import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTED, PLAYBOOKS, recoveryFor } from '../src/engine/playbook.js';

test('every action state except "none" has a playbook with steps', () => {
  for (const a of ACTED.filter((x) => x !== 'none')) {
    assert.ok(PLAYBOOKS[a].steps.length >= 3, a);
  }
  assert.equal(recoveryFor('none'), null);
  assert.equal(recoveryFor('bogus'), null);
});

test('loss-related playbooks point to 1930 and cybercrime.gov.in', () => {
  for (const a of ['shared', 'installed', 'paid']) {
    const text = PLAYBOOKS[a].steps.join(' ');
    assert.match(text, /1930/);
    assert.match(text, /cybercrime\.gov\.in/);
  }
});

test('playbooks never promise recovery of money', () => {
  const all = Object.values(PLAYBOOKS).flatMap((p) => p.steps).join(' ').toLowerCase();
  assert.equal(/guarantee|will get (it|your money) back|full refund/.test(all), false);
});
