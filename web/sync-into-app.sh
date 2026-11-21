#!/usr/bin/env bash
# Copy the ScamShield engine, tests and web UI into a TanStack Start app folder.
# Usage: web/sync-into-app.sh <app-dir>   (run from the repository root)
set -euo pipefail
APP="${1:?usage: web/sync-into-app.sh <app-dir>}"
mkdir -p "$APP/src/engine" "$APP/tests/engine" "$APP/eval"
cp src/engine/*.js "$APP/src/engine/"
cp eval/run.js eval/corpus.json "$APP/eval/"
for f in tests/*.test.js; do
  b=$(basename "$f")
  [ "$b" = static.test.js ] && continue   # targets the original static page
  sed -e "s#'\.\./src/engine/#'../../src/engine/#g" -e "s#'\.\./eval/#'../../eval/#g" "$f" > "$APP/tests/engine/$b"
done
cp -R web/src/. "$APP/src/"
cp -R web/public/. "$APP/public/"
cp web/design-brief.md "$APP/design-brief.md"
