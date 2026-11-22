/**
 * Every fact the site states about Melvine lives here.
 * `null` means "not supplied yet": the page then uses honest wording or leaves the item out. Never invent values.
 */
export interface Profile {
  headline: string;
  subline: string;
  /** `validUntil` (YYYY-MM-DD, EAT): after this day the badge hides itself so it never goes stale. */
  availability: { month: string; slots: number | null; validUntil: string };
  agentsShipped: number | null;
  clientQuote: { text: string; who: string } | null;
  cvUrl: string | null;
  reassurance: string;
}

export const PROFILE: Profile = {
  headline: "WhatsApp AI agents for businesses that can't afford to miss a message.",
  subline: "I also build automations and web apps that save your team hours.",
  availability: { month: "December", slots: null, validUntil: "2026-12-31" },
  agentsShipped: null,
  clientQuote: null,
  cvUrl: null,
  reassurance: "Replies within 12 hours · Pay via M-Pesa, Wise or Payoneer · Weekly progress demos",
};

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function badgeText(a: Pick<Profile["availability"], "month" | "slots">, tz: string): string {
  return a.slots === null
    ? `Booking projects for ${a.month} · ${tz}`
    : `Available for ${plural(a.slots, "project", "projects")} in ${a.month} · ${tz}`;
}

export function proofItems(p: Profile): string[] {
  const items = ["Diploma in Software Engineering", "BSc Electronics & Computer Engineering (in progress)"];
  if (p.agentsShipped !== null) items.push(`${plural(p.agentsShipped, "agent", "agents")} shipped`);
  return items;
}
