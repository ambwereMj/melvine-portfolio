import { test, expect } from "@playwright/test";

test("headline font is preloaded and uses font-display: optional", async ({ page }) => {
  await page.goto("/");
  const preload = page.locator('link[rel="preload"][as="font"]');
  await expect(preload).toHaveCount(1);
  await expect(preload).toHaveAttribute("type", "font/woff2");
  await expect(preload).toHaveAttribute("crossorigin", "");
  const href = await preload.getAttribute("href");
  expect(href).toMatch(/schibsted-grotesk-latin-700-normal.*\.woff2$/);
  const face = await page.evaluate((href) => {
    for (const sheet of [...document.styleSheets]) {
      for (const rule of [...sheet.cssRules]) {
        if (rule instanceof CSSFontFaceRule && rule.style.getPropertyValue("font-family").includes("Schibsted Grotesk")) {
          return { src: rule.style.getPropertyValue("src"), display: rule.style.getPropertyValue("font-display") };
        }
      }
    }
    return null;
  }, href);
  expect(face?.display).toBe("optional");
  expect(face?.src).toContain(href!);
});

test.describe("mobile bottom bar", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile only");

  test("scroll padding keeps focused elements clear of the bar", async ({ page }) => {
    await page.goto("/");
    const pad = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).scrollPaddingBottom));
    const bar = (await page.getByTestId("bottom-bar").boundingBox())!;
    expect(pad).toBeGreaterThanOrEqual(bar.height);
  });

  test("at 200% text the bar still never covers the footer", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => (document.documentElement.style.fontSize = "200%"));
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(100);
    const footer = (await page.locator("footer").boundingBox())!;
    const bar = (await page.getByTestId("bottom-bar").boundingBox())!;
    expect(footer.y + footer.height).toBeLessThanOrEqual(bar.y + 1);
  });
});
