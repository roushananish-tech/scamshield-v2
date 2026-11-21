// URL forensics on the *text* of a link. No network access, ever: nothing is
// fetched, resolved or expanded, which removes SSRF and tracking risks.

const KNOWN_TLDS = new Set((
  'com in co net org info biz top xyz icu club vip shop live click work site online cfd sbs app link me ly gl to cc ' +
  'tk ml ga cf gov nic edu io ai us uk pw buzz cyou monster store tech page dev bank sbi life world today fun ' +
  'rest cam bid win loan men review stream download'
).split(' '));

const SUSPICIOUS_TLDS = new Set([
  'top', 'xyz', 'icu', 'club', 'vip', 'shop', 'live', 'click', 'work', 'site', 'online', 'cfd', 'sbs',
  'tk', 'ml', 'ga', 'cf', 'pw', 'buzz', 'cyou', 'monster', 'cam', 'bid', 'win', 'loan', 'men', 'rest', 'fun',
]);

const SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'cutt.ly', 'rb.gy', 'is.gd', 'ow.ly', 'shorturl.at',
  'tiny.cc', 's.id', 'v.gd', 'bit.do', 't.ly', 'rebrand.ly', 'lnkd.in', 'buff.ly',
]);

// Second-level suffixes under .in (and a few others) so "sbi.co.in" is one registrable domain.
const TWO_LEVEL = new Set(['co.in', 'gov.in', 'nic.in', 'org.in', 'ac.in', 'net.in', 'res.in', 'edu.in', 'co.uk']);

// Illustrative, NOT exhaustive. Verify against the organisation's own app or card.
const BRANDS = [
  { name: 'SBI', tokens: ['sbi', 'sbionline', 'onlinesbi'], official: ['sbi.co.in', 'onlinesbi.sbi', 'sbi.bank.in'] },
  { name: 'HDFC Bank', tokens: ['hdfc', 'hdfcbank'], official: ['hdfcbank.com', 'hdfc.bank.in'] },
  { name: 'ICICI Bank', tokens: ['icici', 'icicibank'], official: ['icicibank.com'] },
  { name: 'Axis Bank', tokens: ['axisbank'], official: ['axisbank.com'] },
  { name: 'Paytm', tokens: ['paytm'], official: ['paytm.com'] },
  { name: 'PhonePe', tokens: ['phonepe'], official: ['phonepe.com'] },
  { name: 'NPCI / UPI', tokens: ['npci'], official: ['npci.org.in'] },
  { name: 'IRCTC', tokens: ['irctc'], official: ['irctc.co.in'] },
  { name: 'Amazon', tokens: ['amazon'], official: ['amazon.in', 'amazon.com'] },
  { name: 'Flipkart', tokens: ['flipkart'], official: ['flipkart.com'] },
  { name: 'India Post', tokens: ['indiapost'], official: ['indiapost.gov.in'] },
  { name: 'DTDC', tokens: ['dtdc'], official: ['dtdc.in', 'dtdc.com'] },
  { name: 'Blue Dart', tokens: ['bluedart'], official: ['bluedart.com'] },
  { name: 'Delhivery', tokens: ['delhivery'], official: ['delhivery.com'] },
  { name: 'UIDAI / Aadhaar', tokens: ['uidai', 'aadhaar', 'aadhar'], official: ['uidai.gov.in'] },
  { name: 'Income Tax Dept', tokens: ['incometax', 'incometaxindia'], official: ['incometax.gov.in'] },
  { name: 'EPFO', tokens: ['epfo', 'epfindia'], official: ['epfindia.gov.in', 'epfo.gov.in'] },
  { name: 'Parivahan / RTO', tokens: ['parivahan', 'mparivahan', 'echallan'], official: ['parivahan.gov.in'] },
  { name: 'Jio', tokens: ['jio'], official: ['jio.com'] },
  { name: 'Airtel', tokens: ['airtel'], official: ['airtel.in'] },
];

const PHISH_WORDS = new Set(['kyc', 'verify', 'verification', 'secure', 'login', 'update', 'claim', 'reward', 'refund', 'bonus', 'free', 'pay', 'track', 'redeliver']);

/** Registrable domain (naive: no public-suffix list). */
export function registrable(host) {
  const labels = host.split('.');
  if (labels.length <= 2) return host;
  const last2 = labels.slice(-2).join('.');
  if (TWO_LEVEL.has(last2)) return labels.slice(-3).join('.');
  return last2;
}

/** Find URL-like strings in (normalised) text. Returns [{raw, start, end}]. */
export function extractUrls(text) {
  const out = [];
  const re = /\b(?:https?:\/\/|www\.)[^\s<>"')]+|\b[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)*\.[a-z]{2,24}(?:\/[^\s<>"')]*)?/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    let raw = m[0].replace(/[.,;:!?]+$/, '');
    const hasScheme = /^(https?:\/\/|www\.)/i.test(raw);
    if (!hasScheme) {
      const host = raw.split('/')[0];
      const tld = host.split('.').pop();
      if (!KNOWN_TLDS.has(tld)) continue; // "Mr.Sharma" is not a link
    }
    out.push({ raw, start: m.index, end: m.index + raw.length });
  }
  return out;
}

/** Parse the host out of a URL-like string. */
export function parseHost(raw) {
  let s = raw.replace(/^https?:\/\//i, '');
  const hasUserinfo = /^[^/?#]*@/.test(s);
  s = s.replace(/^[^/?#]*@/, '');
  const authority = s.split(/[/?#]/)[0].replace(/:\d+$/, '');
  const path = s.slice(authority.length);
  return { host: authority.toLowerCase(), path, hasUserinfo, insecure: /^http:\/\//i.test(raw) };
}

/**
 * Analyse one link. Returns flags: {id, category, weight, label, why}.
 * @param {string} raw
 */
export function analyzeUrl(raw) {
  const { host, path, hasUserinfo, insecure } = parseHost(raw);
  const reg = registrable(host);
  const tld = host.split('.').pop();
  const flags = [];
  let official = false;

  const brandHit = BRANDS.find((b) => {
    const tokens = host.split(/[.-]/);
    return tokens.some((t) => b.tokens.includes(t) || (t.length >= 6 && b.tokens.some((bt) => bt.length >= 4 && t.startsWith(bt))));
  });
  if (brandHit) {
    if (brandHit.official.includes(reg)) official = true;
    else {
      flags.push({
        id: 'link_brand_mismatch', category: 'link_impersonation', weight: 0.65,
        label: `Link imitates ${brandHit.name}`,
        why: `The domain "${reg}" uses the name "${brandHit.name}" but is not one of its known official domains. Scammers register look-alike domains.`,
      });
    }
  }
  if (SHORTENERS.has(host)) {
    flags.push({ id: 'link_shortener', category: 'link_obfuscation', weight: 0.3, label: 'Shortened link',
      why: 'Short links hide the real destination, so you cannot judge the site before opening it.' });
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    flags.push({ id: 'link_ip', category: 'link_obfuscation', weight: 0.5, label: 'Link points to a raw IP address',
      why: 'Legitimate services use domain names, not bare IP addresses.' });
  }
  if (host.split('.').some((l) => l.startsWith('xn--'))) {
    flags.push({ id: 'link_punycode', category: 'link_obfuscation', weight: 0.5, label: 'Look-alike (punycode) domain',
      why: 'Punycode can disguise foreign characters as familiar letters.' });
  }
  if (hasUserinfo) {
    flags.push({ id: 'link_userinfo', category: 'link_obfuscation', weight: 0.5, label: 'Link contains "@" trick',
      why: 'Text before "@" is ignored by browsers, so the real host is what comes after it.' });
  }
  if (/\.apk(\b|$)/i.test(path) || /\.apk$/i.test(host)) {
    flags.push({ id: 'link_apk', category: 'link_apk', weight: 0.75, label: 'Link downloads an APK app file',
      why: 'Installing apps from links, outside the Play Store, is a common way to steal OTPs and take over phones.' });
  }
  if (SUSPICIOUS_TLDS.has(tld) && !official) {
    flags.push({ id: 'link_tld', category: 'link_tld', weight: 0.25, label: `Risky domain ending ".${tld}"`,
      why: 'Cheap, rarely-used endings are heavily used for throwaway scam sites.' });
  }
  const tokens = host.split(/[.-]/);
  if (!official && tokens.some((t) => PHISH_WORDS.has(t))) {
    flags.push({ id: 'link_phish_words', category: 'link_keywords', weight: 0.3, label: 'Phishing-style words in the domain',
      why: 'Words like "kyc", "verify" or "refund" inside a domain are a typical phishing pattern.' });
  }
  const govTld = /\.(gov|nic)\.in$/.test(host);
  if (!official && !govTld && tokens.some((t) => t === 'gov' || t === 'govt')) {
    flags.push({ id: 'link_fake_gov', category: 'link_impersonation', weight: 0.5, label: 'Looks governmental but is not .gov.in',
      why: 'Indian government sites end in .gov.in or .nic.in.' });
  }
  if ((host.match(/-/g) || []).length >= 3 || host.split('.').length >= 5) {
    flags.push({ id: 'link_structure', category: 'link_structure', weight: 0.2, label: 'Unusually long or hyphen-heavy domain',
      why: 'Scam domains are often stitched together from many words.' });
  }
  if (insecure && flags.length > 0) {
    flags.push({ id: 'link_http', category: 'link_http', weight: 0.08, label: 'Link is not encrypted (http)',
      why: 'Not encrypted; modern services use https.' });
  }
  return { raw, host, registrable: reg, official, flags };
}
