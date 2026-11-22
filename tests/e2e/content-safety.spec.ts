import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = ["/", "/work/luxe-condos", "/work/opportunity-finder", "/work/applaude"];
const FORBIDDEN = ['github.com/ambwereMj/Applaude"', "github.com/ambwereMj/Applaude-internal", "github.com/ambwereMj/luxe-condos"];
const JUNK = [/\bundefined\b/, /\bnull\b/, /\bNaN\b/, /\bTODO\b/, /\[object /];

for (const url of PAGES) {
  test(`${url}: no private links or junk text`, async ({ request }) => {
    const html = await (await request.get(url)).text();
    for (const f of FORBIDDEN) expect(html).not.toContain(f);
    const text = html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ");
    for (const j of JUNK) expect(text).not.toMatch(j);
  });
}

for (const url of ["/", "/work/luxe-condos"]) {
  for (const scheme of ["dark", "light"] as const) {
    test(`${url} has no axe violations (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(url);
      const r = await new AxeBuilder({ page }).analyze();
      expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    });
  }
}

test("case page tap targets are at least 44×44", async ({ page }) => {
  await page.goto("/work/opportunity-finder");
  const small = await page.locator("a, button").evaluateAll((els) =>
    els
      .filter((e) => { const s = getComputedStyle(e), r = e.getBoundingClientRect(); return s.display !== "none" && s.visibility !== "hidden" && r.width > 0 && !e.classList.contains("sr-only") && !e.classList.contains("stretched"); })
      .map((e) => ({ t: e.textContent?.trim(), w: e.getBoundingClientRect().width, h: e.getBoundingClientRect().height }))
      .filter((x) => x.w < 44 || x.h < 44),
  );
  expect(small).toEqual([]);
});
