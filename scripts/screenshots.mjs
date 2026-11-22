// Usage: node scripts/screenshots.mjs <outDir>  (expects `npm run preview` on :4321)
import { chromium } from "@playwright/test";
const out = process.argv[2] ?? "screenshots";
const browser = await chromium.launch();
for (const [w, h, mobile] of [[375, 812, true], [1440, 900, false]]) {
  for (const scheme of ["dark", "light"]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
    const page = await ctx.newPage();
    await page.goto("http://127.0.0.1:4321/");
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${out}/${w}-${scheme}.png` });
    await page.screenshot({ path: `${out}/${w}-${scheme}-full.png`, fullPage: true });
    await ctx.close();
  }
}
await browser.close();
