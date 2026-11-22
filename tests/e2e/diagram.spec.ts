import { test, expect } from "@playwright/test";
import { DIAGRAMS } from "../../src/lib/diagrams";

for (const [slug, d] of Object.entries(DIAGRAMS)) {
  test(`${slug} diagram is accessible`, async ({ page }) => {
    await page.goto(`/work/${slug}`);
    const svg = page.locator("figure.circuit svg[role=img]");
    await expect(svg).toHaveCount(1);
    await expect(page.getByRole("img", { name: d.title })).toHaveCount(1);
    await expect(page.locator("figure.circuit figcaption ol li")).toHaveCount(d.steps.length);
  });
}
