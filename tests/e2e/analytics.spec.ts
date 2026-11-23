import { test, expect, type Page, type Browser } from "@playwright/test";
import { UMAMI_WEBSITE_ID } from "../../src/lib/site";

async function open(browser: Browser, isMobile: boolean, tz = "Africa/Nairobi") {
  const ctx = await browser.newContext({ timezoneId: tz, isMobile, hasTouch: isMobile, viewport: isMobile ? { width: 375, height: 812 } : { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    (window as any).__events = [];
    (window as any).umami = { track: (name: string, data: unknown) => (window as any).__events.push({ name, data }) };
    window.open = (() => null) as typeof window.open;
  });
  await page.route(/wa\.me|api\.web3forms/, (r) => r.fulfill({ status: 204, body: "" }));
  await page.route("https://cloud.umami.is/**", (r) => r.abort()); // the stub above records events
  await page.goto("/");
  // keep mailto/wa.me clicks from navigating away
  await page.evaluate(() => document.addEventListener("click", (e) => { const a = (e.target as Element).closest("a"); if (a && /^(mailto:|https:\/\/wa\.me)/.test(a.href)) e.preventDefault(); }));
  return { ctx, page };
}
const events = (page: Page) => page.evaluate(() => (window as any).__events as { name: string; data: Record<string, string> }[]);

test("hero WhatsApp click is counted once with its location", async ({ browser, isMobile }) => {
  const { ctx, page } = await open(browser, isMobile);
  await page.locator("#hero").getByRole("link", { name: "Chat on WhatsApp" }).click();
  expect(await events(page)).toEqual([{ name: "whatsapp-click", data: { location: "hero" } }]);
  await ctx.close();
});

test("sidebar booking click (desktop)", async ({ browser, isMobile }) => {
  test.skip(isMobile, "desktop sidebar");
  const { ctx, page } = await open(browser, false);
  await page.getByTestId("sidebar").getByRole("link", { name: "Book a 15-min call" }).click();
  expect(await events(page)).toEqual([{ name: "booking-click", data: { location: "sidebar" } }]);
  await ctx.close();
});

test("bottom bar WhatsApp (phone)", async ({ browser, isMobile }) => {
  test.skip(!isMobile, "phone bottom bar");
  const { ctx, page } = await open(browser, true);
  await page.getByTestId("bottom-bar").getByRole("link", { name: /WhatsApp/ }).click();
  expect(await events(page)).toEqual([{ name: "whatsapp-click", data: { location: "bottom-bar" } }]);
  await ctx.close();
});

test("service quote click carries the service name", async ({ browser, isMobile }) => {
  const { ctx, page } = await open(browser, isMobile);
  const sprint = page.locator("#services article").filter({ hasText: "Automation Sprint" });
  await sprint.getByRole("link", { name: "Get a quote in 24h" }).filter({ visible: true }).click();
  expect(await events(page)).toEqual([{ name: "quote-click", data: { location: "services", service: "Automation Sprint" } }]);
  await ctx.close();
});

test("contact form WhatsApp fallback counts a send", async ({ browser, isMobile }) => {
  const { ctx, page } = await open(browser, isMobile);
  await page.getByLabel("Your name").fill("A");
  await page.getByLabel("WhatsApp number or email").fill("a@b.co");
  await page.getByLabel("What do you need?").fill("x");
  await page.getByRole("button", { name: "Send" }).click();
  expect(await events(page)).toContainEqual({ name: "contact-send", data: { method: "whatsapp-fallback", location: "contact" } });
  await ctx.close();
});

test("palette WhatsApp command is counted with location palette", async ({ browser, isMobile }) => {
  test.skip(isMobile, "keyboard");
  const { ctx, page } = await open(browser, false);
  await page.keyboard.press("Control+k");
  await page.getByRole("combobox", { name: "Search or type a command" }).fill("whatsapp");
  await page.keyboard.press("Enter");
  expect(await events(page)).toEqual([{ name: "whatsapp-click", data: { location: "palette" } }]);
  await ctx.close();
});

test("Umami script is present with the site's ID, domain and do-not-track", async ({ page }) => {
  await page.route("https://cloud.umami.is/**", (r) => r.abort());
  await page.goto("/");
  const s = page.locator('script[src="https://cloud.umami.is/script.js"]');
  await expect(s).toHaveCount(1);
  await expect(s).toHaveAttribute("data-website-id", UMAMI_WEBSITE_ID ?? "missing");
  await expect(s).toHaveAttribute("data-domains", "melvine-jerry.vercel.app");
  await expect(s).toHaveAttribute("data-do-not-track", "true");
  await expect(s).toHaveAttribute("defer", "");
});

test("clicks still work without Umami", async ({ page }) => {
  const errors: Error[] = [];
  page.on("pageerror", (e) => errors.push(e));
  await page.goto("/");
  await page.locator("#hero").getByRole("link", { name: "See my work" }).click();
  await expect.poll(() => page.evaluate(() => location.hash)).toBe("#work");
  await page.evaluate(() => (document.querySelector('[data-event="whatsapp-click"]') as HTMLElement).dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true })));
  expect(errors).toEqual([]);
});
