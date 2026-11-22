import { test, expect } from "@playwright/test";

const theme = (page: import("@playwright/test").Page) =>
  page.evaluate(() => document.documentElement.dataset.theme);

test.describe("theme & motion preferences", () => {
  test("defaults to dark", async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme: "dark" });
    const page = await ctx.newPage();
    await page.goto("/");
    expect(await theme(page)).toBe("dark");
    await ctx.close();
  });

  test("follows OS light preference", async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme: "light" });
    const page = await ctx.newPage();
    await page.goto("/");
    expect(await theme(page)).toBe("light");
    await ctx.close();
  });

  test("follows OS reduced-motion preference", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.dataset.motion)).toBe("reduce");
    await ctx.close();
  });

  test("theme toggle flips, reflects pressed state and persists", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    const btn = page.getByRole("button", { name: "Light theme" }).first();
    await expect(btn).toHaveAttribute("aria-pressed", "false");
    await btn.click();
    expect(await theme(page)).toBe("light");
    await expect(btn).toHaveAttribute("aria-pressed", "true");
    await page.reload();
    expect(await theme(page)).toBe("light");
    await expect(page.getByRole("button", { name: "Light theme" }).first()).toHaveAttribute("aria-pressed", "true");
  });

  test("reduce-motion toggle flips and persists", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const btn = page.getByRole("button", { name: "Reduce motion" }).first();
    await btn.click();
    expect(await page.evaluate(() => document.documentElement.dataset.motion)).toBe("reduce");
    await page.reload();
    expect(await page.evaluate(() => document.documentElement.dataset.motion)).toBe("reduce");
  });

  test("survives localStorage throwing", async ({ page }) => {
    const errors: Error[] = [];
    page.on("pageerror", (e) => errors.push(e));
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", { get() { throw new Error("blocked"); } });
    });
    await page.goto("/");
    expect(await theme(page)).toMatch(/^(dark|light)$/);
    await page.getByRole("button", { name: "Light theme" }).first().click();
    expect(errors).toEqual([]);
  });

  test("theme is set before the body is parsed (no flash)", async ({ page }) => {
    await page.addInitScript(() => {
      document.addEventListener("readystatechange", () => {}, { once: true });
      new MutationObserver((_m, obs) => {
        if (document.body) {
          (window as any).__themeAtBody = document.documentElement.dataset.theme ?? null;
          obs.disconnect();
        }
      }).observe(document, { childList: true, subtree: true });
    });
    await page.goto("/");
    expect(await page.evaluate(() => (window as any).__themeAtBody)).toMatch(/^(dark|light)$/);
  });

  test("without JS, light OS preference gets light colours", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, colorScheme: "light" });
    const page = await ctx.newPage();
    await page.goto("/");
    const bg = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
    expect(bg).toBe("rgb(244, 241, 234)");
    await ctx.close();
  });
});
