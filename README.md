# ScamShield — Suspicious Message Detector

**PromptWars x Code1 Innovators · Vertical: Cybersecurity · PS01 ScamShield**

Paste an SMS, WhatsApp message or link. ScamShield tells you whether it looks like a scam, **shows exactly which phrases triggered it and why**, and, if you already clicked or paid, tells you what to do next. Everything runs in your browser. Nothing is uploaded.

## Live site
**https://roushananish-tech.github.io/** (GitHub Pages): the full React site with the on-device "Ask ScamShield" assistant, a static export of the `web/` UI. Its export lives in the repo `roushananish-tech/roushananish-tech.github.io`.

Lightweight single-page version of the same engine: https://roushananish-tech.github.io/scamshield/ (served from this repository's root app).

Two builds share one rule engine (`src/engine/*.js`, unchanged between them):
- **Root app** (`index.html`, `src/app.js`): the original zero-dependency, single-page checker. Run it with `npm start`.
- **Higgsfield preview** (`web/`, UI source only; the static export is the public link above): TanStack Start (React 19) site with a home page, live demo, "I am on a call", lost-money steps, message and chat checker, spot-the-scam quiz and four family rules. Same engine, same privacy rule: nothing typed is sent anywhere.

Reproducibility, stated plainly: the root app is the standalone, fully runnable and tested deliverable (`npm start`, `npm test`, `npm run eval`). The hosted site was generated on the Higgsfield platform, so `web/` holds only our UI source (routes, components, styles, images) and `web/sync-into-app.sh`, which copies the engine, tests and UI into a TanStack Start scaffold. The scaffold itself (build config and platform packages) is not in this repository, so `web/` does not build on its own. The public site is a static export of that build, committed to the separate repository named above; the assistant answers on-device with fixed rules and makes no network calls.

Higgsfield preview security headers: `default-src 'none'`, per-request nonce for scripts and styles, `connect-src 'none'`, `form-action 'none'`, `base-uri 'none'`, no `unsafe-inline`. The `style-src` also holds one fixed hash for a style block the Higgsfield editor injects while the owner edits the site; it is not used by visitors.

## Why this is different
| Feature | What it does |
|---|---|
| Privacy by design | No server calls, no storage, no analytics. CSP sets `connect-src 'none'`, so the page *cannot* send your message anywhere. |
| Explainable | Every verdict lists weighted reasons, with the matching words highlighted in your own message. |
| Conversation mode | Paste a WhatsApp chat export. Detects scam-script stages (hook → authority → pressure → isolation → extraction) and predicts the next step. Catches "digital arrest" scams that no single message reveals. |
| India-specific | 2026 patterns from SEBI and I4C advisories (replacement stock-tip groups, fake trading apps, malicious `.exe` "statement" files, loan-app blackmail, "vote for my friend" WhatsApp takeover, prepaid-task scams, overpayment tricks), plus KYC/bank, UPI collect, parcel/customs fee, electricity cut-off, traffic challan, part-time task/APK, fake investment, digital arrest. Includes Hinglish and Devanagari patterns. |
| URL forensics, no fetching | Brand look-alikes, shorteners, punycode, `@` tricks, risky TLDs, `.apk`, fake `.gov`. Analysed from text only, so no SSRF and no tracking pixel. |
| "I already clicked / paid" | Recovery playbooks for clicked, replied, shared OTP, installed an app, or paid. Points to 1930, cybercrime.gov.in and Chakshu (sancharsaathi.gov.in). Never promises money back. |
| Honest metrics | Eval harness with a dev set and five holdout sets, disclosed failures and an obfuscation test suite (below). |

## How it works
1. **Normalise** (`src/engine/normalize.js`): NFKC, lower-case, strip zero-width characters, fold Cyrillic/Greek look-alikes, undo leet (`h3llo`) only inside words. Each character keeps a map back to the raw text for highlighting.
2. **Rules** (`rules.js`): declarative catalogue, hand-set weight 0–1 per rule, grouped into categories (urgency, threat, credential ask, payment, APK, prize, job task…). Credential rules respect negation ("do **not** share your OTP" is not flagged).
3. **Links** (`urls.js`): each URL gets forensic flags that feed in as signals.
4. **Combine** (`analyze.js`): best weight per category, then noisy-OR: `risk = 1 − ∏(1 − w)`. Score 0–100. **<30 low · 30–59 suspicious · ≥60 scam.** Context (unknown sender, channel) nudges the score. A known sender with a scammy message triggers a "hacked account?" hint.
5. **Conversation** (`conversation.js`): parses WhatsApp exports, scores each message, marks which scam stages were reached and in what order.
6. **Explain** (`highlight.js`, `app.js`): numbered `<mark>` highlights plus a reasons list.

It is a deterministic rule engine, not an ML model, by choice: it is fast, auditable, testable and works offline. The weights are expert-set, not learned.

## Run
```bash
npm start        # http://127.0.0.1:8080  (zero dependencies, Node >= 20)
npm test         # 100 tests
npm run eval     # accuracy table on the labelled corpus
```

## Engine modules for recovery and awareness
Pure, tested modules (no DOM, no network, no storage). `docs/UI_HANDOFF.md` has the API; `docs/CONTENT.md` lists every user-facing string.

| Module | What it provides |
|---|---|
| `lostMoney.js` | Ordered action plans for 8 incident types (UPI, card, shared code, remote-access app, investment, digital arrest, loan blackmail, WhatsApp takeover); a copy-ready summary for the 1930 operator or bank; urgency bands. States the RBI 3-working-day reporting rule and never promises a refund or quotes a recovery percentage. |
| `panic.js` | One-screen "I am on a call right now" cards for digital arrest, voice cloning, fake bank callers and remote-access requests, plus four family rules and a code-word guide. |
| `quiz.js` | "Spot the scam" rounds graded by the real engine, with hand-written synthetic cards. |
| `share.js` | WhatsApp share links. Shared text contains rule titles or a score, never the checked message. |

## Evaluation (read this honestly)
Corpus: `eval/corpus.json`, **hand-written synthetic** messages (not real scam data), 106 total across six sets. Positive = verdict is not "low". Strict recall counts only the "scam" verdict.

| Set | Msgs | Scam recall | Strict recall | Precision | False-positive rate |
|---|---|---|---|---|---|
| dev (used to tune) | 40 | 100% | 95.8% | 100% | 0% |
| holdout (partly tuned, see below) | 18 | 100% | 90% | 100% | 0% |
| holdout2 (not tuned) | 8 | 100% | 100% | 100% | 0% |
| **holdout3 (written last, never tuned)** | 12 | 100% | **66.7%** | 100% | 0% |
| holdout4 (2026 patterns; rules written after seeing it, so tuned) | 16 | 100% | 75% | 100% | 0% |
| holdout5 (2026 patterns, new wording; **first run 50% recall / 16.7% strict**, then fixed, so now tuned) | 12 | 100% | 50% | 100% | 0% |

Methodology and disclosures:
- `holdout` was written before the first run. On its **first run** it scored 90% recall / 80% strict recall / 90% precision / **12.5% false-positive rate**. A genuine bank OTP message was wrongly flagged by an over-broad urgency pattern, and one scam (`H-S06`, remote-access refund scam) was missed. I fixed both, so this set is **no longer clean** and its numbers are optimistic.
- `holdout2` and `holdout3` were written after those fixes and not tuned against. `holdout3` is the most honest number: all 6 scams were flagged, but 2 only reached "suspicious" (scores 48 and 50: a fake "earn by liking videos" offer and a "new number, send money" family scam), not "scam". Left as is on purpose.
- `holdout4` tests the 2026 scam types. **Before** the new rules were added it caught only 50% of scams (strict 12.5%): the older engine did not know replacement stock-tip groups, `.exe` files, loan-app blackmail, "vote for my friend" or prepaid-task scams. I then wrote the rules *after* seeing those messages, so the 100% recall is not a fair test.
- `holdout5` was written afterwards with deliberately different wording. **First run: 50% recall, 16.7% strict recall, 0% false alarms.** The new rules were too tied to my own phrasing (for example, they required the word "group", not "community"). I widened four patterns narrowly and re-ran, so its final numbers are also optimistic. **The first-run figure is the honest estimate of how well the new rules generalise.**
- 12 to 18 messages per set is too few for a confidence interval. Treat all numbers as *indicative*, not a production accuracy claim.

## Robustness testing
`tests/mutation.test.js` applies cheap obfuscation to every scam in the corpus (upper-case, zero-width characters, Cyrillic look-alikes, full-width letters, extra spaces) and requires verdicts not to drop. This found a real bug (runs of spaces broke matching), now fixed by collapsing whitespace in the normaliser.

## Security
The points below describe the root app. The hosted site's headers are listed under Live site.
- Strict CSP (`default-src 'none'; script-src 'self'; connect-src 'none'; form-action 'none'`), no inline script/style, no external resources. Verified by `tests/static.test.js`.
- No `innerHTML`/`eval`; all rendering via text nodes, so pasted HTML or script is shown as text.
- Input caps (5,000 chars per message, 200 messages, 2,000 chars each); bounded regexes; pathological-input tests (`tests/perf.test.js`).
- No cookies, `localStorage` or tracking. Static server serves an allow-list only, with path-traversal guard.

## Accessibility
Root app: zero violations in an automated axe-core audit (light and dark, before and after a result). Skip link, labelled controls, `fieldset/legend` radios, live status region, focus moved to results, verdict shown with icon **and** text (not colour only), `<progress>` with label, light/dark and reduced-motion support, visible focus, 44 px targets, optional read-aloud (feature-detected). The hosted web app uses the same principles (skip link, labelled controls, icon plus text verdicts, 44 px targets, reduced-motion support) but has not had the automated axe-core audit run on it.

## Assumptions & limitations
- Scores are **risk indicators, not proof**. A "low" verdict is not a safety guarantee.
- Official-domain list is illustrative, not exhaustive.
- Hindi/Hinglish coverage is a starter set; other Indian languages are not covered.
- No live reputation lookups by design (privacy). A brand-new scam domain with no scam wording can score low.
- Rules are hand-tuned on a small synthetic corpus; real-world precision/recall will differ.
- Recovery guidance reflects public Indian reporting channels (1930, cybercrime.gov.in, Chakshu) and should be checked against current official pages.

## Layout
```
web/                      hosted React site (see Live site)
index.html  styles.css  src/app.js
src/engine/{normalize,urls,rules,analyze,highlight,playbook,conversation}.js
eval/{corpus.json,run.js}   tests/*.test.js   scripts/{serve.js,public-paths.js}
```
MIT licensed.
