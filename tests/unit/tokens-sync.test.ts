import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { PALETTE, type Theme } from "../../src/lib/palette";

const css = readFileSync(new URL("../../src/styles/tokens.css", import.meta.url), "utf8");
const kebab = (k: string) => k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());

function block(selector: string): string {
  const i = css.indexOf(selector);
  if (i < 0) throw new Error(`missing selector ${selector}`);
  return css.slice(i, css.indexOf("}", i));
}

describe.each(["dark", "light"] as Theme[])("tokens.css %s mirrors PALETTE", (theme) => {
  const body = block(`[data-theme="${theme}"]`);
  it.each(Object.entries(PALETTE[theme]))("--c-%s", (key, hex) => {
    const m = body.match(new RegExp(String.raw`--c-${kebab(key)}:\s*(#[0-9a-fA-F]{3,6})`));
    expect(m?.[1]?.toUpperCase()).toBe(hex.toUpperCase());
  });
});

it("no-JS light fallback mirrors light PALETTE", () => {
  const i = css.indexOf("@media (prefers-color-scheme: light)");
  const body = css.slice(i, css.indexOf("}", css.indexOf(":root:not([data-theme])", i)));
  for (const [key, hex] of Object.entries(PALETTE.light)) {
    expect(body.toUpperCase()).toContain(`--C-${kebab(key).toUpperCase()}: ${hex.toUpperCase()}`);
  }
});
