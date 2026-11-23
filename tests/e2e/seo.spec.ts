import { test, expect } from "@playwright/test";
import { SITE_URL } from "../../src/lib/site";

test.skip(({ isMobile }) => isMobile, "SEO tags are viewport-independent");

const PAGES = ["/", "/work/luxe-condos/", "/work/opportunity-finder/", "/work/applaude/", "/lab/opportunity-finder-for-zero/", "/lab/building-this-portfolio/"];
const site = SITE_URL.replace(/\/$/, "");

for (const path of PAGES) {
  test(`${path} has canonical, Open Graph and Twitter tags`, async ({ page }) => {
    await page.goto(path);
    const attr = (sel: string, a = "content") => page.locator(sel).getAttribute(a);
    expect(await attr('link[rel="canonical"]', "href")).toBe(site + path);
    expect(await attr('meta[property="og:url"]')).toBe(site + path);
    expect(await attr('meta[property="og:title"]')).toBeTruthy();
    expect(await attr('meta[property="og:description"]')).toBeTruthy();
    expect(await attr('meta[property="og:image"]')).toMatch(new RegExp(`^${site.replace(/[.]/g, "\.")}/og/[a-z0-9-]+\.png$`));
    expect(await attr('meta[property="og:image:width"]')).toBe("1200");
    expect(await attr('meta[property="og:image:height"]')).toBe("630");
    expect(await attr('meta[name="twitter:card"]')).toBe("summary_large_image");
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  });
}

test("home has one Person JSON-LD linking GitHub", async ({ page }) => {
  await page.goto("/");
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(blocks).toHaveLength(1);
  const data = JSON.parse(blocks[0]);
  expect(data["@type"]).toBe("Person");
  expect(data.sameAs).toEqual(["https://github.com/ambwereMj"]);
});

test("Lab notes carry BlogPosting JSON-LD", async ({ page }) => {
  await page.goto("/lab/building-this-portfolio/");
  const data = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
  expect(data["@type"]).toBe("BlogPosting");
});

for (const path of ["/thanks", "/nope"]) {
  test(`${path} is not indexed`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
  });
}

test("sitemap lists the six real pages only, and robots.txt points to it", async ({ request }) => {
  expect((await request.get("/sitemap-index.xml")).status()).toBe(200);
  const xml = await (await request.get("/sitemap-0.xml")).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
  expect(locs).toEqual(PAGES.map((p) => site + p).sort());
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain(`Sitemap: ${site}/sitemap-index.xml`);
});

test("favicon is declared and served", async ({ page, request }) => {
  await page.goto("/");
  const href = await page.locator('link[rel="icon"]').getAttribute("href");
  expect(href).toBe("/favicon.svg");
  expect((await request.get(href!)).status()).toBe(200);
});
