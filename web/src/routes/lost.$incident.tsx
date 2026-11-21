import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState } from "react";
import {
  buildPlan,
  buildSummary,
  COMM_PORTAL,
  inr,
  minutesSince,
  PORTAL,
  urgencyNote,
} from "../engine/lostMoney.js";
import { Page, MAIN_HEADING_ID } from "../ui/chrome";
import { DoNowBadge, ExternalButton, OwnerTag, StatusBox, useCopy } from "../ui/parts";
import { Icon } from "../ui/icons";
import { portalHref, TEL_1930 } from "../lib/links";

type Step = { n: number; id: string; title: string; detail: string; owner: string; urgent: boolean };
type Plan = { id: string; label: string; reassure: string; steps: Step[]; disclaimer: string };

export const Route = createFileRoute("/lost/$incident")({
  loader: ({ params }): Plan => {
    const plan = buildPlan(params.incident) as Plan | null;
    if (!plan) throw redirect({ to: "/lost" });
    return plan;
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.label} | ScamShield` : "I lost money | ScamShield" }],
  }),
  component: PlanPage,
});

function PlanPage() {
  const plan = Route.useLoaderData();
  const [done, setDone] = useState<Set<string>>(() => new Set());

  const toggle = (id: string) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <Page back={{ to: "/lost", label: "All situations" }}>
      <h1 id={MAIN_HEADING_ID} tabIndex={-1}>
        {plan.label}
      </h1>
      <p className="reassure">{plan.reassure}</p>

      <h2>Your steps</h2>
      <ol className="steps">
        {plan.steps.map((s) => (
          <li key={s.id}>
            <StepCard step={s} done={done.has(s.id)} onToggle={() => toggle(s.id)} />
          </li>
        ))}
      </ol>
      <p className="muted gap-top">Ticks are not saved. They clear when you close this page.</p>
      <p className="disclaimer">
        <Icon name="info" size={20} />
        <span>{plan.disclaimer}</span>
      </p>

      <DetailsForm incident={plan.id} />

      <div className="actions">
        <Link to="/lost" className="btn btn--secondary">
          Back to all situations
        </Link>
      </div>
    </Page>
  );
}

function StepCard({ step, done, onToggle }: { step: Step; done: boolean; onToggle: () => void }) {
  const checkId = useId();
  return (
    <div className="step">
      <div className="step__head">
        <span className="step__num" aria-hidden="true">
          {step.n}
        </span>
        <h3 className="step__title">
          <span className="sr-only">Step {step.n}: </span>
          {step.title}
          {done ? (
            <span className="done-mark">
              <Icon name="check" size={18} />
              Done
            </span>
          ) : null}
        </h3>
      </div>
      <div className="tags">
        <OwnerTag owner={step.owner} />
        {step.urgent ? <DoNowBadge /> : null}
      </div>
      <p className="step__detail">{step.detail}</p>
      {step.owner === "helpline" ? (
        <a className="btn btn--danger" href={TEL_1930} aria-label="Call 1930, the national cyber-fraud helpline">
          <Icon name="phone" />
          Call 1930
        </a>
      ) : null}
      {step.detail.includes(PORTAL) ? (
        <ExternalButton href={portalHref(PORTAL)} variant="secondary" icon="globe">
          Open {PORTAL}
        </ExternalButton>
      ) : null}
      {step.detail.includes(COMM_PORTAL) ? (
        <ExternalButton href={portalHref(COMM_PORTAL)} variant="secondary" icon="globe">
          Open {COMM_PORTAL}
        </ExternalButton>
      ) : null}
      <label className="check-row" htmlFor={checkId}>
        <input id={checkId} type="checkbox" checked={done} onChange={onToggle} />
        Done
      </label>
    </div>
  );
}

// ---- "Get your details ready" ----------------------------------------------

type Fields = {
  when: string;
  amount: string;
  bank: string;
  txnIds: string;
  paidTo: string;
  scammerContact: string;
  how: string;
  bankComplaintNo: string;
  calledBankAt: string;
};

const EMPTY: Fields = {
  when: "",
  amount: "",
  bank: "",
  txnIds: "",
  paidTo: "",
  scammerContact: "",
  how: "",
  bankComplaintNo: "",
  calledBankAt: "",
};

// buildSummary's "missing" names, mapped to the labels people see on this page.
const MISSING_LABEL: Record<string, string> = {
  "Amount lost": "How much money was taken?",
  "Date and time": "When did it happen?",
  "Your bank or wallet": "Which bank, card or UPI app was it sent from?",
  "Transaction ID / UTR": "Transaction ID or UTR",
  "Who the money went to (UPI ID, account number or phone)": "Who did the money go to?",
};

/** datetime-local value ("2026-11-21T10:30") to "21 Nov 2026, 10:30 am" for the summary text. */
function readableDateTime(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (!Number.isFinite(d.getTime())) return value;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function localInputMax(nowMs: number): string {
  const d = new Date(nowMs);
  return new Date(nowMs - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function amountEcho(raw: string): string | null {
  const digits = raw.replace(/[,\s]|rs\.?|inr|₹/gi, "");
  if (!/^\d+(\.\d{1,2})?$/.test(digits)) return null;
  const n = Number(digits);
  return n > 0 && n < 1e12 ? inr(n) : null;
}

function DetailsForm({ incident }: { incident: string }) {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [summary, setSummary] = useState<{ text: string; missing: string[] } | null>(null);
  const panelRef = useRef<HTMLPreElement>(null);
  const { state: copyState, copy, reset } = useCopy();
  const ids = {
    when: useId(),
    amount: useId(),
    bank: useId(),
    txnIds: useId(),
    paidTo: useId(),
    scammerContact: useId(),
    how: useId(),
    bankComplaintNo: useId(),
    calledBankAt: useId(),
  };

  // Clock for the urgency note: set after load, refreshed once a minute.
  useEffect(() => {
    setNowMs(Date.now());
    const t = window.setInterval(() => setNowMs(Date.now()), 60000);
    return () => window.clearInterval(t);
  }, []);

  // The summary is built in the browser only, from what the person typed.
  useEffect(() => {
    setSummary(
      buildSummary({
        incident,
        amount: fields.amount,
        when: readableDateTime(fields.when),
        bank: fields.bank,
        txnIds: fields.txnIds
          .split("\n")
          .map((t) => t.trim())
          .filter(Boolean),
        paidTo: fields.paidTo,
        scammerContact: fields.scammerContact,
        how: fields.how,
        bankComplaintNo: fields.bankComplaintNo,
        calledBankAt: readableDateTime(fields.calledBankAt),
      }),
    );
    reset();
  }, [fields, incident, reset]);

  const set = (key: keyof Fields) => (e: { target: { value: string } }) =>
    setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const minutes = nowMs !== null && fields.when ? minutesSince(fields.when, nowMs) : null;
  const note = urgencyNote(minutes);
  const max = nowMs !== null ? localInputMax(nowMs) : undefined;
  const echo = amountEcho(fields.amount);

  return (
    <section aria-labelledby="details-h">
      <h2 id="details-h">Get your details ready</h2>
      <p className="gap-top">
        1930 and your bank will ask for these. Fill in what you know and leave the rest blank. Nothing here is sent or
        saved.
      </p>

      <form className="form" onSubmit={(e) => e.preventDefault()} noValidate>
        <div className="field">
          <label htmlFor={ids.when}>When did it happen?</label>
          <span className="hint" id={`${ids.when}-hint`}>
            Your best guess is fine.
          </span>
          <input
            id={ids.when}
            className="input"
            type="datetime-local"
            max={max}
            value={fields.when}
            onChange={set("when")}
            aria-describedby={`${ids.when}-hint`}
          />
          <StatusBox phase={note.phase} label={note.label} message={note.message} />
        </div>

        <div className="field">
          <label htmlFor={ids.amount}>How much money was taken?</label>
          <span className="hint" id={`${ids.amount}-hint`}>
            In rupees, numbers only. Leave blank if no money left your account.
          </span>
          <input
            id={ids.amount}
            className="input"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={fields.amount}
            onChange={set("amount")}
            aria-describedby={`${ids.amount}-hint`}
          />
          {echo ? <p className="field-note">You entered {echo}</p> : null}
        </div>

        <TextField
          id={ids.bank}
          label="Which bank, card or UPI app was it sent from?"
          hint="For example: SBI, HDFC card, PhonePe"
          value={fields.bank}
          onChange={set("bank")}
        />

        <div className="field">
          <label htmlFor={ids.txnIds}>Transaction ID or UTR</label>
          <span className="hint" id={`${ids.txnIds}-hint`}>
            Find it in your payment app or the bank SMS. Put each one on a new line.
          </span>
          <textarea
            id={ids.txnIds}
            className="input"
            rows={3}
            spellCheck={false}
            autoComplete="off"
            value={fields.txnIds}
            onChange={set("txnIds")}
            aria-describedby={`${ids.txnIds}-hint`}
          />
        </div>

        <TextField
          id={ids.paidTo}
          label="Who did the money go to?"
          hint="The UPI ID, account number or name shown in your app"
          value={fields.paidTo}
          onChange={set("paidTo")}
        />
        <TextField
          id={ids.scammerContact}
          label="How did they contact you?"
          hint="Their phone number, WhatsApp number, link or app name"
          value={fields.scammerContact}
          onChange={set("scammerContact")}
        />

        <div className="field">
          <label htmlFor={ids.how}>What happened, in your own words</label>
          <span className="hint" id={`${ids.how}-hint`}>
            A few lines is enough.
          </span>
          <textarea
            id={ids.how}
            className="input"
            rows={4}
            value={fields.how}
            onChange={set("how")}
            aria-describedby={`${ids.how}-hint`}
          />
        </div>

        <TextField
          id={ids.bankComplaintNo}
          label="Bank complaint number"
          hint="The bank gives you this when you call. Leave blank if you have not called yet."
          value={fields.bankComplaintNo}
          onChange={set("bankComplaintNo")}
        />

        <div className="field">
          <label htmlFor={ids.calledBankAt}>When did you call your bank?</label>
          <input
            id={ids.calledBankAt}
            className="input"
            type="datetime-local"
            max={max}
            value={fields.calledBankAt}
            onChange={set("calledBankAt")}
          />
        </div>
      </form>

      <h3 className="gap-top-lg">Your summary</h3>
      <pre className="panel" ref={panelRef}>
        {summary?.text ?? ""}
      </pre>
      <div className="actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => void copy(summary?.text ?? "", panelRef.current)}
        >
          <Icon name="copy" />
          Copy summary
        </button>
      </div>
      <p className="copy-status" role="status">
        {copyState === "ok" ? "Copied. Paste it when 1930, your bank or the website asks." : null}
        {copyState === "fail" ? "Copy did not work. Press and hold the text to copy it." : null}
      </p>

      {summary && summary.missing.length > 0 ? (
        <>
          <h3 className="gap-top-lg">You will be asked for:</h3>
          <ul className="plain-list">
            {summary.missing.map((m) => (
              <li key={m}>{MISSING_LABEL[m] ?? m}</li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}

function TextField({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (e: { target: { value: string } }) => void;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <span className="hint" id={`${id}-hint`}>
        {hint}
      </span>
      <input
        id={id}
        className="input"
        type="text"
        autoComplete="off"
        value={value}
        onChange={onChange}
        aria-describedby={`${id}-hint`}
      />
    </div>
  );
}
