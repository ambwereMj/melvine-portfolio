// Usage: node scripts/screenshots.mjs <outDir>  (expects `astro preview --host 127.0.0.1` on :4321)
// Captures 375/1440 × dark/light with a Nairobi timezone, plus 1440 dark with a London timezone.
import { chromium } from "@playwright/test";
const out = process.argv[2] ?? "screenshots";
const shots = [
  ...[375, 1440].flatMap((w) => ["dark", "light"].map((scheme) => ({ w, scheme, tz: "Africa/Nairobi", name: `${w}-${scheme}` }))),
  { w: 1440, scheme: "dark", tz: "Europe/London", name: "1440-dark-international" },
  { w: 375, scheme: "dark", tz: "Europe/London", name: "375-dark-international" },
];
const browser = await chromium.launch();
for (const { w, scheme, tz, name } of shots) {
  const mobile = w < 1024;
  const ctx = await browser.newContext({
    viewport: { width: w, height: mobile ? 812 : 900 }, colorScheme: scheme, timezoneId: tz,
    isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1,
  });
  const page = await ctx.newPage();
  await page.goto("http://127.0.0.1:4321/");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${out}/${name}.png` });
  await ctx.close();
}
await browser.close();
