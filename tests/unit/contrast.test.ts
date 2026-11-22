import { describe, it, expect } from "vitest";
import { contrastRatio } from "../../src/lib/contrast";
import { PALETTE } from "../../src/lib/palette";

describe("contrastRatio", () => {
  it("black on white is 21:1", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 2);
  });
  it("identical colours are 1:1", () => {
    expect(contrastRatio("#FFFFFF", "#FFFFFF")).toBe(1);
  });
  it("accepts 3-digit hex", () => {
    expect(contrastRatio("#000", "#fff")).toBeCloseTo(21, 2);
  });
});

describe.each(["dark", "light"] as const)("%s palette meets WCAG AA", (theme) => {
  const p = PALETTE[theme];
  it.each([
    ["text on bg", p.text, p.bg, 4.5],
    ["text on surface", p.text, p.surface, 4.5],
    ["muted on bg", p.muted, p.bg, 4.5],
    ["muted on surface", p.muted, p.surface, 4.5],
    ["accent on bg", p.accent, p.bg, 4.5],
    ["onAccent on accent", p.onAccent, p.accent, 4.5],
    ["accent2Text on bg", p.accent2Text, p.bg, 4.5],
    ["accent2 on bg (large/UI)", p.accent2, p.bg, 3],
    ["border on bg (UI)", p.border, p.bg, 3],
  ])("%s", (_name, fg, bg, min) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(min);
  });
});

describe("spec colours are exact", () => {
  it("dark", () => {
    expect(PALETTE.dark).toMatchObject({ bg: "#0B0F0E", surface: "#121917", text: "#E6EDEA", accent: "#3DDC97", accent2: "#F5A623" });
  });
  it("light", () => {
    expect(PALETTE.light).toMatchObject({ bg: "#F4F1EA", surface: "#FFFFFF", text: "#14201B", accent: "#0B7A4B", accent2: "#D9480F", accent2Text: "#B83D0C" });
  });
});
