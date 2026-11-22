/**
 * Architecture diagrams drawn as PCB-style circuits: nodes sit on a grid, edges are orthogonal copper traces.
 * Labels may contain "\n" for a second line. `steps` is the visible text alternative (one per hop or more).
 */
export interface Cell { col: number; row: number }
export interface DiagramNode extends Cell { id: string; label: string; planned?: boolean }
export interface Diagram { title: string; nodes: DiagramNode[]; edges: [string, string][]; steps: string[] }
export type DiagramId = "luxe-condos" | "opportunity-finder" | "applaude";

export const CELL = { w: 200, h: 90 };
export const BOX = { w: 160, h: 52 };

const centre = (c: Cell, cell = CELL) => ({ x: c.col * cell.w + cell.w / 2, y: c.row * cell.h + cell.h / 2 });

/** Horizontal run first, then vertical: an L-shaped (or straight) trace between two cell centres. */
export function tracePath(a: Cell, b: Cell, cell = CELL): string {
  const p = centre(a, cell), q = centre(b, cell);
  let d = `M${p.x} ${p.y}`;
  if (q.x !== p.x) d += ` H${q.x}`;
  if (q.y !== p.y) d += ` V${q.y}`;
  return d;
}

/** Where the trace leaves the first box and enters the second, for drawing solder pads. */
export function endPads(a: Cell, b: Cell, cell = CELL, box = BOX): [{ x: number; y: number }, { x: number; y: number }] {
  const p = centre(a, cell), q = centre(b, cell);
  const start = q.x !== p.x
    ? { x: p.x + Math.sign(q.x - p.x) * (box.w / 2), y: p.y }
    : { x: p.x, y: p.y + Math.sign(q.y - p.y) * (box.h / 2) };
  const end = q.y !== p.y
    ? { x: q.x, y: q.y - Math.sign(q.y - p.y) * (box.h / 2) }
    : { x: q.x - Math.sign(q.x - p.x) * (box.w / 2), y: q.y };
  return [start, end];
}

const chain = (ids: string[]): [string, string][] => ids.slice(1).map((id, i) => [ids[i], id]);

export const DIAGRAMS: Record<DiagramId, Diagram> = {
  "luxe-condos": {
    title: "How a guest reaches Melvine through Luxe Condos",
    nodes: [
      { id: "guest", label: "Guest finds\na room", col: 0, row: 0 },
      { id: "site", label: "Room site", col: 1, row: 0 },
      { id: "wa", label: "WhatsApp chat", col: 1, row: 1 },
      { id: "agent", label: "AI agent\n(planned)", col: 0, row: 1, planned: true },
      { id: "melvine", label: "Melvine:\nbookings", col: 0, row: 2 },
    ],
    edges: chain(["guest", "site", "wa", "agent", "melvine"]),
    steps: [
      "A guest finds a room through a link shared on social media or WhatsApp Status.",
      "The room site shows photos, prices and availability.",
      "One tap opens a WhatsApp chat.",
      "Planned for January 2027: an AI agent answers the common questions.",
      "Bookings and anything the agent isn't sure about go to Melvine.",
    ],
  },
  "opportunity-finder": {
    title: "Opportunity Finder's daily pipeline",
    nodes: [
      { id: "sources", label: "Sources", col: 0, row: 0 },
      { id: "official", label: "Official page", col: 1, row: 0 },
      { id: "rules", label: "Eligibility +\nscam rules", col: 1, row: 1 },
      { id: "score", label: "Score 0–100", col: 0, row: 1 },
      { id: "db", label: "Supabase", col: 0, row: 2 },
      { id: "tg", label: "Telegram digest", col: 1, row: 2 },
      { id: "you", label: "You decide", col: 1, row: 3 },
    ],
    edges: chain(["sources", "official", "rules", "score", "db", "tg", "you"]),
    steps: [
      "Listings are collected from the source list and de-duplicated.",
      "Each one is followed to its official page; facts are read only from that page.",
      "Eligibility and scam rules filter the list.",
      "Each item gets a score from 0 to 100.",
      "Results are stored in Supabase.",
      "A Telegram digest arrives at 07:00 EAT with Apply, Save and Skip buttons.",
      "A person makes every decision and does every final submit.",
    ],
  },
  applaude: {
    title: "What Applaude checks",
    nodes: [
      { id: "app", label: "Your app", col: 0, row: 0 },
      { id: "ui", label: "UI checks", col: 1, row: 0 },
      { id: "api", label: "API checks", col: 1, row: 1 },
      { id: "db", label: "Database\nreliability", col: 1, row: 2 },
      { id: "report", label: "Readiness\nreport", col: 0, row: 2 },
    ],
    edges: [["app", "ui"], ["ui", "api"], ["api", "db"], ["db", "report"]],
    steps: [
      "Applaude is pointed at your app.",
      "It checks the frontend UI.",
      "It checks the backend APIs.",
      "It checks how reliable the database is.",
      "It reports the issues found and whether the app looks ready for scale.",
    ],
  },
};
