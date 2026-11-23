import { test, expect, type Browser, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { parse } from "yaml";
import { WHATSAPP_URL } from "../../src/lib/site";

const SLUGS = ["luxe-condos", "opportunity-finder", "applaude"] as const;
const fm = (slug: string) => parse(readFileSync(`src/content/work/${slug}.md`, "utf8").split(/^---\r?\n/m)[1]);

const visibleLinks = (page: Page, sel: string) =>
  page.locator(sel).evaluateAll((els) =>
    els.filter((e) => (e as HTMLElement).offsetParent !== null).map((e) => e.textContent!.trim()),
  );

async function open(browser: Browser, url: string, opts: Record<string, unknown>, isMobile: boolean) {
  const ctx = await browser.newContext({
    ...opts,
    viewport: isMobile ? { width: 375, height: 812 } : { width: 1440, height: 900 },
    isMobile,
    hasTouch: isMobile,
  });
  const page = await ctx.newPage();
  const res = await page.goto(url);
  return { ctx, page, res };
}

test("home #work shows three cards in order, each linking to its page", async ({ page }) => {
  await page.goto("/");
  const cards = page.locator("#work article");
  await expect(cards).toHaveCount(3);
  await expect(cards.locator("h3")).toHaveText(SLUGS.map((s) => fm(s).title));
  for (const [i, slug] of SLUGS.entries()) {
    await expect(cards.nth(i)).toContainText(fm(slug).status);
    await expect(cards.nth(i).locator(`a[href="/work/${slug}/"]`)).toHaveCount(1);
  }
});

test("clicking a card's body opens its case study", async ({ page }) => {
  await page.goto("/");
  // A real pointer click on the summary text: the card's stretched link sits on top of it by design.
  const summary = page.locator("#work article").nth(1).locator("p").first();
  await summary.scrollIntoViewIfNeeded();
  const box = (await summary.boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page).toHaveURL(/\/work\/opportunity-finder\/$/);
});

for (const slug of SLUGS) {
  test(`/work/${slug} has its own title, description and one h1`, async ({ page }) => {
    const data = fm(slug);
    await page.goto(`/work/${slug}`);
    await expect(page).toHaveTitle(`${data.project} case study | Melvine Jerry`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", data.summary);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(data.title);
    await expect(page.getByTestId("result")).toHaveCount(data.result ? 1 : 0);
  });
}

test("Luxe Condos lists the agent's planned capabilities", async ({ page }) => {
  await page.goto("/work/luxe-condos");
  const planned = page.getByTestId("planned");
  await expect(planned).toContainText("Planned");
  await expect(planned.locator("li")).toHaveText(fm("luxe-condos").planned);
});

test("case-study CTA band follows the visitor's audience", async ({ browser, isMobile }) => {
  const local = await open(browser, "/work/opportunity-finder", { timezoneId: "Africa/Nairobi" }, isMobile);
  await expect(local.page.getByTestId("cta-band")).toContainText("Want one for your business?");
  expect(await visibleLinks(local.page, "[data-testid=cta-band] a")).toEqual(["Chat on WhatsApp", "Email me"]);
  await local.ctx.close();
  const intl = await open(browser, "/work/opportunity-finder", { timezoneId: "Europe/London" }, isMobile);
  expect(await visibleLinks(intl.page, "[data-testid=cta-band] a")).toEqual(["Book a 15-min call", "Chat on WhatsApp"]);
  await intl.ctx.close();
});

test("direct visit on a phone: bottom bar and WhatsApp on first screen", async ({ browser }) => {
  const { ctx, page } = await open(browser, "/work/luxe-condos", {}, true);
  await expect(page.getByTestId("bottom-bar")).toBeVisible();
  const onScreen = await page.locator(`a[href="${WHATSAPP_URL}"]`).evaluateAll((els) =>
    els.some((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.top >= 0 && r.bottom <= innerHeight; }),
  );
  expect(onScreen).toBe(true);
  await ctx.close();
});

test("on case pages the sidebar nav points back to home sections", async ({ page, isMobile }) => {
  test.skip(isMobile, "sidebar is desktop only");
  await page.goto("/work/applaude");
  const hrefs = await page.getByRole("navigation", { name: "Sections" }).getByRole("link").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
  expect(hrefs).toEqual(["/#hero", "/#work", "/#services", "/#process", "/#about", "/#lab", "/#contact"]);
});

test("unknown case study returns a 404 page", async ({ page }) => {
  const res = await page.goto("/work/nope");
  expect(res?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("Page not found");
  await expect(page.getByRole("link", { name: "Go to the home page" })).toHaveAttribute("href", "/");
});
