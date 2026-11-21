// "I'm on a call right now" cards. Short, imperative, readable under stress.
// Pure data plus a lookup; no DOM.
//
// The "no agency arrests anyone over a video call" line follows the public I4C
// advisory ("CBI/Police/Customs/ED/Judges do not arrest you on a video call").

export const PANIC = {
  digital_arrest: {
    label: 'Someone says I am under "digital arrest", or claims to be police, CBI or customs',
    headline: 'Hang up. This is a scam.',
    doNow: [
      'End the call or video chat. You are free to.',
      'No police officer, CBI, ED, customs officer or judge arrests or questions anyone over a video call.',
      'Tell someone near you now, or call a family member on their saved number.',
      'Do not transfer money, not even to a "safe", "RBI" or "verification" account.',
    ],
    theyWillSay: [
      'Do not hang up and do not tell anyone.',
      'Your Aadhaar, SIM or a parcel in your name is linked to a crime.',
      'Pay now to clear your name and the money will be returned.',
    ],
    afterwards: ['Report at cybercrime.gov.in or call 1930.', 'If you already paid, open the "I lost money" plan.'],
  },
  voice_clone: {
    label: 'A voice that sounds like someone I know is asking for money',
    headline: 'Do not send money on a voice call alone.',
    doNow: [
      'Hang up.',
      'Call that person back on the number saved in your phone, or ask someone else who can reach them.',
      'Ask for the family code word, or a question only the real person could answer.',
      'Pressure to pay within minutes is the scam. Slow down.',
    ],
    theyWillSay: [
      'I am in an accident, hospital or police trouble.',
      'Do not tell anyone, just send the money now.',
      'My phone is broken, this is a new number.',
    ],
    afterwards: ['Agree a family code word, a secret word that only your family knows, and keep it offline.', 'If you already paid, open the "I lost money" plan.'],
  },
  bank_caller: {
    label: 'Someone claiming to be my bank, card company or a support agent is on the line',
    headline: 'Hang up. Banks never ask for an OTP, PIN or CVV.',
    doNow: [
      'Hang up.',
      'Call your bank on the number printed on your card or inside its official app.',
      'Do not share any OTP, PIN, CVV or password, whatever they say.',
      'Do not install any app or share your screen.',
    ],
    theyWillSay: [
      'Your card or account is blocked or compromised.',
      'We are sending an OTP, please read it out to verify you.',
      'Install this app so we can fix it.',
    ],
    afterwards: ['If you shared a code, call your bank at once and open the "I lost money" plan.', 'Report the number at sancharsaathi.gov.in.'],
  },
  remote_help: {
    label: 'Someone asked me to install an app or share my screen',
    headline: 'Stop sharing your screen and close the app now.',
    doNow: [
      'End the call and close or uninstall the app (AnyDesk, TeamViewer, QuickSupport or similar).',
      'Switch on airplane mode.',
      'Do not open your banking or UPI apps.',
      'Then open the "I lost money" plan and choose the remote-access option.',
    ],
    theyWillSay: [
      'Install this app so we can process your refund.',
      'Read me the 9-digit code on your screen.',
      'Open your banking app so I can check it.',
    ],
    afterwards: ['Change your banking and UPI passwords from a different device.', 'Call your bank on the number on your card.'],
  },
};

export const PANIC_KINDS = Object.keys(PANIC);

/** @param {string} kind one of PANIC_KINDS */
export function panicFor(kind) {
  const p = PANIC[kind];
  return p ? { kind, ...p } : null;
}

/** Four-line rule card for sharing with family. */
export const FOUR_RULES = [
  'Police, CBI and customs never arrest anyone over a call or video. Hang up.',
  'Never share an OTP, PIN or CVV with anyone, ever.',
  'Never install an app or share your screen because a caller asked.',
  'If someone you know asks for money, call them back on their saved number first.',
];

export const FAMILY_CODEWORD = {
  title: 'Set a family code word',
  steps: [
    'Pick a word or phrase that is not on social media and cannot be guessed from your photos.',
    'Tell it to your close family in person or on a call, and never write it in a chat.',
    'If anyone asks for money in an emergency, ask for the code word first. No code word means no money.',
  ],
};
