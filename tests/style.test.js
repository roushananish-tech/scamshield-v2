// Zero-dependency style gate for shipped source (src/ and scripts/).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p); else if (p.endsWith('.js')) files.push(p);
  }
})(join(root, 'src'));
for (const f of readdirSync(join(root, 'scripts'))) if (f.endsWith('.js')) files.push(join(root, 'scripts', f));

const code = (src) => src.replace(/\/\/.*$/gm, '').replace(/'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/g, "''");

for (const f of files) {
  const rel = f.slice(root.length);
  const src = readFileSync(f, 'utf8');
  test(`${rel}: no var, no loose equality, no debug logging, ends with newline`, () => {
    const c = code(src);
    assert.doesNotMatch(c, /\bvar\s/);
    assert.doesNotMatch(c.replace(/[=!]==/g, '').replace(/[=!]= null\b/g, ''), /[^=!<>]==[^=]|!=[^=]/); // `== null` is the one allowed idiom
    if (!rel.startsWith('scripts/')) assert.doesNotMatch(c, /console\.log/);
    assert.ok(src.endsWith('\n'));
  });
}

test('advice strings live in one module, not duplicated in the UI', () => {
  const app = readFileSync(join(root, 'src/app.js'), 'utf8');
  assert.doesNotMatch(app, /sancharsaathi\.gov\.in/);
});
