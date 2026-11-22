import { test, expect } from "@playwright/test";

test("picking the section you're already on still scrolls to it", async ({ page, isMobile }) => {
  await page.goto("/#work");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
  else await page.keyboard.press("Control+k");
  await page.getByRole("option", { name: "Work", exact: true }).click();
  await expect.poll(() => page.evaluate(() => Math.abs(document.getElementById("work")!.getBoundingClientRect().top))).toBeLessThan(60);
  expect(await page.evaluate(() => location.hash)).toBe("#work");
});

test("after a jump, focus moves to the target section", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
  else await page.keyboard.press("Control+k");
  await page.getByRole("option", { name: "Services" }).click();
  await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest("#services"))).toBe(true);
});

test("Escape still returns focus to the button that opened the menu", async ({ page, isMobile }) => {
  test.skip(!isMobile, "phone variant; desktop covered in palette.spec");
  await page.goto("/");
  const btn = page.getByRole("button", { name: "Open menu" });
  await btn.click();
  await page.keyboard.press("Escape");
  await expect(btn).toBeFocused();
});

test("listbox only contains labelled groups of options", async ({ page }) => {
  await page.goto("/");
  const structure = await page.locator("#palette-list").evaluate((list) => ({
    childRoles: [...list.children].map((c) => c.getAttribute("role")),
    groupLabels: [...list.querySelectorAll("[role=group]")].map((g) => document.getElementById(g.getAttribute("aria-labelledby")!)?.textContent?.trim()),
    strayText: [...list.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim() !== ""),
  }));
  expect(new Set(structure.childRoles)).toEqual(new Set(["group"]));
  expect(structure.groupLabels).toEqual(["Go to", "Case studies", "Contact", "Display", "Extras"]);
  expect(structure.strayText).toBe(false);
});
