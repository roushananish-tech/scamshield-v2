// Allow-list of files the local static server may serve. Pure, so it is unit tested.
import { posix } from 'node:path';

const ROOT_FILES = new Set(['index.html', 'styles.css', 'site.css']);
const IMG_DIR = 'web/public/img/';

/**
 * Map a URL pathname to a repository-relative file, or null if it is not public.
 * @param {string} pathname raw URL pathname (may be percent-encoded)
 * @returns {string | null}
 */
export function resolvePublic(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.includes('\0') || decoded.includes('\\')) return null;
  const rel = posix.normalize(decoded.replace(/^\/+/, '') || 'index.html');
  if (rel.startsWith('..') || posix.isAbsolute(rel)) return null;
  if (ROOT_FILES.has(rel)) return rel;
  if (rel.startsWith('src/') && rel.endsWith('.js') && !rel.slice(4).includes('..')) return rel;
  if (rel.startsWith(IMG_DIR) && rel.endsWith('.webp') && !rel.slice(IMG_DIR.length).includes('/')) return rel;
  return null;
}
