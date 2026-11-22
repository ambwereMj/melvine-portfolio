import { test, expect, type Page } from "@playwright/test";

const fillScale = (page: Page) =>
  page.locator(".signal-fill").evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).d);
const barScale = (page: Page) =>
  page.getByTestId("signal-bar").locator("[data-bar-fill]").evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).a);
const scrollTo = async (page: Page, y: number | string) => {
  await page.evaluate((y) => {
    if (typeof y === "number") window.scrollTo({ top: y, behavior: "instant" });
    else document.querySelector(y)!.scrollIntoView({ block: "start", behavior: "instant" });
  }, y);
  await page.waitForTimeout(150);
};

test.describe("desktop fill", () => {
  test.skip(({ isMobile }) => isMobile, "desktop only");
  test.use({ reducedMotion: "reduce" });

  test("grows monotonically while scrolling down", async ({ page }) => {
    await page.goto("/");
    const values = [await fillScale(page)];
    expect(values[0]).toBeLessThan(0.05);
    for (const id of ["#work", "#services", "#process", "#contact"]) {
      await scrollTo(page, id);
      values.push(await fillScale(page));
    }
    for (let i = 1; i < values.length; i++) expect(values[i]).toBeGreaterThan(values[i - 1]);
  });

  test("lit pads are exactly those up to the current link, even after a resize", async ({ page }) => {
    await page.goto("/");
    const check = async () => {
      const state = await page.getByRole("navigation", { name: "Sections" }).getByRole("link").evaluateAll((els) =>
        els.map((e) => ({ lit: e.getAttribute("data-lit") === "true", current: e.getAttribute("aria-current") === "true" })),
      );
      const cur = state.findIndex((s) => s.current);
      expect(cur).toBeGreaterThanOrEqual(0);
      expect(state.map((s) => s.lit)).toEqual(state.map((_, i) => i <= cur));
    };
    await scrollTo(page, "#services");
    await check();
    await page.setViewportSize({ width: 1280, height: 700 });
    await scrollTo(page, "#process");
    await check();
  });

  test("reduced motion: no running animations, fill still tracks", async ({ page }) => {
    await page.goto("/");
    await scrollTo(page, "#work");
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    expect(await fillScale(page)).toBeGreaterThan(0);
  });
});

test.describe("phone bar", () => {
  test.skip(({ isMobile }) => !isMobile, "phone only");

  test("visible, empty at top and full at bottom, with a tick per section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("signal-bar")).toBeVisible();
    expect(await barScale(page)).toBeLessThan(0.05);
    await expect(page.getByTestId("signal-bar").locator("[data-tick]")).toHaveCount(7);
    await scrollTo(page, 999999);
    expect(await barScale(page)).toBeGreaterThan(0.95);
  });

  test("case pages show reading progress without ticks", async ({ page }) => {
    await page.goto("/work/applaude");
    await expect(page.getByTestId("signal-bar")).toBeVisible();
    await expect(page.getByTestId("signal-bar").locator("[data-tick]")).toHaveCount(0);
  });

  test("hidden without JavaScript", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 }, isMobile: true });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.getByTestId("signal-bar")).toBeHidden();
    await ctx.close();
  });
});

test("404 page: no errors and a sane bar value", async ({ page }) => {
  const errors: Error[] = [];
  page.on("pageerror", (e) => errors.push(e));
  await page.goto("/nope");
  await page.waitForTimeout(150);
  expect(errors).toEqual([]);
  const v = await page.getByTestId("signal-bar").locator("[data-bar-fill]").evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).a);
  expect(v).toBeGreaterThanOrEqual(0);
  expect(v).toBeLessThanOrEqual(1);
});

test("no layout shift while scrolling", async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).__cls = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries() as any[]) if (!e.hadRecentInput) (window as any).__cls += e.value; }).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto("/");
  await page.waitForTimeout(500);
  const before = await page.evaluate(() => (window as any).__cls);
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let i = 1; i <= 5; i++) await scrollTo(page, (h * i) / 5);
  expect((await page.evaluate(() => (window as any).__cls)) - before).toBeLessThanOrEqual(0.01);
});
