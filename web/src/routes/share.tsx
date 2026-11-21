import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { parentMessage, safeBaseUrl, waLink } from "../engine/share.js";
import { Page, MAIN_HEADING_ID } from "../ui/chrome";
import { Icon } from "../ui/icons";
import { NewTab, useCopy } from "../ui/parts";

export const Route = createFileRoute("/share")({
  head: () => ({ meta: [{ title: "Send to family | ScamShield" }] }),
  component: SharePage,
});

function SharePage() {
  const [baseUrl, setBaseUrl] = useState("");
  const panelRef = useRef<HTMLParagraphElement>(null);
  const { state, copy } = useCopy();

  useEffect(() => {
    setBaseUrl(safeBaseUrl(window.location.origin + "/"));
  }, []);

  const message = parentMessage(baseUrl);

  return (
    <Page back={{ to: "/", label: "Start" }}>
      <h1 id={MAIN_HEADING_ID} tabIndex={-1}>
        Send these rules to family
      </h1>
      <p className="lead">This is the exact message. You choose who gets it in WhatsApp.</p>
      <p className="panel" ref={panelRef}>
        {message}
      </p>
      <div className="actions">
        <a className="btn btn--primary" href={waLink(message)} target="_blank" rel="noopener noreferrer">
          <Icon name="share" />
          Send on WhatsApp
          <NewTab />
        </a>
        <button type="button" className="btn btn--secondary" onClick={() => void copy(message, panelRef.current)}>
          <Icon name="copy" />
          Copy message
        </button>
      </div>
      <p className="copy-status" role="status">
        {state === "ok" ? "Copied. Paste it into any chat." : null}
        {state === "fail" ? "Copy did not work. Press and hold the text to copy it." : null}
      </p>
    </Page>
  );
}
