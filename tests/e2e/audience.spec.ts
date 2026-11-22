import { test, expect } from "@playwright/test";

const audience = (page: import("@playwright/test").Page) =>
  page.evaluate(() => document.documentElement.getAttribute("data-audience"));

test("Africa/Nairobi visitors are local", async ({ browser }) => {
  const ctx = await browser.newContext({ timezoneId: "Africa/Nairobi" });
  const page = await ctx.newPage();
  await page.goto("/");
  expect(await audience(page)).toBe("local");
  await ctx.close();
});

test("Europe/London visitors are international", async ({ browser }) => {
  const ctx = await browser.newContext({ timezoneId: "Europe/London" });
  const page = await ctx.newPage();
  await page.goto("/");
  expect(await audience(page)).toBe("international");
  await ctx.close();
});

test("Intl throwing falls back to local without a page error", async ({ page }) => {
  const errors: Error[] = [];
  page.on("pageerror", (e) => errors.push(e));
  await page.addInitScript(() => {
    (Intl as any).DateTimeFormat = function () { throw new Error("no Intl"); };
  });
  await page.goto("/");
  expect(await audience(page)).toBe("local");
  expect(errors).toEqual([]);
});

test("without JS there is no audience attribute", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("/");
  expect(await audience(page)).toBeNull();
  await ctx.close();
});
