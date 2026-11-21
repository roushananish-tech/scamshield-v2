import test from 'node:test';
import assert from 'node:assert/strict';
import { extractUrls, analyzeUrl, registrable } from '../src/engine/urls.js';

const ids = (u) => analyzeUrl(u).flags.map((f) => f.id);

test('registrable handles Indian two-level suffixes', () => {
  assert.equal(registrable('www.sbi.co.in'), 'sbi.co.in');
  assert.equal(registrable('a.b.example.com'), 'example.com');
});

test('extracts links with and without scheme, ignores name-like dots', () => {
  const found = extractUrls('visit http://x-y.top/a and amazon.in/orders. Mr.Sharma 5.30 p.m.').map((u) => u.raw);
  assert.deepEqual(found, ['http://x-y.top/a', 'amazon.in/orders']);
});

test('official domains are recognised and not flagged', () => {
  const r = analyzeUrl('https://www.sbi.co.in/login');
  assert.equal(r.official, true);
  assert.equal(r.flags.length, 0);
});

test('brand look-alike domains are flagged', () => {
  assert.ok(ids('http://sbi-kyc-update.com/login').includes('link_brand_mismatch'));
  assert.ok(ids('https://hdfc-secure-login.xyz').includes('link_brand_mismatch'));
  assert.ok(ids('https://indiapost-track.top/pay').includes('link_tld'));
});

test('unrelated domains are not treated as brand impersonation', () => {
  assert.equal(ids('https://example.com/page').includes('link_brand_mismatch'), false);
});

test('shorteners, IP hosts, punycode, userinfo and APK links', () => {
  assert.ok(ids('http://bit.ly/abc').includes('link_shortener'));
  assert.ok(ids('http://192.168.4.5/login').includes('link_ip'));
  assert.ok(ids('https://xn--sbi-9ra.com').includes('link_punycode'));
  assert.ok(ids('https://sbi.co.in@evil.com/x').includes('link_userinfo'));
  assert.ok(ids('https://files.example.com/app.apk').includes('link_apk'));
});

test('government look-alikes are flagged, real .gov.in is not', () => {
  assert.ok(ids('https://gov-refund.com').includes('link_fake_gov'));
  assert.equal(ids('https://tax.gov.in').includes('link_fake_gov'), false);
});

test('never performs network access', async () => {
  const src = await import('node:fs').then((fs) => fs.readFileSync(new URL('../src/engine/urls.js', import.meta.url), 'utf8'));
  assert.equal(/\bfetch\(|XMLHttpRequest|node:http|node:net/.test(src), false);
});
