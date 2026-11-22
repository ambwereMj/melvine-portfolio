import { test, expect, type Browser } from "@playwright/test";
import { SERVICES, RUNNING_COSTS } from "../../src/content/services";

async function open(browser: Browser, timezoneId: string, isMobile: boolean) {
  const ctx = await browser.newContext({ timezoneId, isMobile, viewport: isMobile ? { width: 375, height: 812 } : { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto("/");
  return { ctx, page };
}
const visibleText = (page: import("@playwright/test").Page) => page.locator("#services").evaluate((el) => (el as HTMLElement).innerText);

test("Nairobi sees KES prices and WhatsApp quotes", async ({ browser, isMobile }) => {
  const { ctx, page } = await open(browser, "Africa/Nairobi", isMobile);
  const text = await visibleText(page);
  for (const p of ["From KES 25,000", "From KES 20,000", "From KES 35,000", "M-Pesa checkout from KES 20,000"]) expect(text).toContain(p);
  expect(text).not.toContain("USD");
  expect(text).toContain(RUNNING_COSTS);
  const quotes = page.locator("#services a").filter({ hasText: "Get a quote in 24h" }).filter({ visible: true });
  await expect(quotes).toHaveCount(3);
  for (const [i, s] of SERVICES.entries()) {
    const href = decodeURIComponent((await quotes.nth(i).getAttribute("href"))!);
    expect(href).toMatch(/^https:\/\/wa\.me\/254110753069\?text=/);
    expect(href).toContain(`I need: ${s.name}`);
  }
  await ctx.close();
});

test("London sees USD prices and email quotes", async ({ browser, isMobile }) => {
  const { ctx, page } = await open(browser, "Europe/London", isMobile);
  const text = await visibleText(page);
  for (const p of ["From USD 250", "From USD 300", "From USD 400"]) expect(text).toContain(p);
  expect(text).not.toContain("KES");
  const quotes = page.locator("#services a").filter({ hasText: "Get a quote in 24h" }).filter({ visible: true });
  await expect(quotes).toHaveCount(3);
  for (const [i, s] of SERVICES.entries()) {
    expect(await quotes.nth(i).getAttribute("href")).toBe(`mailto:melvinambwere@gmail.com?subject=${encodeURIComponent(`Quote request: ${s.name}`)}`);
  }
  await ctx.close();
});

test("each service lists who it's for, what's included and a timeline", async ({ page }) => {
  await page.goto("/");
  const cards = page.locator("#services article");
  await expect(cards).toHaveCount(3);
  for (const [i, s] of SERVICES.entries()) {
    await expect(cards.nth(i).locator("h3")).toHaveText(s.name);
    await expect(cards.nth(i)).toContainText(s.forWho);
    await expect(cards.nth(i)).toContainText(s.timeline);
    await expect(cards.nth(i).locator("li")).toHaveText(s.includes);
  }
});
