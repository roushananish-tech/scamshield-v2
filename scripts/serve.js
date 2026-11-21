// Zero-dependency static server for local use: `npm start` -> http://localhost:8080
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { resolvePublic } from './public-paths.js';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.webp': 'image/webp',
};
const COMPRESSIBLE = new Set(['.html', '.js', '.css']);
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
};

createServer(async (req, res) => {
  try {
    const rel = resolvePublic(new URL(req.url ?? '/', 'http://localhost').pathname);
    const file = rel && join(root, rel);
    if (!file || !file.startsWith(root + sep)) { res.writeHead(404).end('Not found'); return; }

    const ext = extname(file);
    let body = await readFile(file);
    const headers = {
      ...SECURITY_HEADERS,
      'Content-Type': TYPES[ext] ?? 'application/octet-stream',
      'Cache-Control': ext === '.webp' ? 'public, max-age=86400' : 'no-cache',
    };
    if (COMPRESSIBLE.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] ?? '')) {
      body = gzipSync(body);
      headers['Content-Encoding'] = 'gzip';
      headers.Vary = 'Accept-Encoding';
    }
    res.writeHead(200, headers).end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
}).listen(8080, '127.0.0.1', () => console.log('ScamShield at http://localhost:8080'));
