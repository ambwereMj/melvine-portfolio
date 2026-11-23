import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { parse } from "yaml";

const SLUGS = ["opportunity-finder-for-zero", "building-this-portfolio"];
const fm = (slug: string) => parse(readFileSync(`src/content/notes/${slug}.md`, "utf8").split(/^---\r?\n/m)[1]);

test("#lab lists both notes with date and summary", async ({ page }) => {
  await page.goto("/");
  const items = page.locator("#lab li");
  await expect(items).toHaveCount(2);
  for (const slug of SLUGS) {
    const item = page.locator(`#lab li:has(a[href="/lab/${slug}/"])`);
    await expect(item).toContainText(fm(slug).title);
    await expect(item).toContainText(fm(slug).summary);
    await expect(item.locator("time")).toHaveAttribute("datetime", /^\d{4}-\d{2}-\d{2}/);
  }
  await expect(page.locator("#lab")).not.toContainText("arrives in Stage");
});

for (const slug of SLUGS) {
  test(`/lab/${slug} has its own title, description, one h1 and a way back`, async ({ page }) => {
    const data = fm(slug);
    await page.goto(`/lab/${slug}`);
    await expect(page).toHaveTitle(`${data.title} | Melvine Jerry`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", data.summary);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(data.title);
    await expect(page.getByRole("link", { name: "Back to the Lab" })).toHaveAttribute("href", "/#lab");
  });
}
