// Security headers for every response, and a per-request nonce Content
// Security Policy for HTML.
//
// The page never needs the network after it loads: connect-src is 'none', so
// nothing a person types can be sent anywhere even by injected code.
//
// TanStack Start's server rendering emits inline <script> tags (hydration data).
// Each HTML response gets a fresh random nonce, stamped onto every <script> and
// <style> element, and only nonced inline code may run. No 'unsafe-inline'.
//
// frame-ancestors is deliberately absent: the hosting platform adds its own
// frame-ancestors policy for the Higgsfield editor preview, and browsers
// intersect multiple policies, so setting one here could only break that.

// Exact hash of the one static <style> block the Higgsfield design inspector
// injects at runtime (a crosshair cursor while the owner edits the site in
// the Higgsfield editor). It is only active inside that editor frame.
const DESIGN_INSPECTOR_STYLE_HASH = "'sha256-nsVpmXVEG4C6zMvrmgeInEAdsuVY7Glkxt/39BnCRaU='";

export function buildCsp(nonce: string): string {
  return [
    "default-src 'none'",
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'nonce-${nonce}' ${DESIGN_INSPECTOR_STYLE_HASH}`,
    "font-src 'self'",
    "img-src 'self' data:",
    "connect-src 'none'",
    "form-action 'none'",
    "base-uri 'none'",
    "manifest-src 'self'",
  ].join("; ");
}

function makeNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

type ElementHandler = { element(el: { setAttribute(name: string, value: string): void }): void };
type Rewriter = {
  on(selector: string, handler: ElementHandler): Rewriter;
  transform(response: Response): Response;
};
type RewriterCtor = new () => Rewriter;

function baseHeaders(source: Headers): Headers {
  const headers = new Headers(source);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  return headers;
}

export async function secureResponse(response: Response): Promise<Response> {
  const headers = baseHeaders(response.headers);
  const init = { status: response.status, statusText: response.statusText, headers };
  const type = headers.get("content-type") ?? "";
  if (!type.includes("text/html") || !response.body) {
    return new Response(response.body, init);
  }

  const nonce = makeNonce();
  headers.set("Content-Security-Policy", buildCsp(nonce));
  headers.delete("content-length");

  const Ctor = (globalThis as unknown as { HTMLRewriter?: RewriterCtor }).HTMLRewriter;
  if (typeof Ctor === "function") {
    const stamp: ElementHandler = {
      element(el) {
        el.setAttribute("nonce", nonce);
      },
    };
    return new Ctor().on("script", stamp).on("style", stamp).transform(new Response(response.body, init));
  }

  // Fallback for runtimes without HTMLRewriter (local Node dev server).
  const html = await response.text();
  const stamped = html.replace(/<(script|style)(?=[\s>])/gi, `<$1 nonce="${nonce}"`);
  return new Response(stamped, init);
}
