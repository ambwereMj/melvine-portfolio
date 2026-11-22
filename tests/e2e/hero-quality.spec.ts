import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("proof strip shows only supplied facts", async ({ page }) => {
  await page.goto("/");
  const items = page.getByTestId("proof").locator("li");
  await expect(items).toHaveText([
    "Diploma in Software Engineering",
    "BSc Electronics & Computer Engineering (in progress)",
  ]);
  await expect(page.locator("#hero figure")).toHaveCount(0);
});

for (const timezoneId of ["Africa/Nairobi", "Europe/London"]) {
  test(`no layout shift on load (${timezoneId})`, async ({ browser, isMobile }) => {
    const ctx = await browser.newContext({
      timezoneId,
      viewport: isMobile ? { width: 375, height: 812 } : { width: 1440, height: 900 },
      isMobile,
    });
    const page = await ctx.newPage();
    await page.addInitScript(() => {
      (window as any).__cls = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries() as any[]) if (!e.hadRecentInput) (window as any).__cls += e.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto("/");
    await page.waitForTimeout(1000);
    expect(await page.evaluate(() => (window as any).__cls)).toBeLessThanOrEqual(0.01);
    await ctx.close();
  });
}

test("the headline is the LCP element", async ({ page }) => {
  await page.goto("/");
  const id = await page.evaluate(
    () =>
      new Promise<string | null>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries() as any[];
          resolve(entries.at(-1)?.element?.id ?? null);
        }).observe({ type: "largest-contentful-paint", buffered: true });
      }),
  );
  expect(id).toBe("hero-title");
});

test("no horizontal scroll at 320px", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 320, height: 640 }, isMobile: true });
  const page = await ctx.newPage();
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await ctx.close();
});

for (const scheme of ["dark", "light"] as const) {
  test(`hero has no axe violations (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/");
    const r = await new AxeBuilder({ page }).include("#hero").analyze();
    expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });
}
