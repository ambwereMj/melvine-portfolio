import { it, expect } from "vitest";
import { formatPrice } from "../../src/lib/price";

it("formats KES with grouping", () => expect(formatPrice({ amount: 25000, currency: "KES" })).toBe("KES 25,000"));
it("formats USD", () => expect(formatPrice({ amount: 250, currency: "USD" })).toBe("USD 250"));
it("formats large KES", () => expect(formatPrice({ amount: 1250000, currency: "KES" })).toBe("KES 1,250,000"));
