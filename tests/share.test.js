import test from 'node:test';
import assert from 'node:assert/strict';
import { waLink, parentMessage, warnShare, quizShare, safeBaseUrl } from '../src/engine/share.js';
import { analyzeMessage } from '../src/engine/analyze.js';

test('safeBaseUrl accepts plain http(s) only', () => {
  assert.equal(safeBaseUrl('https://example.org/app'), 'https://example.org/app');
  assert.equal(safeBaseUrl('javascript:alert(1)'), '');
  assert.equal(safeBaseUrl('https://a.b/ x'), '');
  assert.equal(safeBaseUrl(undefined), '');
});

test('waLink encodes text and caps length', () => {
  const l = waLink('hello & world\nnext');
  assert.ok(l.startsWith('https://wa.me/?text='));
  assert.equal(decodeURIComponent(l.split('text=')[1]), 'hello & world\nnext');
  assert.ok(decodeURIComponent(waLink('x'.repeat(5000)).split('text=')[1]).length <= 900);
});

test('warning share never includes the message text, only rule titles', () => {
  const secret = 'Dear customer share your OTP 884422 now or your account will be blocked, call 9876543210 http://bank-kyc.top/x';
  const r = analyzeMessage(secret);
  const out = warnShare(r, 'https://example.org');
  assert.equal(out.includes('884422'), false);
  assert.equal(out.includes('9876543210'), false);
  assert.equal(out.includes('bank-kyc.top'), false);
  assert.match(out, /looks like a scam/);
  assert.ok(out.endsWith('https://example.org'));
});

test('share texts work without a URL and clamp quiz scores', () => {
  assert.equal(quizShare(4, 6), 'I scored 4/6 on the ScamShield "spot the scam" test. Can you beat me?');
  assert.match(quizShare(9, 6), /6\/6/);
  assert.match(quizShare(-3, 6), /0\/6/);
  assert.equal(parentMessage().includes('http'), false);
  assert.match(parentMessage('https://example.org'), /https:\/\/example\.org$/);
  assert.match(parentMessage(), /4\. If someone you know asks for money/);
});
