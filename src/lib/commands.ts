import { SECTIONS, WHATSAPP_URL, BOOKING_URL, EMAIL, sectionHref } from "./site";

export type CommandGroup = "Go to" | "Case studies" | "Contact" | "Display" | "Extras";
export type CommandAction = "copy-email" | "toggle-theme" | "toggle-motion" | "open-terminal";

export interface Command {
  id: string;
  group: CommandGroup;
  label: string;
  keywords: string[];
  href?: string;
  external?: boolean;
  action?: CommandAction;
}

const SECTION_KEYWORDS: Record<string, string[]> = {
  hero: ["top", "start", "home"],
  work: ["projects", "portfolio", "case studies"],
  services: ["pricing", "prices", "packages", "hire"],
  process: ["process", "steps", "payment"],
  about: ["bio", "me", "who"],
  lab: ["writing", "blog", "notes"],
  contact: ["message", "reach"],
};

/** Every palette command, in the order shown. Built at render time from site content. */
export function buildCommands({ pathname, work }: { pathname: string; work: { id: string; project: string }[] }): Command[] {
  return [
    ...SECTIONS.map((s): Command => ({
      id: `go-${s.id}`, group: "Go to", label: s.label, keywords: SECTION_KEYWORDS[s.id] ?? [], href: sectionHref(s.id, pathname),
    })),
    ...work.map((w): Command => ({
      id: `case-${w.id}`, group: "Case studies", label: w.project, keywords: ["work", "case study", "project"], href: `/work/${w.id}`,
    })),
    { id: "whatsapp", group: "Contact", label: "Chat on WhatsApp", keywords: ["wa", "message", "hire", "chat"], href: WHATSAPP_URL, external: true },
    { id: "book", group: "Contact", label: "Book a 15-min call", keywords: ["call", "meeting", "schedule", "booking"], href: BOOKING_URL },
    { id: "email", group: "Contact", label: "Email me", keywords: ["mail", "contact"], href: `mailto:${EMAIL}` },
    { id: "copy-email", group: "Contact", label: "Copy email address", keywords: ["mail", "clipboard"], action: "copy-email" },
    { id: "theme", group: "Display", label: "Switch to light theme", keywords: ["light", "dark", "theme", "colour", "color", "mode"], action: "toggle-theme" },
    { id: "motion", group: "Display", label: "Turn reduce motion on", keywords: ["animation", "motion", "accessibility"], action: "toggle-motion" },
    { id: "terminal", group: "Extras", label: "Open terminal", keywords: ["terminal", "console", "shell", "cli"], action: "open-terminal" },
  ];
}

/** Every query word must appear in the label or a keyword (case-insensitive). Empty query matches everything. */
export function matches(cmd: Command, query: string): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = [cmd.label, ...cmd.keywords].join(" ").toLowerCase();
  return words.every((w) => haystack.includes(w));
}
