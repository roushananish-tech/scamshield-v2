import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { panicFor } from "../engine/panic.js";
import { Page, MAIN_HEADING_ID } from "../ui/chrome";

type Panic = {
  kind: string;
  label: string;
  headline: string;
  doNow: string[];
  theyWillSay: string[];
  afterwards: string[];
};

export const Route = createFileRoute("/call/$kind")({
  loader: ({ params }): Panic => {
    const p = panicFor(params.kind) as Panic | null;
    if (!p) throw redirect({ to: "/call" });
    return p;
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.headline} | ScamShield` : "On a call right now | ScamShield" }],
  }),
  component: CallCard,
});

function CallCard() {
  const p = Route.useLoaderData();
  return (
    <Page back={{ to: "/call", label: "Something else is happening" }} showCallLink={false}>
      <div className="band">
        <p className="band__label">{p.label}</p>
        <h1 id={MAIN_HEADING_ID} tabIndex={-1} className="call-headline">
          {p.headline}
        </h1>
      </div>

      <h2>Do this now</h2>
      <ol className="num-list">
        {p.doNow.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ol>

      <h2>They will say</h2>
      <p className="gap-top">If you hear any of these, it is the scam.</p>
      <ul className="bar-list">
        {p.theyWillSay.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <h2>Afterwards</h2>
      <ul className="plain-list">
        {p.afterwards.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <CallActions kind={p.kind} />
    </Page>
  );
}

function CallActions({ kind }: { kind: string }) {
  if (kind === "digital_arrest") {
    return (
      <div className="actions">
        <Link to="/lost/$incident" params={{ incident: "digital_arrest" }} className="btn btn--secondary">
          I already sent money
        </Link>
      </div>
    );
  }
  if (kind === "voice_clone") {
    return (
      <div className="actions">
        <Link to="/lost/$incident" params={{ incident: "upi_paid" }} className="btn btn--secondary">
          I already sent money
        </Link>
        <Link to="/rules" hash="code-word" className="btn btn--secondary">
          Set a family code word
        </Link>
      </div>
    );
  }
  if (kind === "bank_caller") {
    return (
      <div className="actions">
        <Link to="/lost/$incident" params={{ incident: "shared_code" }} className="btn btn--secondary">
          I already shared a code
        </Link>
      </div>
    );
  }
  if (kind === "remote_help") {
    return (
      <div className="actions">
        <Link to="/lost/$incident" params={{ incident: "remote_app" }} className="btn btn--primary">
          Open the remote-access steps
        </Link>
      </div>
    );
  }
  return null;
}
