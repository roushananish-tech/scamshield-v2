import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import { analyzeMessage } from "../engine/analyze.js";
import { analyzeConversation } from "../engine/conversation.js";
import { recoveryFor } from "../engine/playbook.js";
import { safeBaseUrl, waLink, warnShare } from "../engine/share.js";
import { Page, MAIN_HEADING_ID } from "../ui/chrome";
import { Icon } from "../ui/icons";
import { NewTab } from "../ui/parts";

export const Route = createFileRoute("/check")({
  head: () => ({ meta: [{ title: "Check a message | ScamShield" }] }),
  component: CheckPage,
});

type Sender = "unsure" | "unknown" | "known";
type Signal = { id: string; kind: string; label: string; why: string; weight: number };
type Verdict = "low" | "suspicious" | "scam";

type TimelineItem = { stage: string; label: string; meaning: string; reachedAt: number | null };

type ViewResult = {
  verdict: Verdict;
  label: string;
  reasons: Signal[];
  advice: string[];
  truncated: boolean;
  shareSignals: { label: string; weight: number }[];
  thread: null | {
    stagesReached: number;
    inOrder: boolean;
    nextStep: string;
    timeline: TimelineItem[];
  };
};

// Answers to "Do you know who sent it?", the values analyze.js understands.
const SENDERS: { value: Sender; label: string }[] = [
  { value: "unsure", label: "Not sure" },
  { value: "unknown", label: "No, unknown sender" },
  { value: "known", label: "Yes, it appears to be someone I know" },
];

const ACTED_CHOICES: { value: string; label: string }[] = [
  { value: "clicked", label: "I opened the link" },
  { value: "replied", label: "I replied" },
  { value: "shared", label: "I shared a code or password" },
  { value: "installed", label: "I installed an app" },
  { value: "paid", label: "I sent money" },
];

// Conversation advice, carried over word for word from the original app.
const THREAD_ADVICE_LOW = [
  "No strong scam pattern found. If anything asks for money, codes or a login, verify through the official app first.",
];
const THREAD_ADVICE_RISK = [
  "Stop replying and do not send money, codes or install anything.",
  "Tell a family member or friend what is happening.",
  "Report it: sancharsaathi.gov.in. If money was lost, call 1930 or use cybercrime.gov.in.",
];

/** Reasons worth showing. A "no warning signs" result does not list weak hints. */
function pickReasons(signals: Signal[], verdict: Verdict): Signal[] {
  if (verdict === "low") return signals.filter((s) => s.weight >= 0.2);
  return signals.filter((s) => s.weight >= 0.1 || s.kind === "link");
}

function runCheck(text: string, sender: Sender, wholeChat: boolean): ViewResult {
  if (wholeChat) {
    const r = analyzeConversation(text, { sender, acted: "none" });
    const byId = new Map<string, Signal>();
    for (const m of r.messages as { result: { signals: Signal[] } }[]) {
      for (const s of m.result.signals) {
        const prev = byId.get(s.id);
        if (!prev || prev.weight < s.weight) byId.set(s.id, s);
      }
    }
    const all = [...byId.values()].sort((a, b) => b.weight - a.weight);
    const verdict = r.verdict as Verdict;
    return {
      verdict,
      label: r.label,
      reasons: pickReasons(all, verdict),
      advice: verdict === "low" ? THREAD_ADVICE_LOW : THREAD_ADVICE_RISK,
      truncated: false,
      shareSignals: all,
      thread: {
        stagesReached: r.stagesReached,
        inOrder: r.inOrder,
        nextStep: r.nextStep,
        timeline: r.timeline as TimelineItem[],
      },
    };
  }
  const r = analyzeMessage(text, { sender, acted: "none" });
  const verdict = r.verdict as Verdict;
  const signals = r.signals as Signal[];
  return {
    verdict,
    label: r.label,
    reasons: pickReasons(signals, verdict),
    advice: r.advice as string[],
    truncated: r.truncated,
    shareSignals: signals,
    thread: null,
  };
}

function CheckPage() {
  const [text, setText] = useState("");
  const [sender, setSender] = useState<Sender>("unsure");
  const [wholeChat, setWholeChat] = useState(false);
  const [error, setError] = useState(false);
  const [result, setResult] = useState<ViewResult | null>(null);
  const [acted, setActed] = useState<Set<string>>(() => new Set());
  const [baseUrl, setBaseUrl] = useState("");
  const [focusTo, setFocusTo] = useState<"verdict" | "input" | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const verdictRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setBaseUrl(safeBaseUrl(window.location.origin + "/"));
  }, []);

  useEffect(() => {
    if (focusTo === "verdict") verdictRef.current?.focus();
    if (focusTo === "input") inputRef.current?.focus();
    if (focusTo) setFocusTo(null);
  }, [focusTo]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError(true);
      inputRef.current?.focus();
      return;
    }
    setError(false);
    setActed(new Set());
    setResult(runCheck(text, sender, wholeChat));
    setFocusTo("verdict");
  };

  const reset = () => {
    setText("");
    setSender("unsure");
    setWholeChat(false);
    setError(false);
    setActed(new Set());
    setResult(null);
    setFocusTo("input");
  };

  const toggleActed = (value: string) =>
    setActed((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });

  if (result) {
    return (
      <Page back={{ to: "/", label: "Start" }}>
        <ResultView
          result={result}
          verdictRef={verdictRef}
          acted={acted}
          onToggleActed={toggleActed}
          baseUrl={baseUrl}
          onReset={reset}
        />
      </Page>
    );
  }

  return (
    <Page back={{ to: "/", label: "Start" }}>
      <h1 id={MAIN_HEADING_ID} tabIndex={-1}>
        Check a message
      </h1>
      <noscript>
        <p className="noscript">Turn on JavaScript to use this. The call and lost-money steps work without it.</p>
      </noscript>

      <form className="form" onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor="message">Paste the message here</label>
          <span className="hint" id="message-hint">
            Copy it from SMS, WhatsApp or email. Do not tap any link in it.
          </span>
          <textarea
            id="message"
            ref={inputRef}
            className="input"
            rows={6}
            maxLength={20000}
            spellCheck={false}
            autoComplete="off"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error && e.target.value.trim()) setError(false);
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "message-hint message-error" : "message-hint"}
          />
          {error ? (
            <p className="field-error" id="message-error" role="alert">
              <Icon name="alert-triangle" size={20} />
              Paste a message first.
            </p>
          ) : null}
        </div>

        <div className="field">
          <fieldset>
            <legend>Do you know who sent it? (optional)</legend>
            <div className="radio-row">
              {SENDERS.map((s) => (
                <label key={s.value} className="radio-chip">
                  <input
                    type="radio"
                    name="sender"
                    value={s.value}
                    checked={sender === s.value}
                    onChange={() => setSender(s.value)}
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <label className="check-row">
          <input type="checkbox" checked={wholeChat} onChange={(e) => setWholeChat(e.target.checked)} />
          This is a whole chat, not one message
        </label>

        <div>
          <button type="submit" className="btn btn--primary">
            Check this message
          </button>
        </div>
      </form>
    </Page>
  );
}

function ResultView({
  result,
  verdictRef,
  acted,
  onToggleActed,
  baseUrl,
  onReset,
}: {
  result: ViewResult;
  verdictRef: RefObject<HTMLHeadingElement | null>;
  acted: Set<string>;
  onToggleActed: (value: string) => void;
  baseUrl: string;
  onReset: () => void;
}) {
  const variant = result.verdict === "scam" ? "scam" : result.verdict === "suspicious" ? "caution" : "low";
  const headline = result.verdict === "low" ? "No warning signs found" : result.label;
  const shareText =
    result.verdict === "low" ? null : warnShare({ verdict: result.verdict, signals: result.shareSignals }, baseUrl);

  return (
    <>
      <section className={`verdict verdict--${variant}`} aria-labelledby={MAIN_HEADING_ID}>
        <Icon name={variant === "low" ? "info" : "alert-triangle"} size={48} />
        <h1 id={MAIN_HEADING_ID} ref={verdictRef} tabIndex={-1} className="verdict__headline">
          {headline}
        </h1>
        {variant === "low" ? (
          <p className="verdict__note">
            This checker can miss new tricks. If a message asks for money, a code or an app, check with someone you
            trust first.
          </p>
        ) : null}
      </section>

      {result.truncated ? <p className="muted gap-top">Only the first 5,000 characters were checked.</p> : null}

      {result.thread ? (
        <>
          <h2>How far the scam script has gone</h2>
          <p className="gap-top">
            {result.thread.stagesReached} of 5 stages seen
            {result.thread.stagesReached >= 2
              ? result.thread.inOrder
                ? ", in the typical order."
                : ", not in the typical order."
              : "."}
          </p>
          <ol className="timeline">
            {result.thread.timeline.map((t) => (
              <li key={t.stage} className={t.reachedAt !== null ? "is-seen" : undefined}>
                <strong>{t.label}</strong>: {t.reachedAt !== null ? `seen at message ${t.reachedAt}` : "not seen"}.{" "}
                <span className="muted">{t.meaning}</span>
              </li>
            ))}
          </ol>
          <p className="gap-top">
            <strong>{result.thread.nextStep}</strong>
          </p>
        </>
      ) : null}

      {result.reasons.length > 0 ? (
        <>
          <h2>Warning signs</h2>
          <ul className="reasons">
            {result.reasons.map((s) => (
              <li key={s.id}>
                <strong>{s.label}</strong>
                <p>{s.why}</p>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <h2>What to do</h2>
      <ul className="plain-list">
        {result.advice.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>

      <h2>Did you already do any of these?</h2>
      <p className="gap-top">Tap any that apply.</p>
      <div className="toggles">
        {ACTED_CHOICES.map((c) => {
          const on = acted.has(c.value);
          return (
            <button
              key={c.value}
              type="button"
              className="toggle"
              aria-pressed={on}
              onClick={() => onToggleActed(c.value)}
            >
              <span className="toggle__box" aria-hidden="true">
                {on ? <Icon name="check" size={16} /> : null}
              </span>
              {c.label}
            </button>
          );
        })}
      </div>

      {ACTED_CHOICES.filter((c) => acted.has(c.value)).map((c) => {
        const rec = recoveryFor(c.value) as { title: string; steps: string[] } | null;
        if (!rec) return null;
        return (
          <section key={c.value} className="recovery" aria-labelledby={`rec-${c.value}`}>
            <h3 id={`rec-${c.value}`}>{rec.title}</h3>
            <ol className="plain-list">
              {rec.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            {c.value === "paid" ? (
              <div className="actions">
                <Link to="/lost/$incident" params={{ incident: "upi_paid" }} className="btn btn--danger">
                  Open the full lost-money steps
                </Link>
              </div>
            ) : null}
          </section>
        );
      })}

      {shareText ? (
        <>
          <div className="actions">
            <a className="btn btn--primary" href={waLink(shareText)} target="_blank" rel="noopener noreferrer">
              <Icon name="share" />
              Warn someone on WhatsApp
              <NewTab />
            </a>
          </div>
          <p className="muted hint-under">Sends the warning signs only. Your message is not included.</p>
          <details>
            <summary>See what will be sent</summary>
            <p className="panel">{shareText}</p>
          </details>
        </>
      ) : null}

      <div className="actions">
        <button type="button" className="btn btn--secondary" onClick={onReset}>
          Check another message
        </button>
      </div>
    </>
  );
}
