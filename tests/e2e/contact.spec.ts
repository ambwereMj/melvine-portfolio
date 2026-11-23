import { test, expect, type Page, type Browser } from "@playwright/test";

const form = (page: Page) => page.locator("form#contact-form");

async function open(browser: Browser, opts: Record<string, unknown>, isMobile: boolean) {
  const ctx = await browser.newContext({ ...opts, isMobile, hasTouch: isMobile, viewport: isMobile ? { width: 375, height: 812 } : { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    (window as any).__opened = [];
    window.open = ((url: string) => { (window as any).__opened.push(url); return null; }) as typeof window.open;
  });
  await page.goto("/#contact");
  return { ctx, page };
}

async function fill(page: Page, need = "A booking bot for 3 rooms & a menu #1") {
  await page.getByLabel("Your name").fill("Wanjiru");
  await page.getByLabel("WhatsApp number or email").fill("+254 700 000000");
  await page.getByLabel("What do you need?").fill(need);
}

test("direct options are visible in the visitor's order", async ({ browser, isMobile }) => {
  const local = await open(browser, { timezoneId: "Africa/Nairobi" }, isMobile);
  const names = (p: Page) => p.locator("#contact [data-for] a").evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetParent).map((e) => e.textContent!.trim()));
  expect(await names(local.page)).toEqual(["Chat on WhatsApp", "Book a 15-min call"]);
  await expect(local.page.locator("#contact").getByRole("link", { name: "melvinambwere@gmail.com" })).toBeVisible();
  await local.ctx.close();
  const intl = await open(browser, { timezoneId: "Europe/London" }, isMobile);
  expect(await names(intl.page)).toEqual(["Book a 15-min call", "Chat on WhatsApp"]);
  await intl.ctx.close();
});

test("empty submit shows linked, announced errors and focuses the first field", async ({ browser, isMobile }) => {
  const { ctx, page } = await open(browser, {}, isMobile);
  await form(page).getByRole("button", { name: "Send" }).click();
  const name = page.getByLabel("Your name");
  await expect(name).toBeFocused();
  for (const label of ["Your name", "WhatsApp number or email", "What do you need?"]) {
    const field = page.getByLabel(label);
    await expect(field).toHaveAttribute("aria-invalid", "true");
    const id = await field.getAttribute("aria-describedby");
    await expect(page.locator(`#${id}`)).not.toHaveText("");
  }
  await ctx.close();
});

test("without a Web3Forms key, Send opens WhatsApp with everything typed", async ({ browser, isMobile }) => {
  const { ctx, page } = await open(browser, { timezoneId: "Africa/Nairobi" }, isMobile);
  await fill(page);
  await form(page).locator('select[name="budget_kes"]').selectOption("KES 20,000–50,000");
  await form(page).getByRole("button", { name: "Send" }).click();
  const opened: string[] = await page.evaluate(() => (window as any).__opened);
  expect(opened).toHaveLength(1);
  const text = decodeURIComponent(opened[0].split("?text=")[1]);
  expect(text).toContain("I need: A booking bot for 3 rooms & a menu #1");
  expect(text).toContain("Budget: KES 20,000–50,000");
  expect(text).toContain("Name: Wanjiru");
  await expect(page.locator("#contact-status")).toContainText("Opening WhatsApp with your message…");
  // In-app browsers may block the popup: a visible link must carry the same message.
  expect(decodeURIComponent((await page.locator("#contact-status").getByRole("link").getAttribute("href"))!)).toContain("A booking bot for 3 rooms");
  await ctx.close();
});

test("budget choices follow the visitor's currency", async ({ browser, isMobile }) => {
  const local = await open(browser, { timezoneId: "Africa/Nairobi" }, isMobile);
  await expect(form(local.page).locator('select[name="budget_kes"]')).toBeVisible();
  await expect(form(local.page).locator('select[name="budget_usd"]')).toBeHidden();
  await local.ctx.close();
  const intl = await open(browser, { timezoneId: "Europe/London" }, isMobile);
  await expect(form(intl.page).locator('select[name="budget_usd"]')).toBeVisible();
  await expect(form(intl.page).locator('select[name="budget_kes"]')).toBeHidden();
  await intl.ctx.close();
});

test.describe("with a Web3Forms key (mocked API)", () => {
  const withKey = async (page: Page) => page.evaluate(() => { (document.querySelector("#contact-form") as HTMLFormElement).dataset.key = "test-key"; });

  test("success message", async ({ browser, isMobile }) => {
    const { ctx, page } = await open(browser, {}, isMobile);
    await page.route("https://api.web3forms.com/submit", (r) => r.fulfill({ status: 200, contentType: "application/json", body: '{"success":true}' }));
    await withKey(page);
    await fill(page);
    await form(page).getByRole("button", { name: "Send" }).click();
    await expect(page.locator("#contact-status")).toHaveText("Thanks, I'll reply within 12 hours.");
    await ctx.close();
  });

  test("failure offers WhatsApp with the message", async ({ browser, isMobile }) => {
    const { ctx, page } = await open(browser, {}, isMobile);
    await page.route("https://api.web3forms.com/submit", (r) => r.fulfill({ status: 500, body: "" }));
    await withKey(page);
    await fill(page);
    await form(page).getByRole("button", { name: "Send" }).click();
    const status = page.locator("#contact-status");
    await expect(status).toContainText("That didn't send. Please message me on WhatsApp instead.");
    expect(decodeURIComponent((await status.getByRole("link").getAttribute("href"))!)).toContain("A booking bot for 3 rooms");
    await ctx.close();
  });

  test("a request that never answers times out and offers WhatsApp", async ({ browser, isMobile }) => {
    const { ctx, page } = await open(browser, {}, isMobile);
    await page.route("https://api.web3forms.com/submit", () => { /* never respond */ });
    await withKey(page);
    await page.evaluate(() => { (document.querySelector("#contact-form") as HTMLFormElement).dataset.timeoutMs = "500"; });
    await fill(page);
    await form(page).getByRole("button", { name: "Send" }).click();
    await expect(page.locator("#contact-status")).toContainText("That didn't send.", { timeout: 5000 });
    await expect(form(page).getByRole("button", { name: "Send" })).toBeEnabled();
    await ctx.close();
  });

  test("slow network: button disabled and exactly one request", async ({ browser, isMobile }) => {
    const { ctx, page } = await open(browser, {}, isMobile);
    let calls = 0;
    await page.route("https://api.web3forms.com/submit", async (r) => { calls++; await new Promise((res) => setTimeout(res, 800)); await r.fulfill({ status: 200, contentType: "application/json", body: '{"success":true}' }); });
    await withKey(page);
    await fill(page);
    const send = form(page).getByRole("button", { name: /Send/ });
    await send.click();
    await expect(send).toBeDisabled();
    await send.click({ force: true }).catch(() => {});
    await expect(page.locator("#contact-status")).toHaveText("Thanks, I'll reply within 12 hours.");
    expect(calls).toBe(1);
    await ctx.close();
  });
});

test("without JavaScript the form is hidden and direct links remain", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(form(page)).toBeHidden();
  await expect(page.locator("#contact").getByRole("link", { name: "Chat on WhatsApp" })).toBeVisible();
  await ctx.close();
});

test("/thanks page", async ({ page }) => {
  const res = await page.goto("/thanks");
  expect(res?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveText("Thanks for getting in touch");
});

test("no placeholder sections remain on the home page", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("main")).not.toContainText("arrives in Stage");
});
