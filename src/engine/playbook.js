// "I already did something" recovery playbooks. Official routes per the
// Department of Telecommunications (Sanchar Saathi / Chakshu) and the National
// Cyber Crime Reporting Portal. This is guidance, not legal advice; outcomes
// (such as getting money back) are never promised.

export const ACTED = ['none', 'clicked', 'replied', 'shared', 'installed', 'paid'];

const REPORT_COMM = 'Report the message at sancharsaathi.gov.in ("Report Suspected Fraud Communication", Chakshu).';
const REPORT_LOSS = 'If money or account access is lost, call 1930 and file at cybercrime.gov.in as soon as possible.';

export const PLAYBOOKS = {
  clicked: {
    title: 'You opened the link',
    steps: [
      'Close the page. Do not enter any detail, download anything or tap any button.',
      'If you typed a password or card detail, change that password now from a different, trusted device and call your bank using the number on your card.',
      'Clear the browser history and run a scan with your phone\'s built-in security (Google Play Protect or equivalent).',
      REPORT_COMM,
    ],
  },
  replied: {
    title: 'You replied to the sender',
    steps: [
      'Stop replying. Block the number and report it in WhatsApp or your SMS app.',
      'Be alert for follow-up calls: the sender now knows your number is active.',
      'If you shared any personal detail, treat it as exposed and watch your accounts.',
      REPORT_COMM,
    ],
  },
  shared: {
    title: 'You shared an OTP, PIN, CVV or password',
    steps: [
      'Act within minutes: call your bank (number on your card or official app) and ask them to block the card, UPI or net banking.',
      'Change the password or PIN you shared from a trusted device.',
      REPORT_LOSS,
      REPORT_COMM,
    ],
  },
  installed: {
    title: 'You installed an app from the message',
    steps: [
      'Turn on airplane mode / switch off mobile data and Wi-Fi to cut the app\'s connection.',
      'Uninstall the app (Settings > Apps). If it will not uninstall, boot to safe mode and remove it.',
      'From a different device, change your banking, email and UPI passwords and call your bank.',
      REPORT_LOSS,
      REPORT_COMM,
    ],
  },
  paid: {
    title: 'You sent money',
    steps: [
      'Call 1930 immediately and file at cybercrime.gov.in. Speed matters for any chance of intervention; no result can be promised.',
      'Call your bank right away, give the transaction details and ask them to flag the transfer.',
      'Keep evidence: screenshots of the chat, number, transaction ID, UPI ID or account used. Do not delete the conversation.',
      'Do not pay again to "recover" the money. That is a second scam.',
      REPORT_COMM,
    ],
  },
};

/** @param {string} acted */
export function recoveryFor(acted) {
  return PLAYBOOKS[acted] ?? null;
}
