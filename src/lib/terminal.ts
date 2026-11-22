/**
 * The palette's terminal easter egg. Pure: takes the typed command plus site data, returns lines to print.
 * Every word it prints comes from existing site content (see src/components/Terminal.astro), never new claims.
 */
export interface TerminalData {
  name: string;
  oneLiner: string;
  proof: string[];
  timezone: string;
  work: { project: string; status: string; href: string }[];
  services: { name: string; local: string; international: string }[];
  whatsapp: string;
  email: string;
  booking: string;
}

export type Segment = { text: string; href?: string };
export type Line = Segment[];
export type Effect = "clear" | "exit" | "toggle-theme" | "toggle-motion";
export interface Result { lines: Line[]; effect?: Effect }

const t = (text: string): Line => [{ text }];

const HELP: [string, string][] = [
  ["help", "list commands"],
  ["whoami", "who I am"],
  ["projects", "selected work"],
  ["hire", "services and starting prices"],
  ["contact", "WhatsApp, email and booking"],
  ["theme", "switch light/dark"],
  ["motion", "turn reduce motion on/off"],
  ["clear", "clear the screen"],
  ["exit", "back to the menu"],
];

export function runCommand(input: string, data: TerminalData, audience: "local" | "international"): Result {
  const cmd = input.trim().toLowerCase();
  switch (cmd) {
    case "":
      return { lines: [] };
    case "help":
      return { lines: HELP.map(([c, d]) => t(`${c.padEnd(9)} ${d}`)) };
    case "whoami":
      return { lines: [t(`${data.name}. ${data.oneLiner}`), ...data.proof.map(t), t(`Based in Kenya, ${data.timezone}.`)] };
    case "projects":
      return { lines: data.work.map((w) => [{ text: w.project, href: w.href }, { text: `  ${w.status}` }]) };
    case "hire": {
      const quote: Line = audience === "local"
        ? [{ text: "Get a quote in 24h: " }, { text: "Chat on WhatsApp", href: data.whatsapp }]
        : [{ text: "Get a quote in 24h: " }, { text: "Email me", href: `mailto:${data.email}` }];
      return { lines: [...data.services.map((s) => t(`${s.name}: From ${audience === "local" ? s.local : s.international}`)), quote] };
    }
    case "contact":
      return {
        lines: [
          [{ text: "WhatsApp: " }, { text: "Chat on WhatsApp", href: data.whatsapp }],
          [{ text: "Email: " }, { text: data.email, href: `mailto:${data.email}` }],
          [{ text: "Call: " }, { text: "Book a 15-min call", href: data.booking }],
        ],
      };
    case "theme":
      return { lines: [t("Theme switched.")], effect: "toggle-theme" };
    case "motion":
      return { lines: [t("Motion setting switched.")], effect: "toggle-motion" };
    case "clear":
      return { lines: [], effect: "clear" };
    case "exit":
      return { lines: [], effect: "exit" };
    default:
      return { lines: [t(`command not found: ${cmd}. Type help.`)] };
  }
}
