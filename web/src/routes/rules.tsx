import { createFileRoute, Link } from "@tanstack/react-router";
import { FAMILY_CODEWORD, FOUR_RULES } from "../engine/panic.js";
import { Page, MAIN_HEADING_ID } from "../ui/chrome";

export const Route = createFileRoute("/rules")({
  head: () => ({ meta: [{ title: "Four rules | ScamShield" }] }),
  component: RulesPage,
});

function RulesPage() {
  return (
    <Page back={{ to: "/", label: "Start" }}>
      <h1 id={MAIN_HEADING_ID} tabIndex={-1}>
        Four rules to remember
      </h1>
      <ol className="num-list">
        {FOUR_RULES.map((rule: string) => (
          <li key={rule}>{rule}</li>
        ))}
      </ol>

      <h2 id="code-word" tabIndex={-1}>
        {FAMILY_CODEWORD.title}
      </h2>
      <ol className="num-list num-list--small">
        {FAMILY_CODEWORD.steps.map((step: string) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <div className="actions">
        <Link to="/share" className="btn btn--primary">
          Send these rules to family
        </Link>
      </div>
      <p className="gap-top-lg">
        <Link to="/quiz" className="inline-tap">
          Test yourself: Spot the scam
        </Link>
      </p>
    </Page>
  );
}
