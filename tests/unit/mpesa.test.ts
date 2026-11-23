import { it, expect } from "vitest";
import { mpesaLines } from "../../src/lib/mpesa";

it("till", () => expect(mpesaLines({ kind: "till", number: "123456" })).toEqual([{ label: "Till number", value: "123456" }]));
it("paybill", () =>
  expect(mpesaLines({ kind: "paybill", number: "222111", account: "MJ" })).toEqual([
    { label: "Paybill", value: "222111" },
    { label: "Account", value: "MJ" },
  ]));
it("send money", () =>
  expect(mpesaLines({ kind: "send-money", number: "0700 000000", name: "Melvine Jerry" })).toEqual([
    { label: "Send Money to", value: "0700 000000" },
    { label: "Name", value: "Melvine Jerry" },
  ]));
it("paybill without an account is rejected", () => expect(() => mpesaLines({ kind: "paybill", number: "222111" })).toThrow());
it("send money without a name is rejected", () => expect(() => mpesaLines({ kind: "send-money", number: "0700" })).toThrow());
