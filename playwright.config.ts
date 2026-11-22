import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:4321" },
  webServer: {
    command: "npm run build && npm run preview",
    url: "http://localhost:4321",
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 375, height: 812 } } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
  ],
});
