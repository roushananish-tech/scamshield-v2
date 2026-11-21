import { createFileRoute, Link } from "@tanstack/react-router";
import { PANIC_KINDS, panicFor } from "../engine/panic.js";
import { Page, MAIN_HEADING_ID } from "../ui/chrome";
import { ChoiceInner } from "../ui/parts";
import type { IconName } from "../ui/icons";

const KIND_ICON: Record<string, IconName> = {
  digital_arrest: "shield",
  voice_clone: "person",
  bank_caller: "bank",
  remote_help: "alert-triangle",
};

export const Route = createFileRoute("/call/")({
  head: () => ({ meta: [{ title: "On a call right now | ScamShield" }] }),
  component: CallIndex,
});

function CallIndex() {
  return (
    <Page back={{ to: "/", label: "Start" }} showCallLink={false}>
      <h1 id={MAIN_HEADING_ID} tabIndex={-1} className="call-headline">
        You can end this call now.
      </h1>
      <p className="lead">It is safe to hang up. You can call back on a number you trust.</p>

      <h2>What is happening?</h2>
      <ul className="card-list">
        {PANIC_KINDS.map((kind: string) => (
          <li key={kind}>
            <Link to="/call/$kind" params={{ kind }} className="choice">
              <ChoiceInner icon={KIND_ICON[kind] ?? "phone"} title={panicFor(kind)?.label ?? kind} />
            </Link>
          </li>
        ))}
      </ul>

      <p className="gap-top-lg">
        Already sent money or shared a code?{" "}
        <Link to="/lost" className="inline-tap">
          Go to the lost-money steps
        </Link>
      </p>
    </Page>
  );
}
