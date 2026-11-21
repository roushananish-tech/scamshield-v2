import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolvePublic } from '../scripts/public-paths.js';

test('serves the page, both stylesheets and engine modules', () => {
  assert.equal(resolvePublic('/'), 'index.html');
  assert.equal(resolvePublic('/site.css'), 'site.css');
  assert.equal(resolvePublic('/styles.css'), 'styles.css');
  assert.equal(resolvePublic('/src/engine/analyze.js'), 'src/engine/analyze.js');
});

test('serves only webp images from the image folder', () => {
  assert.equal(resolvePublic('/web/public/img/hero-960.webp'), 'web/public/img/hero-960.webp');
  assert.equal(resolvePublic('/web/public/img/x.svg'), null);
  assert.equal(resolvePublic('/web/src/styles.css'), null);
});

test('blocks traversal, backslashes, null bytes and private files', () => {
  for (const p of ['/../package.json', '/src/../package.json', '/%2e%2e/package.json', '/src\\x.js', '/a%00.js', '/package.json', '/tests/perf.test.js', '/.git/config', '/%E0%A4%A']) {
    assert.equal(resolvePublic(p), null, p);
  }
});

test('every image the page references is servable and exists', async () => {
  const { readFileSync } = await import('node:fs');
  const text = readFileSync(new URL('../index.html', import.meta.url), 'utf8') + readFileSync(new URL('../site.css', import.meta.url), 'utf8');
  const refs = [...new Set(text.match(/web\/public\/img\/[\w-]+\.webp/g) ?? [])];
  assert.ok(refs.length > 0);
  for (const ref of refs) {
    assert.equal(resolvePublic('/' + ref), ref);
    assert.ok(existsSync(new URL('../' + ref, import.meta.url)), `${ref} missing`);
  }
});
