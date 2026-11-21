// "I already lost money" flow. Pure functions: nothing is stored or sent.
// Gives an ordered action plan per incident type, a copy-ready summary to read
// out to 1930 or the bank, and an urgency note.
//
// What 1930 asks for (UTR/transaction ID, amount, date and time, bank or wallet,
// beneficiary details) and the RBI 3-working-day reporting rule are taken from
// published sources listed in docs/UI_HANDOFF.md. Nothing here promises that
// money will be recovered, and no recovery percentage is quoted on purpose:
// published figures conflict.

export const HELPLINE = '1930';
export const PORTAL = 'cybercrime.gov.in';
export const COMM_PORTAL = 'sancharsaathi.gov.in';

export const DISCLAIMER =
  'Guidance only, not legal advice. Reporting early gives banks more to act on, but no step can guarantee that money is returned.';

/** Reusable steps. `owner` tells the UI who acts: you, the bank, or a portal. */
export const STEP_LIBRARY = {
  call_1930: {
    title: 'Call 1930 now',
    detail: 'National cyber-fraud helpline, toll-free, open all day. Give the amount, time, bank or wallet and the transaction ID. The report is passed to the banks so that the specific amount can be put on hold. This does not replace calling your bank.',
    owner: 'helpline', urgent: true,
  },
  call_1930_if_paid: {
    title: 'If you paid them, call 1930',
    detail: 'If any money has left your account, call 1930 with the amount, time, bank and transaction ID.',
    owner: 'helpline', urgent: true,
  },
  call_bank: {
    title: 'Call your bank and block the route',
    detail: 'Use the number printed on your card or inside the official bank app, never a number from a message. Ask them to block the card, UPI or net banking and to flag the transaction. Write down the complaint number and the time of the call.',
    owner: 'bank', urgent: true,
  },
  block_card: {
    title: 'Block the card',
    detail: 'Block it in the bank\'s own app or on the official helpline number printed on the card, then ask for a replacement.',
    owner: 'bank', urgent: true,
  },
  bank_written: {
    title: 'Report to the bank in writing within 3 working days',
    detail: 'Under RBI rules, the time you take to report an unauthorised electronic transaction decides your liability: zero if it was a third-party breach and you report within 3 working days, limited if you report in 4 to 7 working days. The bank must credit the amount temporarily within 10 working days while it investigates. If you yourself shared a code or approved the payment, a bank may treat the case differently, so do not assume a refund. Report today anyway.',
    owner: 'bank', urgent: false,
  },
  portal: {
    title: 'File a complaint on cybercrime.gov.in',
    detail: 'Choose the financial-fraud option, enter the same details and screenshots, and save the acknowledgement number it gives you.',
    owner: 'portal', urgent: false,
  },
  evidence: {
    title: 'Keep every piece of evidence',
    detail: 'Do not delete chats, call logs or messages. Screenshot the phone number, UPI ID, account number, links, app names and payment receipts.',
    owner: 'you', urgent: false,
  },
  stop_paying: {
    title: 'Stop every further payment',
    detail: 'Do not pay any tax, fee, "unlock" amount or withdrawal charge. These are designed to take more money.',
    owner: 'you', urgent: true,
  },
  no_recovery_agents: {
    title: 'Do not pay "recovery agents"',
    detail: 'Anyone offering to get your money back for a fee, or asking you to pay again to release your funds, is running a second scam.',
    owner: 'you', urgent: false,
  },
  change_creds: {
    title: 'Change passwords and PINs from another device',
    detail: 'Banking, email and UPI PIN. Use a phone or computer the scammer never touched.',
    owner: 'you', urgent: true,
  },
  uninstall_remote: {
    title: 'Cut the connection and remove the app',
    detail: 'Switch on airplane mode, then uninstall the remote-access app (AnyDesk, TeamViewer, QuickSupport or whatever they asked for). Run Google Play Protect. If the app will not uninstall, restart in safe mode and remove it. Do not open your banking or UPI apps until this is done.',
    owner: 'you', urgent: true,
  },
  wa_logout: {
    title: 'Log out unknown devices',
    detail: 'In WhatsApp go to Settings, then Linked devices, and log out every device you do not recognise. Then turn on two-step verification.',
    owner: 'you', urgent: true,
  },
  wa_recover: {
    title: 'If you are locked out, re-register your number',
    detail: 'Registering your number again on your own phone with the SMS code usually signs the other person out.',
    owner: 'you', urgent: false,
  },
  wa_warn: {
    title: 'Warn your contacts',
    detail: 'Tell family and friends not to send money or codes to your number until you confirm it is you.',
    owner: 'you', urgent: false,
  },
  extortion_no_pay: {
    title: 'Do not pay the blackmail',
    detail: 'Paying does not stop the threats; it usually brings new demands. Do not delete the messages.',
    owner: 'you', urgent: true,
  },
  extortion_tell: {
    title: 'Tell someone you trust first',
    detail: 'Warn your family and close contacts before the scammer does. A message that "morphed photos are fake" takes the power out of the threat.',
    owner: 'you', urgent: false,
  },
  loan_permissions: {
    title: 'Remove the loan app and its permissions',
    detail: 'Uninstall the app and revoke its access to contacts, photos and SMS in your phone settings.',
    owner: 'you', urgent: false,
  },
  loan_rbi: {
    title: 'Check the lender in the RBI directory',
    detail: 'RBI publishes a public directory of digital lending apps run by regulated lenders. An app that is not listed is not a safe lender.',
    owner: 'you', urgent: false,
  },
  sebi: {
    title: 'Also report the group or app to SEBI',
    detail: 'If a stock-tip group, "IPO allotment" or trading app was involved, report it through SEBI\'s official investor-complaint channel as well as 1930.',
    owner: 'portal', urgent: false,
  },
  tell_family: {
    title: 'Tell a family member today',
    detail: 'This scam depends on secrecy. Telling someone you trust breaks it, and they can help you make the calls above.',
    owner: 'you', urgent: false,
  },
  report_comm: {
    title: 'Report the number or message',
    detail: 'At sancharsaathi.gov.in use "Report Suspected Fraud Communication" (Chakshu).',
    owner: 'portal', urgent: false,
  },
};

/** Incident types shown as choices. `steps` is the ordered list of STEP_LIBRARY ids. */
export const INCIDENTS = {
  upi_paid: {
    label: 'I sent money by UPI or bank transfer',
    reassure: 'Act in the next few minutes. The steps below are in the order that matters.',
    steps: ['call_1930', 'call_bank', 'bank_written', 'portal', 'evidence', 'no_recovery_agents', 'report_comm'],
  },
  card_misused: {
    label: 'My card was used or I shared card details',
    reassure: 'Block the card first, so nothing further can be taken.',
    steps: ['block_card', 'call_1930', 'bank_written', 'portal', 'evidence', 'no_recovery_agents'],
  },
  shared_code: {
    label: 'I shared an OTP, PIN, CVV or password',
    reassure: 'If no money has left yet, blocking now can stop it. If it has, call 1930 as well.',
    steps: ['call_bank', 'change_creds', 'call_1930', 'bank_written', 'evidence', 'report_comm'],
  },
  remote_app: {
    label: 'I installed a remote-access app or shared my screen',
    reassure: 'Cut their access first. While the app is connected, they can see everything you do.',
    steps: ['uninstall_remote', 'call_bank', 'change_creds', 'call_1930', 'bank_written', 'portal', 'evidence'],
  },
  investment: {
    label: 'I put money into an investment, trading app or group',
    reassure: 'Do not add any more money, even to "unlock" a withdrawal.',
    steps: ['stop_paying', 'call_1930', 'call_bank', 'portal', 'sebi', 'evidence', 'no_recovery_agents'],
  },
  digital_arrest: {
    label: 'I paid someone claiming to be police, CBI or customs',
    reassure: 'No agency arrests or interrogates anyone over a call or video chat. You were not under arrest, and you are not in trouble.',
    steps: ['call_1930', 'call_bank', 'tell_family', 'bank_written', 'portal', 'evidence', 'no_recovery_agents'],
  },
  loan_threat: {
    label: 'A loan app is threatening me or my contacts',
    reassure: 'These threats are a pressure tactic. You are not alone, and paying more does not end it.',
    steps: ['extortion_no_pay', 'extortion_tell', 'loan_permissions', 'evidence', 'portal', 'loan_rbi', 'call_1930_if_paid'],
  },
  whatsapp_taken: {
    label: 'My WhatsApp was taken over',
    reassure: 'Take the account back first, then warn people who might be asked for money.',
    steps: ['wa_logout', 'wa_recover', 'wa_warn', 'call_1930_if_paid', 'portal', 'evidence'],
  },
};

export const INCIDENT_IDS = Object.keys(INCIDENTS);

/**
 * @param {string} type one of INCIDENT_IDS
 * @returns {{id:string,label:string,reassure:string,steps:object[],disclaimer:string}|null}
 */
export function buildPlan(type) {
  const inc = INCIDENTS[type];
  if (!inc) return null;
  return {
    id: type,
    label: inc.label,
    reassure: inc.reassure,
    steps: inc.steps.map((id, i) => ({ n: i + 1, id, ...STEP_LIBRARY[id] })),
    disclaimer: DISCLAIMER,
  };
}

// ---- Summary ---------------------------------------------------------------

const LIMITS = { amount: 20, when: 60, bank: 80, one: 120, how: 600, contact: 200, note: 200 };
const MAX_TXN = 10;

// Strip control characters and cap length. Output is only ever shown as text.
function tidy(value, max) {
  return String(value ?? '').replace(/[\u0000-\u001f\u007f\u200b-\u200f\u2028\u2029]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

/** Indian digit grouping: 1234567 -> 12,34,567 */
export function inr(n) {
  const [whole, frac] = Math.abs(n).toFixed(2).split('.');
  const last3 = whole.slice(-3);
  const rest = whole.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `Rs ${rest ? rest + ',' : ''}${last3}${frac === '00' ? '' : '.' + frac}`;
}

function formatAmount(raw) {
  const t = tidy(raw, LIMITS.amount);
  if (!t) return '';
  const digits = t.replace(/[,\s]|rs\.?|inr|₹/gi, '');
  if (/^\d+(\.\d{1,2})?$/.test(digits) && Number(digits) > 0 && Number(digits) < 1e12) return inr(Number(digits));
  return t;
}

/**
 * Build the text the person can read to 1930, their bank, or paste into the portal.
 * @param {{incident?:string, amount?:string, when?:string, bank?:string, txnIds?:string[]|string,
 *          paidTo?:string, scammerContact?:string, how?:string, bankComplaintNo?:string, calledBankAt?:string}} d
 * @returns {{text:string, missing:string[]}}
 */
export function buildSummary(d = {}) {
  const incident = INCIDENTS[d.incident]?.label ?? tidy(d.incident, LIMITS.one);
  const amount = formatAmount(d.amount);
  const when = tidy(d.when, LIMITS.when);
  const bank = tidy(d.bank, LIMITS.bank);
  const txnRaw = Array.isArray(d.txnIds) ? d.txnIds : String(d.txnIds ?? '').split(/[\n,;]+/);
  const txn = txnRaw.map((t) => tidy(t, LIMITS.one)).filter(Boolean).slice(0, MAX_TXN);
  const paidTo = tidy(d.paidTo, LIMITS.contact);
  const contact = tidy(d.scammerContact, LIMITS.contact);
  const how = tidy(d.how, LIMITS.how);
  const bankNo = tidy(d.bankComplaintNo, LIMITS.note);
  const calledAt = tidy(d.calledBankAt, LIMITS.when);

  const missing = [];
  if (!amount) missing.push('Amount lost');
  if (!when) missing.push('Date and time');
  if (!bank) missing.push('Your bank or wallet');
  if (!txn.length) missing.push('Transaction ID / UTR');
  if (!paidTo) missing.push('Who the money went to (UPI ID, account number or phone)');

  const lines = ['CYBER FRAUD REPORT SUMMARY'];
  if (incident) lines.push(`What happened: ${incident}`);
  lines.push(`Amount lost: ${amount || '[fill in]'}`);
  lines.push(`Date and time: ${when || '[fill in]'}`);
  lines.push(`My bank or wallet: ${bank || '[fill in]'}`);
  lines.push(`Transaction ID / UTR: ${txn.length ? txn.join(', ') : '[fill in]'}`);
  lines.push(`Money went to (UPI ID / account / phone): ${paidTo || '[fill in]'}`);
  if (contact) lines.push(`Fraudster contact (number / link / app / profile): ${contact}`);
  if (how) lines.push(`In my words: ${how}`);
  if (bankNo || calledAt) lines.push(`Bank already informed: ${[calledAt && `at ${calledAt}`, bankNo && `complaint no. ${bankNo}`].filter(Boolean).join(', ')}`);
  lines.push('I also have screenshots of the chat and payment receipt.');
  return { text: lines.join('\n'), missing };
}

// ---- Urgency ---------------------------------------------------------------

/**
 * Whole minutes since the incident, or null if the time is missing, invalid or in the future.
 * @param {string|number|Date} when
 * @param {number} [nowMs]
 */
export function minutesSince(when, nowMs = Date.now()) {
  if (when === undefined || when === null || when === '') return null;
  const t = new Date(when).getTime();
  if (!Number.isFinite(t) || t > nowMs) return null;
  return Math.floor((nowMs - t) / 60000);
}

/**
 * Gentle urgency message. Bands follow what 1930 operators and investigators say
 * about speed; no percentage is quoted because published figures conflict.
 * @param {number|null} minutes
 */
export function urgencyNote(minutes) {
  if (minutes === null || !Number.isFinite(minutes) || minutes < 0) {
    return { phase: 'unknown', label: 'Act now', message: 'Call 1930 now. The sooner the report reaches the banks, the more they have to act on.' };
  }
  if (minutes <= 60) {
    return { phase: 'first_hour', label: 'First hour', message: 'You are in the first hour. Call 1930 before anything else.' };
  }
  if (minutes <= 180) {
    return { phase: 'early', label: 'Still early', message: 'Call 1930 now. Every minute gives the money more time to move on.' };
  }
  return { phase: 'late', label: 'Do not wait longer', message: 'Call 1930 anyway. Older cases can still be reported and logged, though earlier reports give banks more to act on. No outcome is guaranteed.' };
}
