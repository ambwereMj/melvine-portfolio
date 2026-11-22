import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { workSchema } from "../../src/lib/work-schema";

const SLUGS = ["luxe-condos", "opportunity-finder", "applaude"] as const;
const load = (slug: string) => {
  const text = readFileSync(`src/content/work/${slug}.md`, "utf8");
  const [, fm, body] = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)!;
  return { data: workSchema.parse(parse(fm)), body };
};

describe.each(SLUGS)("%s", (slug) => {
  it("frontmatter is valid and body ≤ 600 words", () => {
    const { data, body } = load(slug);
    expect(data.role).toBe("Solo builder");
    expect(data.diagram).toBe(slug);
    expect(body.split(/\s+/).filter(Boolean).length).toBeLessThanOrEqual(600);
    for (const h of ["## Context and problem", "## Approach", "## What's next"]) expect(body).toContain(h);
  });
});

it("orders are 1, 2, 3 in the agreed sequence", () => {
  expect(SLUGS.map((s) => load(s).data.order)).toEqual([1, 2, 3]);
});

it("statuses", () => {
  expect(load("luxe-condos").data.status).toBe("In development · agent live January 2027");
  expect(load("opportunity-finder").data.status).toBe("Live");
  expect(load("applaude").data.status).toBe("In development");
});

it("Luxe Condos agent capabilities are listed as planned", () => {
  expect(load("luxe-condos").data.planned).toEqual([
    "Availability",
    "Prices",
    "Location and directions",
    "Check-in details",
    "Amenities",
    "Handing bookings over to me",
  ]);
});

it("links are public only", () => {
  expect(load("luxe-condos").data.links).toEqual([]);
  expect(load("opportunity-finder").data.links[0].href).toBe("https://github.com/ambwereMj/orppotunities");
  expect(load("applaude").data.links).toEqual([
    { label: "Public test pages (GitHub)", href: "https://github.com/ambwereMj/applaude-check-pages" },
  ]);
});

it("only Opportunity Finder states a result", () => {
  expect(load("opportunity-finder").data.result).toBe("All four phases live, running daily at $0/month on free tiers.");
  expect(load("luxe-condos").data.result).toBeNull();
  expect(load("applaude").data.result).toBeNull();
});
