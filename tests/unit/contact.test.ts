import { it, expect } from "vitest";
import { budgetOptions, whatsappFallbackUrl, assertFormConfig } from "../../src/lib/contact";
import { SERVICES } from "../../src/content/services";

it("local budget options start at the cheapest local price", () => {
  expect(budgetOptions("local", SERVICES)).toEqual(["Not sure yet", "Under KES 20,000", "KES 20,000–50,000", "KES 50,000–100,000", "Over KES 100,000"]);
});
it("international budget options start at the cheapest international price", () => {
  expect(budgetOptions("international", SERVICES)).toEqual(["Not sure yet", "Under USD 250", "USD 250–500", "USD 500–1,000", "Over USD 1,000"]);
});

it("WhatsApp fallback keeps every character of what was typed", () => {
  const url = whatsappFallbackUrl({ name: "Wanjiru & Co", contact: "+254 700 000000", message: "Bookings bot 🏠 #1\nfor 3 rooms", budget: "KES 20,000–50,000" });
  expect(url.startsWith("https://wa.me/254110753069?text=")).toBe(true);
  const text = decodeURIComponent(url.split("?text=")[1]);
  expect(text).toBe("Hi Melvine, I saw your portfolio. I need: Bookings bot 🏠 #1\nfor 3 rooms · Budget: KES 20,000–50,000 · Deadline: ___\nName: Wanjiru & Co\nContact: +254 700 000000");
});
it("WhatsApp fallback leaves the budget blank to fill when none was chosen", () => {
  const text = decodeURIComponent(whatsappFallbackUrl({ name: "A", contact: "a@b.co", message: "x", budget: "" }).split("?text=")[1]);
  expect(text).toContain("Budget: ___");
});

it("form config guard", () => {
  expect(() => assertFormConfig("abc", "https://example.com")).toThrow(/example\.com/);
  expect(() => assertFormConfig("abc", "https://example.com/")).toThrow();
  expect(() => assertFormConfig(null, "https://example.com")).not.toThrow();
  expect(() => assertFormConfig("abc", "https://melvine.dev")).not.toThrow();
});

import { formAttributes } from "../../src/lib/contact";
it("with a key the form works without JavaScript; without one it stays hidden until JS runs", () => {
  expect(formAttributes("abc", "https://melvine.dev")).toEqual({
    hidden: false,
    action: "https://api.web3forms.com/submit",
    method: "post",
    redirect: "https://melvine.dev/thanks",
  });
  expect(formAttributes(null, "https://example.com")).toEqual({ hidden: true, action: undefined, method: undefined, redirect: undefined });
});
