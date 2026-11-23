import type { Service } from "../content/services";
import { formatPrice, type Currency } from "./price";
import { whatsappUrlWithText } from "./site";

const BRACKETS: Record<Currency, [number, number]> = { KES: [50000, 100000], USD: [500, 1000] };
const PLACEHOLDER_SITE = /^https:\/\/example\.com\/?$/;

/** Budget choices for the contact form, starting at the cheapest "from" price for the visitor's audience. */
export function budgetOptions(audience: "local" | "international", services: Service[]): string[] {
  const prices = services.map((s) => s.price[audience]);
  const currency = prices[0].currency;
  const floor = Math.min(...prices.map((p) => p.amount));
  const [mid, top] = BRACKETS[currency];
  const f = (amount: number) => formatPrice({ amount, currency });
  const range = (a: number, b: number) => `${f(a)}–${f(b).replace(`${currency} `, "")}`;
  return ["Not sure yet", `Under ${f(floor)}`, range(floor, mid), range(mid, top), `Over ${f(top)}`];
}

/** WhatsApp link carrying everything typed into the form, so a lead is never lost. */
export function whatsappFallbackUrl(f: { name: string; contact: string; message: string; budget: string }): string {
  const text =
    `Hi Melvine, I saw your portfolio. I need: ${f.message} · Budget: ${f.budget || "___"} · Deadline: ___` +
    `\nName: ${f.name}\nContact: ${f.contact}`;
  return whatsappUrlWithText(text);
}

/** Build-time guard: the no-JS redirect must not point at the placeholder domain once the form is live. */
export function assertFormConfig(key: string | null, site: string | undefined): void {
  if (key && (!site || PLACEHOLDER_SITE.test(site))) {
    throw new Error(`WEB3FORMS_KEY is set but site is still ${site ?? "unset"}: set the real domain in astro.config.mjs first.`);
  }
}

/**
 * Server-rendered form attributes. With a key the form posts straight to Web3Forms (works without JavaScript,
 * redirecting to /thanks); without one it stays hidden until the WhatsApp-fallback script runs.
 */
export function formAttributes(key: string | null, site: string | undefined) {
  if (!key) return { hidden: true, action: undefined, method: undefined, redirect: undefined };
  return { hidden: false, action: "https://api.web3forms.com/submit", method: "post", redirect: new URL("/thanks", site).href };
}
