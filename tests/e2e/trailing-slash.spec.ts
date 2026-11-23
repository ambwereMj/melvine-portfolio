import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

test("internal links to case studies and notes use the canonical trailing-slash form", async ({ page }) => {
  await page.goto("/");
  const hrefs = await page.locator('a[href^="/work/"], a[href^="/lab/"], [data-href^="/work/"]').evaluateAll((els) =>
    els.map((e) => e.getAttribute("href") ?? e.getAttribute("data-href")!),
  );
  expect(hrefs.length).toBeGreaterThan(0);
  for (const h of hrefs) expect(h, h).toMatch(/\/$/);
});

test("terminal project links use the canonical form", () => {
  const src = readFileSync("src/components/Terminal.astro", "utf8");
  expect(src).toContain("href: `/work/${w.id}/`");
});

test("Vercel redirects slashless URLs to the canonical form", () => {
  expect(JSON.parse(readFileSync("vercel.json", "utf8")).trailingSlash).toBe(true);
});
