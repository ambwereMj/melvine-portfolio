import { describe, it, expect } from "vitest";
import { PROFILE, badgeText, proofItems } from "../../src/content/profile";

describe("PROFILE copy", () => {
  it("headline and reassurance are verbatim", () => {
    expect(PROFILE.headline).toBe("WhatsApp AI agents for businesses that can't afford to miss a message.");
    expect(PROFILE.subline).toBe("I also build automations and web apps that save your team hours.");
    expect(PROFILE.reassurance).toBe("Replies within 12 hours · Pay via M-Pesa, Wise or Payoneer · Weekly progress demos");
  });
  it("unknown facts are null, never invented", () => {
    expect(PROFILE.availability).toEqual({ month: "December", slots: null, validUntil: "2026-12-31" });
    expect(PROFILE.agentsShipped).toBeNull();
    expect(PROFILE.clientQuote).toBeNull();
    expect(PROFILE.cvUrl).toBeNull();
  });
});

describe("badgeText", () => {
  const tz = "EAT (UTC+3)";
  it("unknown capacity", () => {
    expect(badgeText({ month: "December", slots: null }, tz)).toBe("Booking projects for December · EAT (UTC+3)");
  });
  it("plural", () => {
    expect(badgeText({ month: "December", slots: 2 }, tz)).toBe("Available for 2 projects in December · EAT (UTC+3)");
  });
  it("singular", () => {
    expect(badgeText({ month: "December", slots: 1 }, tz)).toBe("Available for 1 project in December · EAT (UTC+3)");
  });
});

describe("proofItems", () => {
  const base = { ...PROFILE };
  it("omits agents when unknown", () => {
    expect(proofItems({ ...base, agentsShipped: null })).toEqual([
      "Diploma in Software Engineering",
      "BSc Electronics & Computer Engineering (in progress)",
    ]);
  });
  it("adds plural agents", () => {
    expect(proofItems({ ...base, agentsShipped: 3 })[2]).toBe("3 agents shipped");
  });
  it("adds singular agent", () => {
    expect(proofItems({ ...base, agentsShipped: 1 })[2]).toBe("1 agent shipped");
  });
});
