import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.skip(({ isMobile }) => isMobile, "desktop project is enough for these checks");

for (const scheme of ["dark", "light"] as const) {
  test(`axe clean with the palette open (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/");
    await page.keyboard.press("Control+k");
    const r = await new AxeBuilder({ page }).include("#palette").analyze();
    expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });

  test(`axe clean with the terminal open (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/");
    await page.keyboard.press("Control+k");
    await page.getByRole("combobox").fill("terminal");
    await page.keyboard.press("Enter");
    const input = page.getByRole("textbox", { name: "melvine@portfolio:~$" });
    await input.fill("projects");
    await input.press("Enter");
    const r = await new AxeBuilder({ page }).include("#palette").analyze();
    expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });
}
