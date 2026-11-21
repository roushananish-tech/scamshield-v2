import { useState } from "react";
import { analyzeMessage } from "../engine/analyze.js";
import { Icon } from "./icons";

type Example = { id: string; label: string; from: string; text: string };
type Signal = { id: string; kind: string; label: string; why: string; weight: number };
type Verdict = "low" | "suspicious" | "scam";
type Result = { verdict: Verdict; label: string; signals: Signal[] };

// Sample messages written for this demo. None of them is a real message.
const EXAMPLES: Example[] = [
  {
    id: "kyc",
    label: "Bank KYC text",
    from: "SMS from an unknown number",
    text: "Dear customer your SBI KYC expires today. Update now at sbi-kyc-update.in or your account will be blocked. Share the OTP with our officer to complete.",
  },
  {
    id: "arrest",
    label: "Digital arrest",
    from: "WhatsApp from an unknown number",
    text: "This is Mumbai Cyber Crime Branch. A parcel in your name has drugs. You are under digital arrest. Do not tell anyone. Transfer Rs 95,000 for verification or we will arrest you today.",
  },
  {
    id: "real",
    label: "Real bank alert",
    from: "SMS from your bank",
    text: "Rs 2,450 debited from your account XX4417 on 21-11-26 via UPI to Swiggy. Not you? Call the number on the back of your card.",
  },
];

/** Home page demo: runs the real checker on sample messages, on this device. */
export function LiveDemo() {
  const [active, setActive] = useState<Example>(EXAMPLES[0]);
  const [result, setResult] = useState<Result | null>(null);

  const run = () => {
    const r = analyzeMessage(active.text, { sender: "unsure", acted: "none" }) as unknown as Result;
    setResult({
      verdict: r.verdict,
      label: r.label,
      signals: r.verdict === "low" ? [] : r.signals.filter((s) => s.weight >= 0.1).slice(0, 3),
    });
  };

  const variant = result ? (result.verdict === "scam" ? "scam" : result.verdict === "suspicious" ? "caution" : "low") : null;

  return (
    <div className="demo-card">
      <p className="demo-label" id="demo-pick">Pick an example</p>
      <div className="demo-tabs" role="group" aria-labelledby="demo-pick">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.id}
            type="button"
            className="demo-tab"
            aria-pressed={active.id === ex.id}
            onClick={() => {
              setActive(ex);
              setResult(null);
            }}
          >
            {ex.label}
          </button>
        ))}
      </div>
      <div className="demo-phone">
        <p className="demo-from">{active.from}</p>
        <p className="demo-bubble">{active.text}</p>
      </div>
      <div className="demo-run">
        <button type="button" className="btn btn--primary" onClick={run}>
          <Icon name="shield" />
          Check this message
        </button>
      </div>
      <div aria-live="polite">
        {result && variant ? (
          <div className={`demo-result demo-result--${variant}`}>
            <span className={`verdict-pill verdict-pill--${variant}`}>
              <Icon name={variant === "low" ? "check" : "alert-triangle"} size={18} />
              {variant === "low" ? "No warning signs found" : result.label}
            </span>
            {result.signals.length > 0 ? (
              <ul className="demo-signs">
                {result.signals.map((s) => (
                  <li key={s.id}>
                    <Icon name="alert-triangle" size={20} />
                    <span>
                      <strong>{s.label}</strong>
                      <span className="demo-why">{s.why}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="demo-note">
                This checker can miss new tricks. If a message asks for money, a code or an app, check with someone you
                trust first.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
