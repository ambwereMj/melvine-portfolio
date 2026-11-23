import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { noteSchema, sortNotes } from "../../src/lib/note-schema";

const SLUGS = ["opportunity-finder-for-zero", "building-this-portfolio"];
const load = (slug: string) => {
  const [, fm, body] = readFileSync(`src/content/notes/${slug}.md`, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)!;
  return { data: noteSchema.parse(parse(fm)), body };
};

describe.each(SLUGS)("%s", (slug) => {
  it("is valid and 300–700 words", () => {
    const { body } = load(slug);
    const words = body.split(/\s+/).filter(Boolean).length;
    expect(words).toBeGreaterThanOrEqual(300);
    expect(words).toBeLessThanOrEqual(700);
  });
});

it("titles", () => {
  expect(SLUGS.map((s) => load(s).data.title)).toEqual([
    "How Opportunity Finder runs daily for $0",
    "Building this portfolio in stages with Claude Code",
  ]);
});

it("schema rejects a long summary or a missing date", () => {
  expect(() => noteSchema.parse({ title: "x", summary: "a".repeat(161), date: "2026-11-23", draft: false })).toThrow();
  expect(() => noteSchema.parse({ title: "x", summary: "ok", draft: false })).toThrow();
});

it("sorts newest first, then by title", () => {
  const n = (title: string, date: string) => ({ data: { title, date: new Date(date) } });
  expect(sortNotes([n("B", "2026-11-23"), n("A", "2026-11-23"), n("C", "2026-12-01")]).map((x) => x.data.title)).toEqual(["C", "A", "B"]);
});
