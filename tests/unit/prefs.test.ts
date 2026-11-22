import { describe, it, expect } from "vitest";
import { resolvePref } from "../../src/lib/prefs";

const THEMES = ["dark", "light"] as const;

describe("resolvePref", () => {
  it("stored valid value wins over system", () => {
    expect(resolvePref("light", THEMES, "dark")).toBe("light");
  });
  it("stored invalid value falls back to system", () => {
    expect(resolvePref("purple", THEMES, "light")).toBe("light");
  });
  it("null falls back to system", () => {
    expect(resolvePref(null, THEMES, "dark")).toBe("dark");
  });
});
