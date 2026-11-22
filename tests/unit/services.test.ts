import { it, expect } from "vitest";
import { SERVICES, RUNNING_COSTS } from "../../src/content/services";

it("names and order", () => {
  expect(SERVICES.map((s) => s.name)).toEqual(["WhatsApp AI Agent Starter", "Automation Sprint", "Web/App Build"]);
});

it("approved prices", () => {
  expect(SERVICES.map((s) => [s.price.local, s.price.international])).toEqual([
    [{ amount: 25000, currency: "KES" }, { amount: 250, currency: "USD" }],
    [{ amount: 20000, currency: "KES" }, { amount: 300, currency: "USD" }],
    [{ amount: 35000, currency: "KES" }, { amount: 400, currency: "USD" }],
  ]);
});

it("M-Pesa add-on only on the build", () => {
  expect(SERVICES[2].addOn).toEqual({ label: "M-Pesa checkout", price: { amount: 20000, currency: "KES" } });
  expect(SERVICES[0].addOn).toBeNull();
  expect(SERVICES[1].addOn).toBeNull();
});

it("running costs copy", () => {
  expect(RUNNING_COSTS).toBe("Running costs (WhatsApp message fees, AI usage, hosting) are billed at cost.");
});

it("every service has content", () => {
  for (const s of SERVICES) {
    expect(s.includes.length).toBeGreaterThan(0);
    expect(s.timeline).not.toBe("");
    expect(s.forWho).not.toBe("");
  }
});
