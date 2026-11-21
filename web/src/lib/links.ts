// The only place the interface builds outbound addresses. Hosts come from the
// engine's constants (PORTAL, COMM_PORTAL, HELPLINE); nothing else is linked.
import { HELPLINE } from "../engine/lostMoney.js";

export const TEL_1930 = `tel:${HELPLINE}`;

/** Official portal address from an engine host constant, e.g. "cybercrime.gov.in". */
export function portalHref(host: string): string {
  return `https://${host}/`;
}
