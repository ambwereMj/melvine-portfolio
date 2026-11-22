import { describe, it, expect } from "vitest";
import { DIAGRAMS, tracePath, endPads } from "../../src/lib/diagrams";

describe.each(Object.entries(DIAGRAMS))("%s diagram", (_id, d) => {
  it("edges reference existing nodes", () => {
    const ids = new Set(d.nodes.map((n) => n.id));
    for (const [a, b] of d.edges) {
      expect(ids.has(a)).toBe(true);
      expect(ids.has(b)).toBe(true);
    }
  });
  it("has a text alternative step for each hop", () => {
    expect(d.steps.length).toBeGreaterThanOrEqual(d.nodes.length - 1);
  });
  it("no two nodes share a cell", () => {
    const cells = d.nodes.map((n) => `${n.col},${n.row}`);
    expect(new Set(cells).size).toBe(cells.length);
  });
});

it("traces are orthogonal (M/H/V only)", () => {
  const p = tracePath({ col: 0, row: 0 }, { col: 1, row: 1 }, { w: 200, h: 90 });
  expect(p).toMatch(/^M[\d. ]+( [HV][\d.]+)+$/);
  expect(p).not.toMatch(/[LCQA]/);
});

it("pads sit on the box edges the trace leaves and enters", () => {
  const cell = { w: 200, h: 90 }, box = { w: 160, h: 52 };
  // same row: leaves right edge, enters left edge
  expect(endPads({ col: 0, row: 0 }, { col: 1, row: 0 }, cell, box)).toEqual([{ x: 180, y: 45 }, { x: 220, y: 45 }]);
  // same column: leaves bottom edge, enters top edge
  expect(endPads({ col: 0, row: 0 }, { col: 0, row: 1 }, cell, box)).toEqual([{ x: 100, y: 71 }, { x: 100, y: 109 }]);
});

it("Opportunity Finder follows the agreed pipeline", () => {
  expect(DIAGRAMS["opportunity-finder"].nodes.map((n) => n.label.replace(/\n/g, " "))).toEqual([
    "Sources", "Official page", "Eligibility + scam rules", "Score 0–100", "Supabase", "Telegram digest", "You decide",
  ]);
});
