# ScamShield web app (`web/`)

Source of the live site. It is a server-rendered React 19 + TanStack Start app hosted as a Cloudflare Worker on Higgsfield. The detection engine is **not** copied here: the build pulls `../src/engine/`, `../tests/` and `../eval/` byte for byte (see `sync-into-app.sh`), so the tested engine is the single source of truth.

## What is here
| Path | What it is |
|---|---|
| `src/routes/` | Screens: front door, on a call, call card, lost money, plan with summary builder, check, spot the scam, four rules, send to family, 404 |
| `src/ui/` | Header, footer, buttons, choice cards, owner tags, status box, inline icons |
| `src/lib/security-headers.server.ts` | Per-request nonce Content Security Policy (`connect-src 'none'`, no `unsafe-inline`), plus security headers |
| `src/lib/links.ts` | The only place outbound addresses are built (tel:1930 and the two official portals) |
| `src/styles.css` | All styling. No inline styles anywhere (the CSP forbids them) |
| `design-brief.md` | Design decisions: palette, type, why there are no images or animation |

## Privacy rules the code follows
- Everything a person types stays in React component state in the browser. It is never sent to the server, put in the URL, stored, or included in a share link.
- No `fetch`, `XMLHttpRequest`, `WebSocket`, storage APIs, cookies, analytics or third-party scripts in app code.
- Share links carry fixed rule titles or a quiz score only (`warnShare`, `quizShare` in the engine).

## Rebuild
`sync-into-app.sh <path-to-tanstack-app>` copies the engine, tests and this folder into a TanStack Start scaffold. Then `bun run typecheck` and `node --test tests/engine/*.test.js` from the app folder.
