// "Spot the scam" challenge. Cards are hand-written and synthetic (no real
// people, brands or data). Answers are graded against the real analyser, so the
// reveal screen shows what the actual engine found. Nothing is stored or sent.

import { analyzeMessage } from './analyze.js';

/** @type {{id:string, truth:'scam'|'legit', channel:string, text:string, teach:string}[]} */
export const QUIZ_CARDS = [
  { id: 'q-arrest', truth: 'scam', channel: 'WhatsApp video call, then chat',
    text: 'This is Officer Mehta from the Cyber Cell. A SIM bought with your Aadhaar is linked to money laundering. You are under digital arrest. Stay on this video call and do not tell anyone.',
    teach: 'Nobody is arrested over a video call, and "do not tell anyone" is how scammers cut you off from help.' },
  { id: 'q-group', truth: 'scam', channel: 'WhatsApp',
    text: 'Our previous group was banned by WhatsApp. Join the new VIP group, members get daily sure shots and big profits. Tap to join before seats are full.',
    teach: '"The old group was banned, join the new one" and "VIP group" are on SEBI\'s list of stock-tip scam signs.' },
  { id: 'q-kyc', truth: 'scam', channel: 'SMS',
    text: 'Dear customer, your account will be blocked today. Update your KYC now: http://secure-kyc-update.top/verify',
    teach: 'Banks do not do KYC through links. Look at the link: a random ".top" address, not your bank.' },
  { id: 'q-family', truth: 'scam', channel: 'WhatsApp, unknown number',
    text: 'Hi Mum, this is my new number, my phone fell in water. I need to pay a hospital bill urgently. Can you transfer Rs 25,000 to this account? I will explain later.',
    teach: 'A new number plus an urgent money request is the standard family scam. Call your child on the old number first.' },
  { id: 'q-task', truth: 'scam', channel: 'Telegram',
    text: 'Great job, 3 tasks done and commission Rs 450 added! To unlock the next task group you must recharge Rs 3,000 into your merchant account. It will be refunded with extra commission.',
    teach: 'Small payouts first, then a "deposit" to continue. That deposit never comes back.' },
  { id: 'q-remote', truth: 'scam', channel: 'Phone call, then SMS',
    text: 'Your refund of Rs 4,999 is ready. Install AnyDesk and tell our agent the 9-digit code so we can send it to your account right now.',
    teach: 'A remote-access app lets a stranger see your screen and OTPs. Real refunds never need one.' },
  { id: 'q-debit', truth: 'legit', channel: 'SMS from your bank',
    text: 'Rs 1,200.00 debited from A/c XX1234 on 21-Nov via UPI to Metro Mart. If not you, call your bank\'s helpline.',
    teach: 'An alert about a payment you made, with no link and no request. Telling you to call your bank is the safe advice.' },
  { id: 'q-otp', truth: 'legit', channel: 'SMS',
    text: 'Your OTP for login is 394017. It is valid for 10 minutes. Do not share it with anyone.',
    teach: 'This sends a code and warns you not to share it. It becomes a scam only when someone asks you to read it out.' },
  { id: 'q-parcel', truth: 'legit', channel: 'SMS from a shop',
    text: 'Hi, your order from the pharmacy will arrive today between 4 and 6 pm. You can track it in the app you ordered from.',
    teach: 'No link, no payment, no pressure. It points you to the app you already use.' },
];

export const ROUND_SIZE = 6;

// mulberry32: small seeded PRNG so a round can be reproduced in tests.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, rand) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Pick a round: 4 scams and 2 genuine messages in random order.
 * @param {number} [seed]
 */
export function pickRound(seed = Date.now()) {
  const rand = rng(seed);
  const scams = shuffle(QUIZ_CARDS.filter((c) => c.truth === 'scam'), rand).slice(0, 4);
  const legit = shuffle(QUIZ_CARDS.filter((c) => c.truth === 'legit'), rand).slice(0, ROUND_SIZE - 4);
  return shuffle([...scams, ...legit], rand);
}

/**
 * Grade one answer against the real engine.
 * @param {{truth:string,text:string,teach:string}} card
 * @param {'scam'|'legit'} answer
 */
export function gradeAnswer(card, answer) {
  const r = analyzeMessage(card.text);
  const engineSaysScam = r.verdict !== 'low';
  return {
    correct: answer === card.truth,
    truth: card.truth,
    teach: card.teach,
    engine: {
      verdict: r.verdict,
      label: r.label,
      score: r.score,
      agrees: engineSaysScam === (card.truth === 'scam'),
      reasons: r.signals.filter((s) => s.weight >= 0.2).slice(0, 3).map((s) => ({ label: s.label, why: s.why })),
    },
  };
}

/**
 * @param {boolean[]} correctFlags one entry per answered card
 */
export function scoreQuiz(correctFlags) {
  const total = correctFlags.length;
  const score = correctFlags.filter(Boolean).length;
  let tier;
  if (total === 0) tier = { id: 'none', message: '' };
  else if (score === total) tier = { id: 'perfect', message: 'You spotted every one. Scammers rely on people who do not.' };
  else if (score / total >= 0.67) tier = { id: 'good', message: 'Good eye. Look at the ones you missed: those are the tricks to watch for.' };
  else tier = { id: 'learn', message: 'These are exactly the messages scammers rely on. Read the reasons and try again.' };
  return { score, total, tier };
}
