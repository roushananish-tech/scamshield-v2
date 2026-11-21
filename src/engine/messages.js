// Shared user-facing advice strings. One source of truth for the engine and the UI,
// so the report/helpline wording cannot drift between the two.
import { HELPLINE, PORTAL, COMM_PORTAL } from './lostMoney.js';

export const REPORT_ADVICE =
  `Report it: ${COMM_PORTAL} ("Report Suspected Fraud Communication"). If money was lost, call ${HELPLINE} or use ${PORTAL}.`;

export const LOW_RISK_ADVICE =
  'No strong signals does not prove a message is genuine. If anything asks for money, codes or a login, verify through the official app first.';

export const THREAD_LOW_ADVICE =
  'No strong scam pattern found. If anything asks for money, codes or a login, verify through the official app first.';

export const THREAD_SCAM_ADVICE = Object.freeze([
  'Stop replying and do not send money, codes or install anything.',
  'Tell a family member or friend what is happening.',
  REPORT_ADVICE,
]);

export const SHARE_SUFFIX = `Never share OTPs or pay "fees". Report at ${COMM_PORTAL} or call ${HELPLINE} if money is lost.`;
