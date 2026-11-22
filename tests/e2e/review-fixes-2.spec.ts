import { test, expect } from "@playwright/test";

test("without a Cal.com link, booking CTAs open an email booking request (no dead end)", async ({ browser, isMobile }) => {
  const ctx = await browser.newContext({ timezoneId: "Europe/London", isMobile, viewport: isMobile ? { width: 375, height: 812 } : { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto("/");
  const hrefs = await page.locator("a").filter({ hasText: /Book (a 15-min )?call/ }).evaluateAll((els) => els.map((e) => e.getAttribute("href")));
  expect(hrefs.length).toBeGreaterThan(0);
  for (const h of hrefs) {
    expect(h).toMatch(/^mailto:melvinambwere@gmail\.com\?subject=/);
  }
  await ctx.close();
});

test("availability badge shows during its month", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-12-15T09:00:00+03:00"));
  await page.goto("/");
  await expect(page.getByTestId("availability")).toBeVisible();
});

test("availability badge hides itself after its month ends", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2027-01-01T00:30:00+03:00"));
  await page.goto("/");
  await expect(page.getByTestId("availability")).toBeHidden();
});
