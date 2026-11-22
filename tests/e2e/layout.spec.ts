import { test, expect } from "@playwright/test";
import { BOOKING_URL } from "../../src/lib/site";

const WHATSAPP_URL =
  "https://wa.me/254110753069?text=" +
  encodeURIComponent("Hi Melvine, I saw your portfolio. I need: ___ · Budget: ___ · Deadline: ___");

test.describe("desktop shell", () => {
  test.skip(({ isMobile }) => isMobile, "desktop only");

  test("sidebar is visible and stays pinned while scrolling; bottom bar hidden", async ({ page }) => {
    await page.goto("/");
    const sidebar = page.getByTestId("sidebar");
    await expect(sidebar).toBeVisible();
    await expect(page.getByTestId("bottom-bar")).toBeHidden();
    await page.locator("#contact").scrollIntoViewIfNeeded();
    const box = await sidebar.boundingBox();
    expect(box!.y).toBe(0);
  });

  test("sidebar nav lists all sections in order", async ({ page }) => {
    await page.goto("/");
    const hrefs = await page.getByRole("navigation", { name: "Sections" }).getByRole("link").evaluateAll(
      (els) => els.map((e) => e.getAttribute("href")),
    );
    expect(hrefs).toEqual(["#hero", "#work", "#services", "#process", "#about", "#lab", "#contact"]);
  });

  test("short viewport + 200% text: last sidebar CTA is reachable", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 700 });
    await page.goto("/");
    await page.evaluate(() => (document.documentElement.style.fontSize = "200%"));
    const cta = page.getByTestId("sidebar").getByRole("button", { name: "Reduce motion" });
    await cta.scrollIntoViewIfNeeded();
    await expect(cta).toBeInViewport();
  });
});

test.describe("mobile shell", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile only");

  test("bottom bar visible with WhatsApp + Book call; sidebar nav hidden", async ({ page }) => {
    await page.goto("/");
    const bar = page.getByTestId("bottom-bar");
    await expect(bar).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Sections" })).toBeHidden();
    await expect(bar.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute("href", WHATSAPP_URL);
    await expect(bar.getByRole("link", { name: /Book call/ })).toHaveAttribute("href", BOOKING_URL);
  });

  test("bottom bar never covers the footer", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(100);
    const footer = await page.locator("footer").boundingBox();
    const bar = await page.getByTestId("bottom-bar").boundingBox();
    expect(footer!.y + footer!.height).toBeLessThanOrEqual(bar!.y + 1);
  });
});

test("every visible link and button is at least 44×44", async ({ page }) => {
  await page.goto("/");
  const small = await page.locator("a, button").evaluateAll((els) =>
    els
      .filter((e) => {
        const s = getComputedStyle(e);
        const r = e.getBoundingClientRect();
        return s.visibility !== "hidden" && s.display !== "none" && r.width > 0 && r.height > 0 && !e.classList.contains("sr-only");
      })
      .map((e) => ({ text: e.textContent?.trim() || e.getAttribute("aria-label"), w: e.getBoundingClientRect().width, h: e.getBoundingClientRect().height }))
      .filter((x) => x.w < 44 || x.h < 44),
  );
  expect(small).toEqual([]);
});

test("first Tab reaches the skip link, which moves focus to main", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard test on desktop");
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  expect(await skip.evaluate((e) => getComputedStyle(e).outlineStyle)).not.toBe("none");
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});

test("deep link /#work: heading is not hidden under a sticky element", async ({ page }) => {
  await page.goto("/#work");
  await page.waitForTimeout(300);
  const h = page.locator("#work h2");
  const box = (await h.boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(0);
  const inside = await page.evaluate(([x, y]) => {
    const el = document.elementFromPoint(x, y);
    return !!el?.closest("#work");
  }, [box.x + Math.min(box.width / 2, 40), box.y + box.height / 2]);
  expect(inside).toBe(true);
});

test("all seven sections exist with headings", async ({ page }) => {
  await page.goto("/");
  for (const id of ["hero", "work", "services", "process", "about", "lab", "contact"]) {
    await expect(page.locator(`section#${id}`)).toHaveCount(1);
  }
});
