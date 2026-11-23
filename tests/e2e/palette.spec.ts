import { test, expect, type Page } from "@playwright/test";

const dialog = (page: Page) => page.locator("dialog#palette");
const isOpen = (page: Page) => dialog(page).evaluate((d: HTMLDialogElement) => d.open);
const visibleOptions = (page: Page) =>
  page.locator("#palette-list [role=option]").evaluateAll((els) => els.filter((e) => !(e as HTMLElement).hidden).map((e) => e.textContent!.trim()));

test.describe("desktop", () => {
  test.skip(({ isMobile }) => isMobile, "keyboard shortcuts on desktop");

  test("Ctrl+K and Meta+K toggle the palette", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Control+k");
    expect(await isOpen(page)).toBe(true);
    await expect(page.getByRole("combobox", { name: "Search or type a command" })).toBeFocused();
    await page.keyboard.press("Control+k");
    expect(await isOpen(page)).toBe(false);
    await page.keyboard.press("Meta+k");
    expect(await isOpen(page)).toBe(true);
  });

  test("sidebar button opens it and Escape returns focus there", async ({ page }) => {
    await page.goto("/");
    const btn = page.getByRole("button", { name: "Search and jump" });
    await btn.click();
    expect(await isOpen(page)).toBe(true);
    await page.keyboard.press("Escape");
    expect(await isOpen(page)).toBe(false);
    await expect(btn).toBeFocused();
  });

  test("filtering, empty state and active descendant", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Control+k");
    const input = page.getByRole("combobox", { name: "Search or type a command" });
    await input.fill("serv");
    expect(await visibleOptions(page)).toEqual(["Services"]);
    const active = await input.getAttribute("aria-activedescendant");
    await expect(page.locator(`#${active}`)).toHaveAttribute("aria-selected", "true");
    await input.fill("zzz");
    expect(await visibleOptions(page)).toEqual([]);
    await expect(dialog(page)).toContainText("No matches. Try “work” or “contact”.");
  });

  test("arrow keys and Enter navigate to a section and close the palette", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Control+k");
    await page.keyboard.press("ArrowDown"); // Home -> Work
    await page.keyboard.press("Enter");
    expect(await isOpen(page)).toBe(false);
    await expect.poll(() => page.evaluate(() => location.hash)).toBe("#work");
  });

  test("ArrowUp from the first option wraps to the last", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Control+k");
    await page.keyboard.press("ArrowUp");
    const id = await page.getByRole("combobox", { name: "Search or type a command" }).getAttribute("aria-activedescendant");
    await expect(page.locator(`#${id}`)).toHaveText("Open terminal");
  });

  test("Copy email address announces success", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");
    await page.keyboard.press("Control+k");
    await page.getByRole("combobox", { name: "Search or type a command" }).fill("copy email");
    await page.keyboard.press("Enter");
    await expect(page.locator("#palette-status")).toHaveText("Email address copied");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("melvinambwere@gmail.com");
  });

  test("theme command flips the theme and keeps the sidebar toggle in sync", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await page.keyboard.press("Control+k");
    await page.getByRole("combobox", { name: "Search or type a command" }).fill("light theme");
    await page.keyboard.press("Enter");
    expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe("light");
    await expect(page.getByTestId("sidebar").getByRole("button", { name: "Light theme" })).toHaveAttribute("aria-pressed", "true");
  });

  test("works on case-study pages: Home goes back to the home page", async ({ page }) => {
    await page.goto("/work/applaude");
    await page.keyboard.press("Control+k");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/#hero$/);
  });

  test("closed palette is not in the tab order", async ({ page }) => {
    await page.goto("/");
    const inside = await page.evaluate(() => {
      const input = document.querySelector("#palette input") as HTMLElement;
      input.focus();
      return document.activeElement === input;
    });
    expect(inside).toBe(false);
  });
});

test.describe("phone", () => {
  test.skip(({ isMobile }) => !isMobile, "phone only");

  test("Open menu shows every section without focusing the search box", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    expect(await isOpen(page)).toBe(true);
    await expect(page.locator("#palette-title")).toBeFocused();
    expect(await visibleOptions(page)).toEqual(expect.arrayContaining(["Home", "Work", "Services", "How I work", "About", "Lab", "Contact"]));
  });

  test("tapping a section navigates and closes", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("option", { name: "Services" }).click();
    expect(await isOpen(page)).toBe(false);
    await expect.poll(() => page.evaluate(() => location.hash)).toBe("#services");
  });
});
