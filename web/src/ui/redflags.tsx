import { useState } from "react";
import { Icon, type IconName } from "./icons";

type Flag = { id: string; tab: string; icon: IconName; title: string; says: string; truth: string };

const FLAGS: Flag[] = [
  {
    id: "urgent",
    tab: "Pressure",
    icon: "alert-triangle",
    title: "They want you to act right now",
    says: "Your account will be blocked today. Pay within one hour or we will arrest you.",
    truth: "Real banks and officials give you time and written notice. Hurry is the scammer's main tool, because it stops you from thinking or asking anyone.",
  },
  {
    id: "secret",
    tab: "Secrecy",
    icon: "lock",
    title: "They tell you to keep it secret",
    says: "Do not tell anyone. Stay on the call. This case is confidential.",
    truth: "No genuine officer needs you to stay silent or stay on the line. Talking to family is the quickest way to break the spell.",
  },
  {
    id: "money",
    tab: "Money",
    icon: "rupee",
    title: "They ask you to send money to be safe",
    says: "Transfer the amount to a safe account for verification. It will be refunded.",
    truth: "There is no safe account. No bank, court or police station asks you to move money to protect it.",
  },
  {
    id: "code",
    tab: "Codes and apps",
    icon: "message",
    title: "They want a code, a link tap or an app",
    says: "Share the OTP to update your KYC. Install this app so we can help you.",
    truth: "An OTP is a key to your money. Nobody who works for a bank will ask for it. Screen share apps let a stranger see everything you do.",
  },
];

/** Tabbed explainer of the four red flags. Plain text, no data leaves the device. */
export function RedFlags() {
  const [active, setActive] = useState<Flag>(FLAGS[0]);
  return (
    <div className="flags">
      <div className="flags__tabs" role="group" aria-label="Choose a red flag">
        {FLAGS.map((f) => (
          <button
            key={f.id}
            type="button"
            className="flags__tab"
            aria-pressed={active.id === f.id}
            onClick={() => setActive(f)}
          >
            <Icon name={f.icon} size={20} />
            {f.tab}
          </button>
        ))}
      </div>
      <div className="flags__panel" aria-live="polite">
        <h3>{active.title}</h3>
        <p className="flags__says">
          <span className="flags__label">What they say</span>
          {active.says}
        </p>
        <p className="flags__truth">
          <span className="flags__label flags__label--ok">The truth</span>
          {active.truth}
        </p>
      </div>
    </div>
  );
}
