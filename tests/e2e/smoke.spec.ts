import { test, expect } from "@playwright/test";

test("home renders", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);
  await expect(page.locator('html[lang="en"]')).toHaveCount(1);
});
