import { test, expect } from "@playwright/test";
import { PROCESS } from "../../src/content/process";

test("How I work shows four ordered steps and three facts", async ({ page }) => {
  await page.goto("/");
  const steps = page.locator("#process ol > li");
  await expect(steps).toHaveCount(4);
  await expect(steps.locator("h3")).toHaveText(PROCESS.steps.map((s) => s.title));
  for (const f of PROCESS.facts) await expect(page.locator("#process")).toContainText(f);
});

test("About has three paragraphs, no image and no CV link yet", async ({ page }) => {
  await page.goto("/");
  const about = page.locator("#about");
  await expect(about.locator("p[data-about]")).toHaveCount(3);
  await expect(about.locator("img")).toHaveCount(0);
  await expect(about).toContainText("CV coming soon");
  await expect(about.getByRole("link", { name: /CV/ })).toHaveCount(0);
});

test("no Stage placeholders remain in these sections", async ({ page }) => {
  await page.goto("/");
  for (const id of ["#process", "#about"]) await expect(page.locator(id)).not.toContainText("arrives in Stage");
});
