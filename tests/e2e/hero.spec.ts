import { test, expect, type Page } from "@playwright/test";
import { PROFILE, badgeText } from "../../src/content/profile";
import { WHATSAPP_URL, TIMEZONE_LABEL } from "../../src/lib/site";

const heroCtaNames = (page: Page) =>
  page.locator("#hero [data-for] a").evaluateAll((els) =>
    els.filter((e) => (e as HTMLElement).offsetParent !== null).map((e) => e.textContent!.trim()),
  );

async function open(browser: import("@playwright/test").Browser, opts: Record<string, unknown>, isMobile: boolean) {
  const ctx = await browser.newContext({
    ...opts,
    viewport: isMobile ? { width: 375, height: 812 } : { width: 1440, height: 900 },
    isMobile,
    hasTouch: isMobile,
  });
  const page = await ctx.newPage();
  await page.goto("/");
  return { ctx, page };
}

test("headline and badge copy", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#hero h1")).toHaveText(PROFILE.headline);
  await expect(page.getByTestId("availability")).toHaveText(badgeText(PROFILE.availability, TIMEZONE_LABEL));
  await expect(page.locator("#hero")).toContainText(PROFILE.subline);
});

test("Nairobi gets WhatsApp-first CTAs", async ({ browser, isMobile }) => {
  const { ctx, page } = await open(browser, { timezoneId: "Africa/Nairobi" }, isMobile);
  expect(await heroCtaNames(page)).toEqual(["Chat on WhatsApp", "See my work"]);
  await ctx.close();
});

test("London gets call-first CTAs and the local pair is out of the accessibility tree", async ({ browser, isMobile }) => {
  const { ctx, page } = await open(browser, { timezoneId: "Europe/London" }, isMobile);
  expect(await heroCtaNames(page)).toEqual(["Book a 15-min call", "Email me"]);
  await expect(page.locator('#hero [data-for="local"]')).toBeHidden();
  await expect(page.locator("#hero").getByRole("link", { name: "Chat on WhatsApp" })).toHaveCount(0);
  await ctx.close();
});

test("London visitors still see a WhatsApp link on first screen", async ({ browser, isMobile }) => {
  const { ctx, page } = await open(browser, { timezoneId: "Europe/London" }, isMobile);
  const onScreen = await page.locator(`a[href="${WHATSAPP_URL}"]`).evaluateAll((els) =>
    els.some((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.top >= 0 && r.bottom <= window.innerHeight;
    }),
  );
  expect(onScreen).toBe(true);
  await ctx.close();
});

test("no-JS visitors get the local pair", async ({ browser, isMobile }) => {
  const { ctx, page } = await open(browser, { javaScriptEnabled: false }, isMobile);
  expect(await heroCtaNames(page)).toEqual(["Chat on WhatsApp", "See my work"]);
  await ctx.close();
});

test("reassurance and recruiter lines", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("reassurance")).toHaveText(PROFILE.reassurance);
  const recruiter = page.getByTestId("recruiter");
  await expect(recruiter).toContainText("CV coming soon");
  await expect(recruiter.getByRole("link", { name: /CV/ })).toHaveCount(0);
  await expect(recruiter.getByRole("link", { name: "View GitHub" })).toHaveAttribute("href", "https://github.com/ambwereMj");
});
