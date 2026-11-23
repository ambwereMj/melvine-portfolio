import { test, expect } from "@playwright/test";

test("work card links name the project for screen readers", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#work article").getByRole("link", { name: /^Luxe Condos: / })).toHaveCount(1);
});

test("focused card link shows its own outline (no :has() needed)", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard");
  await page.goto("/");
  const link = page.locator("#work article a").first();
  await link.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  expect(await link.evaluate((e) => getComputedStyle(e, "::after").outlineStyle)).not.toBe("none");
});

test("terminal data contains no raw '<'", async ({ page }) => {
  await page.goto("/");
  expect(await page.locator("#terminal-data").evaluate((e) => e.innerHTML.includes("<"))).toBe(false);
});

test("message box is limited to 2000 characters", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByLabel("What do you need?")).toHaveAttribute("maxlength", "2000");
});

test.describe("Web3Forms responses", () => {
  test.skip(({ isMobile }) => isMobile, "desktop is enough");
  const prep = async (page: import("@playwright/test").Page, contact: string, body: string, seen: string[]) => {
    await page.route("https://api.web3forms.com/submit", async (r) => { seen.push(r.request().postData() ?? ""); await r.fulfill({ status: 200, contentType: "application/json", body }); });
    await page.goto("/#contact");
    await page.evaluate(() => { (document.querySelector("#contact-form") as HTMLFormElement).dataset.key = "k"; });
    await page.getByLabel("Your name").fill("A");
    await page.getByLabel("WhatsApp number or email").fill(contact);
    await page.getByLabel("What do you need?").fill("x");
    await page.getByRole("button", { name: "Send" }).click();
  };
  test("success:false is treated as a failure", async ({ page }) => {
    const seen: string[] = [];
    await prep(page, "a@b.co", '{"success":false}', seen);
    await expect(page.locator("#contact-status")).toContainText("That didn't send.");
  });
  test("replyto is set for an email contact only", async ({ page }) => {
    const seen: string[] = [];
    await prep(page, "a@b.co", '{"success":true}', seen);
    await expect(page.locator("#contact-status")).toHaveText("Thanks, I'll reply within 12 hours.");
    expect(JSON.parse(seen[0]).replyto).toBe("a@b.co");
  });
  test("no replyto for a phone number", async ({ page }) => {
    const seen: string[] = [];
    await prep(page, "+254 700 000000", '{"success":true}', seen);
    await expect(page.locator("#contact-status")).toHaveText("Thanks, I'll reply within 12 hours.");
    expect(JSON.parse(seen[0]).replyto).toBeUndefined();
  });
});

test("landing on /#contact causes no layout shift", async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).__cls = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries() as any[]) if (!e.hadRecentInput) (window as any).__cls += e.value; }).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto("/#contact");
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => (window as any).__cls)).toBeLessThanOrEqual(0.01);
});

test("copy-email fallback field is hidden again when the palette reopens", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard");
  await page.addInitScript(() => { Object.defineProperty(navigator, "clipboard", { get: () => ({ writeText: () => Promise.reject(new Error("blocked")) }) }); });
  await page.goto("/");
  await page.keyboard.press("Control+k");
  await page.getByRole("combobox", { name: "Search or type a command" }).fill("copy email");
  await page.keyboard.press("Enter");
  const field = page.locator("[data-copy-fallback]");
  await expect(field).not.toHaveClass(/sr-only/);
  await page.keyboard.press("Escape");
  await page.keyboard.press("Control+k");
  await expect(field).toHaveClass(/sr-only/);
});
