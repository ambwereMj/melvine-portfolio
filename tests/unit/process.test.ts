import { it, expect } from "vitest";
import { PROCESS } from "../../src/content/process";
import { PROFILE } from "../../src/content/profile";

it("process steps and facts", () => {
  expect(PROCESS.steps.map((s) => s.title)).toEqual(["A short call", "A scoped quote", "Build with weekly demos", "Handover and support"]);
  for (const s of PROCESS.steps) expect(s.detail.length).toBeGreaterThan(0);
  expect(PROCESS.facts).toEqual(["EAT (UTC+3)", "Replies within 12 hours", "Pay via M-Pesa (local) or Wise/Payoneer (international)"]);
});

it("about has three paragraphs and no photo yet", () => {
  expect(PROFILE.about).toHaveLength(3);
  expect(PROFILE.photo).toBeNull();
});
