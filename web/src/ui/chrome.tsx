import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Icon, ShieldMark } from "./icons";
import { NewTab } from "./parts";
import { Assistant } from "./assistant";
import { TEL_1930, portalHref } from "../lib/links";
import { PORTAL, COMM_PORTAL } from "../engine/lostMoney.js";

type BackTarget = "/" | "/call" | "/lost";

/** Heading that receives focus on view changes. Exactly one per view. */
export const MAIN_HEADING_ID = "main-heading";

export function Page({ children, back, showCallLink = true, wide = false }: {
  children: ReactNode;
  back?: { to: BackTarget; label: string };
  showCallLink?: boolean;
  /** Full-width page made of its own sections (the home page). */
  wide?: boolean;
}) {
  return (
    <>
      <a className="skip" href="#main">Skip to main content</a>
      <header className="site-header">
        <div className="wrap wrap--wide header-row">
          <Link to="/" className="brand" aria-label="ScamShield, go to start">
            <ShieldMark />
            <span>ScamShield</span>
          </Link>
          <nav className="top-nav" aria-label="Main">
            <Link to="/check" activeProps={{ className: "is-active" }}>Check a message</Link>
            <Link to="/lost" activeProps={{ className: "is-active" }}>Lost money</Link>
            <Link to="/quiz" activeProps={{ className: "is-active" }}>Spot the scam</Link>
            <Link to="/rules" activeProps={{ className: "is-active" }}>Four rules</Link>
          </nav>
          {showCallLink ? (
            <Link to="/call" className="call-chip">
              <Icon name="phone" size={20} />
              On a call?
            </Link>
          ) : null}
        </div>
      </header>
      {back ? (
        <nav className="wrap back-row" aria-label="Back">
          <Link to={back.to}>
            <Icon name="arrow-left" />
            {back.label}
          </Link>
        </nav>
      ) : null}
      <main id="main" className={wide ? "main main--wide" : "wrap main"} tabIndex={-1}>
        {children}
      </main>
      <Footer />
      {showCallLink ? <Assistant /> : null}
    </>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap wrap--wide footer-grid">
        <div>
          <Link to="/" className="brand" aria-label="ScamShield, go to start">
            <ShieldMark />
            <span>ScamShield</span>
          </Link>
          <p className="footer-lead">
            <Icon name="lock" size={20} />
            <span>Everything runs on this device. Nothing you type is sent or saved.</span>
          </p>
        </div>
        <div>
          <h2 className="footer-h">Get help now</h2>
          <ul className="footer-links">
            <li>
              <a href={TEL_1930} aria-label="Call 1930, the national cyber-fraud helpline">Call 1930, free, open all day</a>
            </li>
            <li>
              <a href={portalHref(PORTAL)} target="_blank" rel="noopener noreferrer">
                Report at {PORTAL}
                <NewTab />
              </a>
            </li>
            <li>
              <a href={portalHref(COMM_PORTAL)} target="_blank" rel="noopener noreferrer">
                Report a fraud call or SMS at {COMM_PORTAL}
                <NewTab />
              </a>
            </li>
            <li><Link to="/lost">Lost money steps</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="footer-h">Learn and share</h2>
          <ul className="footer-links">
            <li><Link to="/check">Check a message</Link></li>
            <li><Link to="/rules">Four rules</Link></li>
            <li><Link to="/quiz">Spot the scam</Link></li>
            <li><Link to="/share">Send to family</Link></li>
          </ul>
        </div>
      </div>
      <div className="wrap wrap--wide footer-base">
        <p>Guidance only, not legal advice. ScamShield is not a bank, the police or a government service.</p>
      </div>
    </footer>
  );
}
