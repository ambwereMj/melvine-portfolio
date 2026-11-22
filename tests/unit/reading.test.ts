import { it, expect } from "vitest";
import { readingLine, activeIndex, progressIndex, readingProgress, type Layout } from "../../src/lib/reading";

const at = (scrollY: number, extra: Partial<Layout> = {}): Layout => ({ tops: [0, 1000, 2000, 3000], scrollY, viewportH: 800, docH: 3600, ...extra });

it("reading line is 120px or 40% of a short viewport", () => {
  expect(readingLine(800)).toBe(120);
  expect(readingLine(200)).toBe(80);
});
it("at the top", () => {
  expect(activeIndex(at(0))).toBe(0);
  expect(progressIndex(at(0))).toBe(0);
});
it("section 1 exactly at the reading line", () => {
  expect(activeIndex(at(880))).toBe(1);
  expect(progressIndex(at(880))).toBe(1);
});
it("halfway between sections 1 and 2", () => {
  expect(activeIndex(at(1380))).toBe(1);
  expect(progressIndex(at(1380))).toBeCloseTo(1.5);
});
it("at the bottom the last section wins", () => {
  expect(activeIndex(at(2800))).toBe(3);
  expect(progressIndex(at(2800))).toBe(3);
});
it("never goes past the last section or below zero", () => {
  expect(progressIndex(at(5000))).toBe(3);
  expect(progressIndex(at(-50))).toBe(0);
});
it("single or no section", () => {
  expect(progressIndex(at(500, { tops: [0] }))).toBe(0);
  expect(activeIndex(at(500, { tops: [] }))).toBe(0);
  expect(progressIndex(at(500, { tops: [] }))).toBe(0);
});
it("reading progress", () => {
  expect(readingProgress(0, 800, 3600)).toBe(0);
  expect(readingProgress(2800, 800, 3600)).toBe(1);
  expect(readingProgress(1400, 800, 3600)).toBe(0.5);
  expect(readingProgress(0, 800, 500)).toBe(0);
  expect(readingProgress(9999, 800, 3600)).toBe(1);
});

import { sectionShares } from "../../src/lib/reading";
it("section shares place each section along the 0..1 reading progress", () => {
  expect(sectionShares(at(0))).toEqual([0, 880 / 2800, 1880 / 2800, 1]);
  expect(sectionShares(at(0, { docH: 500 }))).toEqual([0, 0, 0, 0]);
});
