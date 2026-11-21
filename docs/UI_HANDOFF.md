# UI handoff

The engine, data and tests are done. The UI is yours. Nothing in `index.html`, `src/app.js` or the CSS was changed. Everything below is pure JavaScript with no DOM, so you can import it from `src/app.js`.

All user-facing words are in `docs/CONTENT.md` (regenerate with `npm run content`).

## 1. Suggested screens

| Screen | Job | Module |
|---|---|---|
| **Front door** | Three big choices, no scrolling, no reading: "Check a message", "I am on a call right now", "I already lost money" | none |
| **Check** | Existing paste box and result card (unchanged) | `analyze.js`, `conversation.js` |
| **On a call** | One screen: headline, 4 actions, then "what they will say" | `panic.js` |
| **I lost money** | Pick what happened, then ordered steps, summary builder, urgency note | `lostMoney.js` |
| **Spot the scam** | 6 cards, answer, reveal what the real engine found, score, share | `quiz.js` |
| **Share** | "Send to my parents", "Warn someone", "Share my score" | `share.js` |

Design rule from the research: one primary action per screen, a verdict that takes over the view (not a small tag), and no long text above the fold. Evidence for this is thin (the interstitial-warning studies were on disinformation, not scams), so treat it as a sensible default, not a proven result.

## 2. API reference

All imports are relative to `src/`, e.g. `import { buildPlan } from './engine/lostMoney.js';`

### `panic.js`
```js
PANIC_KINDS            // ['digital_arrest','voice_clone','bank_caller','remote_help']
panicFor(kind)         // { kind, label, headline, doNow[4], theyWillSay[3], afterwards[] } or null
FOUR_RULES             // string[4]
FAMILY_CODEWORD        // { title, steps[3] }
```

### `lostMoney.js`
```js
INCIDENT_IDS           // ['upi_paid','card_misused','shared_code','remote_app','investment','digital_arrest','loan_threat','whatsapp_taken']
INCIDENTS[id].label    // text for the choice buttons
buildPlan(id)          // { id, label, reassure, steps:[{ n, id, title, detail, owner, urgent }], disclaimer } or null
                       // owner: 'helpline' | 'bank' | 'portal' | 'you'  (use for an icon or label, not colour alone)
buildSummary(fields)   // { text, missing[] }   copy-ready text for 1930, the bank or the portal
                       // fields: { incident, amount, when, bank, txnIds (string or array), paidTo,
                       //           scammerContact, how, bankComplaintNo, calledBankAt }
minutesSince(when, nowMs?)  // whole minutes, or null if empty, invalid or in the future
urgencyNote(minutes)   // { phase: 'first_hour'|'early'|'late'|'unknown', label, message }
inr(n)                 // 1234567 -> 'Rs 12,34,567'
HELPLINE, PORTAL, COMM_PORTAL, DISCLAIMER
```
Suggested form fields for the summary: amount, date and time (a `datetime-local` input works with `minutesSince`), bank or wallet, transaction ID(s) or UTR, who the money went to, scammer contact, "in your own words". Show `missing` as a gentle checklist ("You will be asked for: ...") and never block the person from copying a partial summary.

### `quiz.js`
```js
pickRound(seed?)              // 6 cards: 4 scams + 2 genuine, shuffled. Card: { id, truth, channel, text, teach }
gradeAnswer(card, 'scam'|'legit')
                              // { correct, truth, teach, engine:{ verdict, label, score, agrees, reasons:[{label,why}] } }
scoreQuiz(correctFlags[])     // { score, total, tier:{ id:'perfect'|'good'|'learn'|'none', message } }
```
After each answer, show `teach` and the engine's `reasons`. Do not show a leaderboard or store scores.

### `share.js`
```js
waLink(text)                   // https://wa.me/?text=...   (text capped at 900 chars)
parentMessage(baseUrl?)        // fixed text: four rules + link
warnShare(result, baseUrl?)    // uses rule titles only, never the message text
quizShare(score, total, baseUrl?)
safeBaseUrl(url)               // '' unless plain http(s)
```
`baseUrl` is the public address of the deployed app. Pass `location.origin + location.pathname`; if it is not http(s) the link is omitted.

### Existing (unchanged)
`analyzeMessage(text, { channel, sender, acted })`, `analyzeConversation(text, ctx)`, `recoveryFor(acted)`.

## 3. Rules the UI must follow (tests enforce most of these)

1. **Text nodes only.** No `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `eval`, `fetch`, `XMLHttpRequest`, `localStorage` or `sessionStorage` anywhere in `src/app.js` (checked by `tests/static.test.js`).
2. **CSP stays as is** (`default-src 'none'; script-src 'self'; connect-src 'none'; form-action 'none'`). No inline script, handler or style. No `https://` in `src`/`href` of `index.html`; build the WhatsApp link in JS: `a.href = waLink(text)`, `a.target = '_blank'`, `a.rel = 'noopener noreferrer'`. Clicking a link is navigation, so the CSP does not block it.
3. **Never put the checked message in a share link.** Use `warnShare`, which only includes rule titles.
4. **Do not promise outcomes.** No "get your money back", no percentages. Keep the disclaimer visible on the plan.
5. **Accessibility** (the app currently has zero axe-core violations; keep it that way):
   - Move focus to the new screen heading on every screen change.
   - Do not announce a ticking countdown every second. Update a `role="status"` region only when `urgencyNote().phase` changes.
   - Every control labelled; 44 px targets; visible focus; no colour-only meaning (use text or an icon with `aria-hidden` plus a text label).
   - Quiz: answers must work by keyboard, and the reveal goes in a live region.
   - The "I am on a call" screen must be usable in one tap from the front door and readable at a glance: large text, headline first.
6. **Tell the person nothing leaves their device.** True for all of this: no network calls, no storage.
7. Run `npm test` before pushing. It must stay green.

## 4. Where each fact came from (so you can defend it to judges)

Verified in sources during this build:
- **1930 operator needs**: amount, UTR/transaction ID, date and time, bank or wallet, beneficiary UPI ID or account, and how it happened. The report goes into a national system that alerts banks to hold the specific amount (it does not freeze the fraudster's whole account). Sources: delhi-lawyers.in/how-to-report-cyber-fraud-india-1930, cybercrimehelp.in/upi-fraud, govtschemesregister.com (National Cyber Crime Reporting Portal page), scamscan.in/guides/1930-helpline-how-it-works (call the bank separately and keep its complaint number).
- **RBI 3-working-day rule**: RBI circular "Customer Protection - Limiting Liability of Customers in Unauthorised Electronic Banking Transactions", 6 July 2017 (rbi.org.in, Id=11040). Zero liability for a third-party breach reported within 3 working days; limited at 4 to 7; shadow credit within 10 working days.
- **SEBI Press Release 65/2026, 22 Oct 2026**: invitation-only WhatsApp stock-tip groups, "previous group banned" replacement groups, fake endorsements ("astroturfing"), fake trading apps. Sources: taxguru.in/sebi, aninews.in, businesstoday.in.
- **I4C advisories**: "Boss Scam" WhatsApp takeover through malicious "Statement of Account", "MCA" and "RBI" files (PIB release, advisory dated 22 June 2026); "CBI/Police/Customs/ED/Judges do not arrest you on video call" (Deccan Herald / PTI); about 10,000 complaints a day on the national portal (ANI, 17 Nov 2026).
- **Loan apps**: I4C warning on fake loan apps; RBI public directory of digital lending apps live since 1 July 2025 (Moneylife).
- **Spam reporting**: 1909 and the TRAI DND app are for nuisance marketing; fraud goes to 1930 and Sanchar Saathi (Chakshu). Source: DoT Rajya Sabha reply, Feb 2026.
- **Google's on-device scam detection** in India covers Pixel 9 and later and English only (TechCrunch, Nov 2025).

Not verified, so not stated as fact in the app:
- **Customer negligence under the RBI rule.** The app says a bank "may treat the case differently" if you shared a code or approved the payment. That caution comes from my recollection of the circular, not from a page retrieved in this build. Check the circular text before presenting it as law.
- **Any recovery percentage or "golden hour" figure.** Published numbers conflict (from 24% to 95 to 100%), so none is used. The urgency bands (60 minutes, 3 hours) are guidance, not statistics.
- **The TRAI "7726" SMS step.** Dropped. No source confirmed it.
- **SEBI complaint channel.** The app says "SEBI's official investor-complaint channel" without naming a URL.
- **That the quiz or share buttons attract users.** No evidence yet. It is a design bet.

## 5. Accuracy numbers (do not oversell)

Synthetic, hand-written corpus. `holdout4` and `holdout5` were written to test the 2026 patterns in this handoff. See the README table. In short: before the new rules, `holdout4` caught 50% of scams (strict 12.5%). On `holdout5`, written after the rules with different wording, the first run caught 50% (strict 16.7%). After narrow generalisation fixes both reach 100% recall, so those two sets are now **tuned** and optimistic. The honest generalisation estimate is the first-run `holdout5` figure.
