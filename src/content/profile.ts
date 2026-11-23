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
  /** Three About paragraphs (diploma → BSc → agents). Drafted; `aboutDraft` stays true until Melvine approves. */
  about: string[];
  aboutDraft: boolean;
  /** Path to a photo in /public, or null until supplied. */
  photo: string | null;
  reassurance: string;
}

export const PROFILE: Profile = {
  headline: "WhatsApp AI agents for businesses that can't afford to miss a message.",
  subline: "I also build automations and web apps that save your team hours.",
  availability: { month: "December", slots: null, validUntil: "2026-12-31" },
  agentsShipped: null,
  clientQuote: null,
  cvUrl: null,
  about: [
    "I started with a Diploma in Software Engineering.",
    "I'm now studying for a BSc in Electronics & Computer Engineering at a university in Kenya.",
    "Today I build AI agents, automations and web apps: a daily opportunity finder that runs for $0 on free tiers, a room site for my own short-stay rentals in Juja, and Applaude, a testing platform I'm building. I'd like to build the same kind of thing for your business.",
  ],
  aboutDraft: false,
  photo: null,
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
