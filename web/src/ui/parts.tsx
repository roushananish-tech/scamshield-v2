import { Link } from "@tanstack/react-router";
import { useCallback, useState, type ReactNode } from "react";
import { Icon, type IconName } from "./icons";

export function ChoiceInner({ icon, title, sub }: { icon: IconName; title: string; sub?: string }) {
  return (
    <>
      <span className="icon-tile" aria-hidden="true">
        <Icon name={icon} size={28} />
      </span>
      <span className="choice__text">
        <span className="choice__title">{title}</span>
        {sub ? <span className="choice__sub">{sub}</span> : null}
      </span>
      <Icon name="chevron-right" className="choice__chev" />
    </>
  );
}

/** The three front-door choices, reused on the 404 page. */
export function FrontDoorCards() {
  return (
    <ul className="card-list card-list--front">
      <li>
        <Link to="/call" className="choice choice--danger">
          <ChoiceInner icon="phone" title="I am on a call right now" sub="Help while they are still on the line" />
        </Link>
      </li>
      <li>
        <Link to="/lost" className="choice">
          <ChoiceInner icon="rupee" title="I already lost money" sub="What to do first, in the right order" />
        </Link>
      </li>
      <li>
        <Link to="/check" className="choice">
          <ChoiceInner icon="message" title="Check a message" sub="Paste a text, WhatsApp or email" />
        </Link>
      </li>
    </ul>
  );
}

const OWNER: Record<string, { icon: IconName; label: string }> = {
  helpline: { icon: "phone", label: "Helpline" },
  bank: { icon: "bank", label: "Your bank" },
  portal: { icon: "globe", label: "Online report" },
  you: { icon: "person", label: "You" },
};

export function OwnerTag({ owner }: { owner: string }) {
  const o = OWNER[owner] ?? OWNER.you;
  return (
    <span className="tag">
      <Icon name={o.icon} size={18} />
      {o.label}
    </span>
  );
}

export function DoNowBadge() {
  return <span className="badge-now">Do now</span>;
}

export function StatusBox({ phase, label, message }: { phase: string; label: string; message: string }) {
  return (
    <div className={`status status--${phase}`} role="status">
      <p className="status__label">{label}</p>
      <p>{message}</p>
    </div>
  );
}

export function NewTab() {
  return <span className="sr-only"> (opens in a new tab)</span>;
}

/** External link that opens in a new tab and says so to screen readers. */
export function ExternalButton({ href, variant, icon, children }: {
  href: string;
  variant: "primary" | "secondary" | "danger";
  icon?: IconName;
  children: ReactNode;
}) {
  return (
    <a className={`btn btn--${variant}`} href={href} target="_blank" rel="noopener noreferrer">
      {icon ? <Icon name={icon} /> : null}
      {children}
      <NewTab />
    </a>
  );
}

/** Clipboard copy with a manual fallback: if the browser refuses, select the text. */
export function useCopy() {
  const [state, setState] = useState<"idle" | "ok" | "fail">("idle");
  const copy = useCallback(async (text: string, fallbackEl: HTMLElement | null) => {
    try {
      await navigator.clipboard.writeText(text);
      setState("ok");
    } catch {
      if (fallbackEl) window.getSelection()?.selectAllChildren(fallbackEl);
      setState("fail");
    }
  }, []);
  const reset = useCallback(() => setState("idle"), []);
  return { state, copy, reset };
}
