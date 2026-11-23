import { test, expect } from "@playwright/test";
import { MPESA_PAYMENT } from "../../src/lib/site";

test("M-Pesa block is absent until details are supplied", async ({ page }) => {
  test.skip(MPESA_PAYMENT !== null, "details supplied; covered by the visible-block test");
  await page.goto("/");
  for (const id of ["#process", "#contact"]) {
    await expect(page.locator(id)).not.toContainText("pay by M-Pesa");
    await expect(page.locator(`${id} [data-mpesa]`)).toHaveCount(0);
  }
});
