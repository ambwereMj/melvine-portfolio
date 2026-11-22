import { test, expect } from "@playwright/test";

test.describe("scroll-highlighted nav", () => {
  test.skip(({ isMobile }) => isMobile, "sidebar nav is desktop only");

  const current = (page: import("@playwright/test").Page) =>
    page.getByRole("navigation", { name: "Sections" }).locator('a[aria-current="true"]');

  test("at page top, Home is current", async ({ page }) => {
    await page.goto("/");
    await expect(current(page)).toHaveCount(1);
    await expect(current(page)).toHaveText("Home");
  });

  test("scrolling to Services makes exactly Services current", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.evaluate(() => document.getElementById("services")!.scrollIntoView({ block: "start" }));
    await expect(current(page)).toHaveText("Services");
    await expect(current(page)).toHaveCount(1);
  });

  test("at page bottom, Contact is current", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(current(page)).toHaveText("Contact");
  });
});
