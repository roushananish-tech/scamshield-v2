import { createFileRoute, Link } from "@tanstack/react-router";
import { INCIDENTS, INCIDENT_IDS } from "../engine/lostMoney.js";
import { Page, MAIN_HEADING_ID } from "../ui/chrome";
import { ChoiceInner } from "../ui/parts";
import { Icon, type IconName } from "../ui/icons";
import { TEL_1930 } from "../lib/links";

const INCIDENT_ICON: Record<string, IconName> = {
  upi_paid: "rupee",
  card_misused: "bank",
  shared_code: "lock",
  remote_app: "phone",
  investment: "globe",
  digital_arrest: "shield",
  loan_threat: "alert-triangle",
  whatsapp_taken: "message",
};

export const Route = createFileRoute("/lost/")({
  head: () => ({ meta: [{ title: "I lost money | ScamShield" }] }),
  component: LostIndex,
});

function LostIndex() {
  return (
    <Page back={{ to: "/", label: "Start" }}>
      <h1 id={MAIN_HEADING_ID} tabIndex={-1}>
        What happened?
      </h1>
      <p className="lead">Pick the closest one. The steps come in the order that matters.</p>

      <div className="strip">
        <p>
          <strong>If money has left your account, call 1930 now.</strong>
        </p>
        <p>Free national cyber-fraud helpline, open all day.</p>
        <a className="btn btn--danger" href={TEL_1930} aria-label="Call 1930, the national cyber-fraud helpline">
          <Icon name="phone" />
          Call 1930
        </a>
      </div>

      <ul className="card-list gap-top-lg">
        {INCIDENT_IDS.map((id: string) => (
          <li key={id}>
            <Link to="/lost/$incident" params={{ incident: id }} className="choice">
              <ChoiceInner
                icon={INCIDENT_ICON[id] ?? "rupee"}
                title={INCIDENTS[id as keyof typeof INCIDENTS].label}
              />
            </Link>
          </li>
        ))}
      </ul>
    </Page>
  );
}
