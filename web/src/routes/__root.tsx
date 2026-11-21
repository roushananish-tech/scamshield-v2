import { HeadContent, Outlet, Scripts, createRootRoute, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";

import appCss from "../styles.css?url";
// Page metadata (title, description, og:image, favicon) committed in
// app-meta.json and read at BUILD time; there is no runtime fetch.
import appMetaJson from "../app-meta.json";
import { Page, MAIN_HEADING_ID } from "../ui/chrome";
import { FrontDoorCards } from "../ui/parts";

declare const __HF_DESIGN_INSPECTOR__: boolean;

type AppMeta = {
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  favicon_url?: string | null;
};

const appMeta = appMetaJson as AppMeta;

const TITLE = appMeta.og_title ?? "ScamShield: help with scam messages and calls";
const DESCRIPTION =
  appMeta.og_description ??
  "Check a suspicious message, get help during a scam call, or see what to do first after losing money. Everything runs on your device.";

// Favicon lives in this app's own public folder. A higgsfield-app absolute URL
// is reduced to its path so it always resolves against the serving host.
function ownAsset(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.startsWith("/")) return value;
  try {
    const u = new URL(value);
    if (u.hostname === "higgsfield.app" || u.hostname.endsWith(".higgsfield.app")) return u.pathname;
    return value;
  } catch {
    return null;
  }
}

const OG_IMAGE = appMeta.og_image_url ?? null;
const FAVICON = ownAsset(appMeta.favicon_url) ?? "/favicon.svg";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "theme-color", content: "#123A8C" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "ScamShield" },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: OG_IMAGE ? "summary_large_image" : "summary" },
      ...(OG_IMAGE
        ? [
            { property: "og:image", content: OG_IMAGE },
            { name: "twitter:image", content: OG_IMAGE },
          ]
        : []),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: FAVICON, type: "image/svg+xml" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundPage,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const location = useRouterState({ select: (s) => s.location });
  const firstLoad = useRef(true);

  // Move focus to the new view's main heading on every client-side route
  // change, but never on the first page load. A #hash target wins.
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    const target =
      (location.hash ? document.getElementById(location.hash) : null) ??
      document.getElementById(MAIN_HEADING_ID);
    target?.focus();
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!__HF_DESIGN_INSPECTOR__) return;
    void import("../module/design-inspector/runtime")
      .then(({ installHiggsfieldDesignInspector }) => installHiggsfieldDesignInspector())
      .catch(() => undefined);
  }, []);

  return <Outlet />;
}

function NotFoundPage() {
  return (
    <Page>
      <h1 id={MAIN_HEADING_ID} tabIndex={-1}>
        This page does not exist
      </h1>
      <FrontDoorCards />
    </Page>
  );
}
