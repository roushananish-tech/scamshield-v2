import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "./icons";
import { analyzeMessage } from "../engine/analyze.js";
import { PANIC } from "../engine/panic.js";
import { HELPLINE } from "../engine/lostMoney.js";
import { TEL_1930 } from "../lib/links";

type Page = "/lost" | "/check" | "/quiz" | "/rules" | "/call";
type Reply = {
  text: string;
  lines?: string[];
  guide?: string;
  page?: { to: Page; label: string };
  tel?: boolean;
};
type Msg = { who: "me" | "bot"; text: string; reply?: Reply };

type Signal = { label: string; why: string; weight: number };

const MAX = 5000;
const KINDS = ["digital_arrest", "voice_clone", "bank_caller", "remote_help"] as const;

const CHIPS = [
  "I am on a call right now",
  "I already paid",
  "Is this message a scam",
  "What are the four rules",
];

const WELCOME: Reply = {
  text: "I am the ScamShield assistant. Describe what is happening, or paste a message, and I will point you to the right steps. I run on your device. Nothing you type leaves this page.",
};

function guideReply(kind: (typeof KINDS)[number]): Reply {
  const p = (PANIC as Record<string, { headline: string; doNow: string[] }>)[kind];
  return { text: p.headline, lines: p.doNow, guide: kind, tel: true };
}

function answer(input: string): Reply {
  const t = input.trim().slice(0, MAX);
  const low = t.toLowerCase();
  const long = t.length > 80 || /https?:\/\/|www\.|bit\.ly|\.apk\b/.test(low);

  if (long === false && /(already|just)\s+(paid|sent|transferred|shared)|lost (my )?money|money (is )?gone|got cheated|i was cheated|i paid/.test(low)) {
    return {
      text: "Act fast. Call " + HELPLINE + " now and report at cybercrime.gov.in. The lost money page lists the steps in the right order.",
      tel: true,
      page: { to: "/lost", label: "Open the lost money steps" },
    };
  }
  if (long === false && /arrest|cbi|customs|police|narcotic|digital|court|warrant/.test(low)) return guideReply("digital_arrest");
  if (long === false && /\bvoice\b|\bson\b|daughter|mother|father|brother|sister|relative|accident|hospital|new number/.test(low)) return guideReply("voice_clone");
  if (long === false && /anydesk|teamviewer|quicksupport|\bscreen\b|install|remote|\bapp\b/.test(low)) return guideReply("remote_help");
  if (long === false && /\bbank\b|\botp\b|\bpin\b|\bcvv\b|\bcard\b|\bkyc\b|refund/.test(low)) return guideReply("bank_caller");
  if (long === false && /rule|family|tips|protect/.test(low)) {
    return { text: "Four rules to share with family. Print them, or send them on WhatsApp from the rules page.", page: { to: "/rules", label: "Open the four rules" } };
  }
  if (long === false && /\bquiz\b|practice|\btest\b|learn/.test(low)) {
    return { text: "Try a round of six real style messages and see if you can spot the scam.", page: { to: "/quiz", label: "Start the quiz" } };
  }
  if (long === false && /call|calling|phone|on the line/.test(low)) {
    return { text: "Tell me what the caller is saying. Are they police or customs, your bank, a relative in trouble, or asking you to install an app?", page: { to: "/call", label: "Open the call guide" } };
  }
  if (long === false && /message|\btext\b|\bsms\b|\blink\b|whatsapp|\bscam\b/.test(low)) {
    return { text: "Paste the message here and I will check it. Or use the full checker for a whole chat.", page: { to: "/check", label: "Open the checker" } };
  }
  if (long) {
    const r = analyzeMessage(t, { sender: "unsure" }) as { verdict: string; label: string; signals: Signal[] };
    if (r.verdict === "low") {
      return {
        text: "No warning signs found in that text. This is a rule based check and new tricks can get past it. If it asks for money, a code or an app, check with someone you trust first.",
        page: { to: "/check", label: "Check the whole chat" },
      };
    }
    const top = r.signals.filter((s) => s.weight >= 0.1).slice(0, 3).map((s) => s.label + ": " + s.why);
    return {
      text: r.label + ". Do not reply, click or pay.",
      lines: top,
      page: { to: "/check", label: "See the full check" },
    };
  }
  return {
    text: "I did not catch that. Try one of the options below, or paste the message you received.",
  };
}

function ReplyView({ reply }: { reply: Reply }) {
  return (
    <>
      <p>{reply.text}</p>
      {reply.lines ? (
        <ul className="bot__list">
          {reply.lines.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      ) : null}
      <div className="bot__actions">
        {reply.guide ? (
          <Link to="/call/$kind" params={{ kind: reply.guide }} className="bot__btn">
            Open the full guide
            <Icon name="chevron-right" size={18} />
          </Link>
        ) : null}
        {reply.page ? (
          <Link to={reply.page.to} className="bot__btn">
            {reply.page.label}
            <Icon name="chevron-right" size={18} />
          </Link>
        ) : null}
        {reply.tel ? (
          <a href={TEL_1930} className="bot__btn bot__btn--call">Call {HELPLINE}</a>
        ) : null}
      </div>
    </>
  );
}

/** On device helper. Uses the same rule engine as the rest of the site. No network. */
export function Assistant() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([{ who: "bot", text: "", reply: WELCOME }]);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [msgs]);

  useEffect(() => {
    if (open === false) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = (raw: string) => {
    const q = raw.trim();
    if (q.length === 0) return;
    const shown = q.length > 140 ? q.slice(0, 140) + "..." : q;
    setMsgs((m) => [...m, { who: "me", text: shown }, { who: "bot", text: "", reply: answer(q) }]);
    setText("");
  };

  return (
    <div className="bot">
      {open ? (
        <section className="bot__panel" role="dialog" aria-label="ScamShield assistant">
          <header className="bot__head">
            <span className="bot__title">ScamShield assistant</span>
            <button type="button" className="bot__close" onClick={() => setOpen(false)} aria-label="Close assistant">
              Close
            </button>
          </header>
          <div className="bot__log" role="log" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={m.who === "me" ? "bot__msg bot__msg--me" : "bot__msg"}>
                {m.reply ? <ReplyView reply={m.reply} /> : <p>{m.text}</p>}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="bot__chips">
            {CHIPS.map((c) => (
              <button key={c} type="button" className="bot__chip" onClick={() => send(c)}>
                {c}
              </button>
            ))}
          </div>
          <form
            className="bot__form"
            onSubmit={(e) => {
              e.preventDefault();
              send(text);
            }}
          >
            <label htmlFor="bot-input" className="sr-only">Describe what is happening or paste a message</label>
            <textarea
              id="bot-input"
              ref={inputRef}
              className="bot__input"
              rows={2}
              maxLength={MAX}
              value={text}
              placeholder="Describe the call, or paste a message"
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.shiftKey === false) {
                  e.preventDefault();
                  send(text);
                }
              }}
            />
            <button type="submit" className="bot__send">Send</button>
          </form>
          <p className="bot__note">Runs on your device. Rule based, so it can miss new tricks.</p>
        </section>
      ) : null}
      <button type="button" className="bot__fab" aria-expanded={open} onClick={() => setOpen(open === false)}>
        <Icon name="shield" size={22} />
        {open ? "Hide assistant" : "Ask ScamShield"}
      </button>
    </div>
  );
}
