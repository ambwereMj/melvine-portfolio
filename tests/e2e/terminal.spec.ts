import { test, expect, type Page } from "@playwright/test";

test.skip(({ isMobile }) => isMobile, "keyboard-driven easter egg; desktop project");

async function openTerminal(page: Page) {
  await page.keyboard.press("Control+k");
  await page.getByRole("combobox").fill("terminal");
  await page.keyboard.press("Enter");
  const input = page.getByRole("textbox", { name: "melvine@portfolio:~$" });
  await expect(input).toBeFocused();
  return input;
}
const run = async (page: Page, cmd: string) => {
  const input = page.getByRole("textbox", { name: "melvine@portfolio:~$" });
  await input.fill(cmd);
  await input.press("Enter");
};
const output = (page: Page) => page.getByTestId("terminal-output");

test("whoami prints the sourced bio and the output is announced", async ({ page }) => {
  await page.goto("/");
  await openTerminal(page);
  await expect(output(page)).toHaveAttribute("aria-live", "polite");
  await run(page, "whoami");
  await expect(output(page)).toContainText("Melvine Jerry. I build AI agents, automations and web apps.");
  await expect(output(page)).toContainText("Based in Kenya, EAT (UTC+3).");
});

test("projects renders three working links", async ({ page }) => {
  await page.goto("/");
  await openTerminal(page);
  await run(page, "projects");
  await expect(output(page).locator('a[href^="/work/"]')).toHaveCount(3);
});

test("hire shows local or international prices", async ({ browser }) => {
  for (const [tz, want, not] of [["Africa/Nairobi", "From KES 25,000", "USD"], ["Europe/London", "From USD 250", "KES"]] as const) {
    const ctx = await browser.newContext({ timezoneId: tz, viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("/");
    await openTerminal(page);
    await run(page, "hire");
    await expect(output(page)).toContainText(want);
    await expect(output(page)).not.toContainText(not);
    await ctx.close();
  }
});

test("ArrowUp recalls the previous command", async ({ page }) => {
  await page.goto("/");
  const input = await openTerminal(page);
  await run(page, "help");
  await input.press("ArrowUp");
  await expect(input).toHaveValue("help");
});

test("theme flips the theme and the sidebar toggle stays in sync", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await openTerminal(page);
  await run(page, "theme");
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe("light");
  await expect(page.getByTestId("sidebar").getByRole("button", { name: "Light theme" })).toHaveAttribute("aria-pressed", "true");
});

test("unknown command, clear and exit", async ({ page }) => {
  await page.goto("/");
  await openTerminal(page);
  await run(page, "sudo");
  await expect(output(page)).toContainText("command not found: sudo. Type help.");
  await run(page, "clear");
  await expect(output(page)).toHaveText("");
  await run(page, "exit");
  await expect(page.getByRole("combobox", { name: "Search or type a command" })).toBeFocused();
});
