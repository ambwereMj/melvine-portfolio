import { describe, it, expect } from "vitest";
import { audienceFor } from "../../src/lib/audience";

describe("audienceFor", () => {
  it.each(["Africa/Nairobi", "Africa/Lagos", "Africa/Johannesburg"])("%s is local", (tz) => {
    expect(audienceFor(tz)).toBe("local");
  });
  it.each(["Europe/London", "UTC", "Etc/GMT-3", "Asia/Dubai", "America/New_York"])("%s is international", (tz) => {
    expect(audienceFor(tz)).toBe("international");
  });
  it.each(["", null, undefined])("unknown (%s) defaults to local", (tz) => {
    expect(audienceFor(tz)).toBe("local");
  });
});
