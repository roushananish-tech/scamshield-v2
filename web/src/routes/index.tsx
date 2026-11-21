import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, MAIN_HEADING_ID } from "../ui/chrome";
import { FrontDoorCards } from "../ui/parts";
import { Icon, type IconName } from "../ui/icons";
import { NewTab } from "../ui/parts";
import { LiveDemo } from "../ui/demo";
import { RedFlags } from "../ui/redflags";
import { ScamAccordion, type AccItem } from "../ui/accordion";
import { FeaturePanel, type Feature } from "../ui/featurepanel";
import { STAGES, STAGE_INFO } from "../engine/conversation.js";
import { COMM_PORTAL, PORTAL } from "../engine/lostMoney.js";
import { portalHref } from "../lib/links";
import { FOUR_RULES, PANIC_KINDS } from "../engine/panic.js";
import { TEL_1930 } from "../lib/links";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "ScamShield: help with scam messages and calls" }] }),
  component: Home,
});

const TRICKS: AccItem[] = [
  { kind: "digital_arrest", icon: "alert-triangle", title: "Digital arrest", sub: "Fake police, CBI or customs, often on a video call, demanding money.", img: "scam-digital", alt: "A phone showing a video call from a faceless uniformed figure, with a red warning ring and a handcuff icon." },
  { kind: "bank_caller", icon: "bank", title: "Fake bank or card call", sub: "A support agent who needs your OTP, PIN or card number.", img: "scam-phishing", alt: "A hook dangling over a phone chat bubble that holds a link." },
  { kind: "voice_clone", icon: "person", title: "Cloned voice", sub: "A familiar voice in sudden trouble, asking for money fast.", img: "scam-voice", alt: "A phone with two overlapping sound waves and a microphone, showing a copied voice." },
  { kind: "remote_help", icon: "phone", title: "Screen share trap", sub: "Asked to install an app or share your screen to fix something.", img: "scam-remote", alt: "A laptop with a red cursor and an eye icon, showing a stranger watching the screen." },
];

const STATS: { num: string; label: string }[] = [
  { num: "106", label: "test messages written in real scam styles" },
  { num: "100%", label: "of test scams flagged" },
  { num: "0", label: "genuine test messages flagged" },
  { num: "0", label: "words you type sent anywhere" },
];

const HOW: { title: string; text: string }[] = [
  { title: "Tell it what is happening", text: "A call, a message, or money already gone. Three big buttons, no sign-up, no app." },
  { title: "It looks for the tricks", text: "Fake links, OTP requests, threats, secrecy and pressure. Checked on your own phone." },
  { title: "Get the next steps", text: "Plain steps in the right order, with the 1930 helpline one tap away." },
];

const FEATURES: Feature[] = [
  { title: HOW[0].title, text: HOW[0].text, img: "step-hero", alt: "ScamShield help screen illustration." },
  { title: HOW[1].title, text: HOW[1].text, img: "step-call", alt: "A person on a phone call being guided step by step." },
  { title: HOW[2].title, text: HOW[2].text, img: "step-family", alt: "A family looking at a phone together." },
];

const FAQ: { q: string; a: string }[] = [
  { q: "Is ScamShield free?", a: "Yes. There is no sign-up, no app to install and no advertising." },
  {
    q: "Does it send my message anywhere?",
    a: "No. The check runs inside your browser on your device. The site has no server code that receives what you type, and its security settings stop the page from sending data out.",
  },
  {
    q: "Can it be wrong?",
    a: "Yes. It is a rule-based checker and new tricks can get past it. If a message asks for money, a code or an app, check with someone you trust first.",
  },
  {
    q: "I already paid. What should I do?",
    a: "Call 1930 as soon as you can and report the fraud at cybercrime.gov.in. The lost-money steps list what to do first, in order.",
  },
  {
    q: "Who is it for?",
    a: "Anyone in India who gets suspicious calls or messages, and the families who look out for them.",
  },
];

function Home() {
  const tricks = TRICKS.filter((t) => (PANIC_KINDS as string[]).includes(t.kind));
  return (
    <Page wide>
      <section className="hero2" aria-labelledby={MAIN_HEADING_ID}>
        <div className="wrap wrap--wide hero2__grid">
          <div className="hero2__copy">
            <p className="eyebrow rise">
              <Icon name="lock" size={18} />
              Free. Private. Made for India.
            </p>
            <h1 id={MAIN_HEADING_ID} tabIndex={-1} className="hero2__title rise rise--2">
              Strange call or message? <span className="grad-text">Know what to do next.</span>
            </h1>
            <p className="hero2__lead rise rise--3">
              ScamShield checks suspicious messages, guides you through a live scam call, and lists the exact steps if
              money is gone. It runs on your device. Nothing you type is sent or saved.
            </p>
            <div className="rise rise--4">
              <h2 className="hero2__ask">What is happening?</h2>
              <FrontDoorCards />
              <ul className="trust-row">
                <li><Icon name="check" size={20} />No sign-up</li>
                <li><Icon name="check" size={20} />Works on any phone</li>
                <li><Icon name="check" size={20} />1930 helpline built in</li>
              </ul>
            </div>
          </div>
          <div className="hero2__art" aria-hidden="true">
            <img
              src="/img/hero-960.webp"
              srcSet="/img/hero-560.webp 560w, /img/hero-960.webp 960w"
              sizes="(min-width: 1024px) 500px, 90vw"
              width={960}
              height={960}
              alt=""
              fetchPriority="high"
              decoding="async"
            />
            <span className="float-chip float-chip--danger">
              <Icon name="alert-triangle" size={20} />
              Asks for your OTP
            </span>
            <span className="float-chip float-chip--ok">
              <Icon name="lock" size={20} />
              Checked on your device
            </span>
          </div>
        </div>
      </section>

      <section className="help-strip" aria-labelledby="help-h">
        <div className="wrap wrap--wide help-strip__row">
          <h2 id="help-h" className="help-strip__title">Official help in India</h2>
          <ul className="help-strip__list">
            <li><a href={TEL_1930} aria-label="Call 1930, the national cyber-fraud helpline"><Icon name="phone" size={20} />1930 helpline</a></li>
            <li><a href={portalHref(PORTAL)} target="_blank" rel="noopener noreferrer"><Icon name="globe" size={20} />{PORTAL}<NewTab /></a></li>
            <li><a href={portalHref(COMM_PORTAL)} target="_blank" rel="noopener noreferrer"><Icon name="globe" size={20} />{COMM_PORTAL}<NewTab /></a></li>
          </ul>
        </div>
      </section>

      <section className="section section--tint" aria-labelledby="proof-h">
        <div className="wrap wrap--wide">
          <div className="section-head">
            <p className="kicker">Tested</p>
            <h2 id="proof-h" className="section__title">Checked against 106 messages before you use it</h2>
          </div>
          <ul className="stats">
            {STATS.map((s) => (
              <li key={s.label}>
                <span className="stat__num">{s.num}</span>
                <span className="stat__label">{s.label}</span>
              </li>
            ))}
          </ul>
          <p className="fine-print">
            A small test set we wrote ourselves. A good sign, not a guarantee. New tricks can still get past it.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="demo-h">
        <div className="wrap wrap--wide demo-grid">
          <div className="section-head">
            <p className="kicker">Try it</p>
            <h2 id="demo-h" className="section__title">See a check in action</h2>
            <p className="section__lead">
              Pick an example and press check. ScamShield explains what it found in plain words, right here on your
              device.
            </p>
            <div className="actions">
              <Link to="/check" className="btn btn--secondary">
                <Icon name="message" />
                Check your own message
              </Link>
            </div>
          </div>
          <LiveDemo />
        </div>
      </section>

      <section className="section section--tint" aria-labelledby="how-h">
        <div className="wrap wrap--wide">
          <div className="section-head">
            <p className="kicker">How it works</p>
            <h2 id="how-h" className="section__title">Three steps, no technical words</h2>
          </div>
          <FeaturePanel items={FEATURES} />
        </div>
      </section>

      <section className="section" aria-labelledby="bento-h">
        <div className="wrap wrap--wide">
          <div className="section-head">
            <p className="kicker">Everything in one place</p>
            <h2 id="bento-h" className="section__title">One calm place for every scam moment</h2>
          </div>
          <ul className="bento">
            <li className="bento__a">
              <Link to="/check" className="bento__card bento__card--feature">
                <span className="icon-tile" aria-hidden="true"><Icon name="message" size={28} /></span>
                <span className="bento__title">Check a message</span>
                <span className="bento__sub">Paste a text, WhatsApp or email. See the warning signs in plain words, with the suspicious parts picked out.</span>
                <span className="bento__chips" aria-hidden="true">
                  <span className="mini-chip mini-chip--danger">Fake link</span>
                  <span className="mini-chip mini-chip--danger">Asks for OTP</span>
                  <span className="mini-chip mini-chip--caution">Threat</span>
                </span>
              </Link>
            </li>
            <li className="bento__b">
              <Link to="/call" className="bento__card">
                <span className="icon-tile" aria-hidden="true"><Icon name="phone" size={28} /></span>
                <span className="bento__title">Call guide</span>
                <span className="bento__sub">What to say and when to hang up, while they are still on the line.</span>
              </Link>
            </li>
            <li className="bento__c">
              <Link to="/lost" className="bento__card">
                <span className="icon-tile" aria-hidden="true"><Icon name="rupee" size={28} /></span>
                <span className="bento__title">Lost money steps</span>
                <span className="bento__sub">The right order of calls and reports, starting with 1930.</span>
              </Link>
            </li>
            <li className="bento__d">
              <Link to="/quiz" className="bento__card">
                <span className="icon-tile" aria-hidden="true"><Icon name="shield" size={28} /></span>
                <span className="bento__title">Spot the scam quiz</span>
                <span className="bento__sub">Six messages. Learn the signs by trying.</span>
              </Link>
            </li>
            <li className="bento__e">
              <Link to="/share" className="bento__card">
                <span className="icon-tile" aria-hidden="true"><Icon name="share" size={28} /></span>
                <span className="bento__title">Send to family</span>
                <span className="bento__sub">The four rules on WhatsApp, in one tap.</span>
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <section className="section section--tint" aria-labelledby="flags-h">
        <div className="wrap wrap--wide">
          <div className="section-head">
            <p className="kicker">Learn the signs</p>
            <h2 id="flags-h" className="section__title">Four red flags in almost every scam</h2>
            <p className="section__lead">Pick one to see what scammers say and what is really true.</p>
          </div>
          <RedFlags />
        </div>
      </section>

      <section className="section" aria-labelledby="tl-h">
        <div className="wrap wrap--wide">
          <div className="section-head">
            <p className="kicker">The script</p>
            <h2 id="tl-h" className="section__title">How a scam unfolds</h2>
            <p className="section__lead">Most scams follow the same five steps. Spot the stage you are in and stop before the last one.</p>
          </div>
          <ol className="tl">
            {(STAGES as string[]).map((st, i) => (
              <li key={st} className="tl__item">
                <span className="tl__dot" aria-hidden="true">{i + 1}</span>
                <h3 className="tl__title">{STAGE_INFO[st as keyof typeof STAGE_INFO].label}</h3>
                <p className="tl__text">{STAGE_INFO[st as keyof typeof STAGE_INFO].meaning}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="tricks-h">
        <div className="wrap wrap--wide">
          <div className="section-head">
            <p className="kicker">Going around now</p>
            <h2 id="tricks-h" className="section__title">Tricks scammers use on calls</h2>
            <p className="section__lead">Tap one if it is happening to you right now. Each opens a short guide you can follow while they are on the line.</p>
          </div>
          <ScamAccordion items={tricks} />
        </div>
      </section>

      <section className="section section--flush" aria-labelledby="call-h">
        <div className="wrap wrap--wide">
          <div className="band-dark">
            <div>
              <p className="kicker">On a call right now?</p>
              <h2 id="call-h" className="section__title">Real police, banks and courts never ask for money or codes on a call</h2>
              <p className="section__lead">
                Open the call guide and keep it on screen while you talk. It tells you what to say, when to hang up,
                and who to call next.
              </p>
              <div className="actions">
                <Link to="/call" className="btn btn--danger">
                  <Icon name="phone" />
                  Open the call guide
                </Link>
                <a href={TEL_1930} className="btn btn--secondary" aria-label="Call 1930, the national cyber-fraud helpline">
                  Call 1930
                </a>
              </div>
            </div>
            <img
              className="band-dark__img"
              src="/img/call-720.webp"
              srcSet="/img/call-480.webp 480w, /img/call-720.webp 720w"
              sizes="(min-width: 900px) 360px, 80vw"
              width={720}
              height={720}
              alt=""
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </section>

      <section className="section section--rules" aria-labelledby="rules-h">
        <div className="wrap wrap--wide">
          <div className="section-head">
            <p className="kicker">Remember these</p>
            <h2 id="rules-h" className="section__title">Four rules that beat almost every scam</h2>
          </div>
          <ol className="rules-rail">
            {(FOUR_RULES as string[]).map((rule, i) => (
              <li key={rule}>
                <span className="rules-rail__num" aria-hidden="true">{i + 1}</span>
                <p>{rule}</p>
              </li>
            ))}
          </ol>
          <div className="actions">
            <Link to="/share" className="btn btn--primary">
              <Icon name="share" />
              Send these to family
            </Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="family-h">
        <div className="wrap wrap--wide split">
          <img
            className="split__img"
            src="/img/family-1024.webp"
            srcSet="/img/family-640.webp 640w, /img/family-1024.webp 1024w"
            sizes="(min-width: 900px) 560px, 92vw"
            width={1024}
            height={688}
            alt="A grandson shows his grandmother something on her phone while she smiles."
            loading="lazy"
            decoding="async"
          />
          <div>
            <p className="kicker">For your family</p>
            <h2 id="family-h" className="section__title">Protect the people who get these calls</h2>
            <p className="section__lead">
              Most people have never heard the four rules. Send them on WhatsApp in one tap, or test yourself with six
              real-style messages.
            </p>
            <div className="actions">
              <Link to="/share" className="btn btn--primary">
                <Icon name="share" />
                Send the rules to family
              </Link>
              <Link to="/quiz" className="btn btn--secondary">
                <Icon name="shield" />
                Take the 6-message quiz
              </Link>
            </div>
            <p className="gap-top">
              <Link to="/rules" className="inline-tap">Read the four rules</Link>
            </p>
          </div>
        </div>
      </section>

      <section className="section section--tint" aria-labelledby="faq-h">
        <div className="wrap wrap--wide">
          <div className="section-head">
            <p className="kicker">Questions</p>
            <h2 id="faq-h" className="section__title">Good to know</h2>
          </div>
          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
          {/* The lost-money link sits outside the answers so every answer stays plain text. */}
          <p className="gap-top-lg">
            <Link to="/lost" className="inline-tap">Open the lost-money steps</Link>
          </p>
        </div>
      </section>
    </Page>
  );
}
