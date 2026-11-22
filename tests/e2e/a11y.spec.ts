import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const scheme of ["dark", "light"] as const) {
  test(`no axe violations (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });
}
