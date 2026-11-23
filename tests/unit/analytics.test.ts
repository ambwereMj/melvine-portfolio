// @vitest-environment happy-dom
import { it, expect } from "vitest";
import { eventFromElement } from "../../src/lib/analytics";

const dom = (html: string) => { document.body.innerHTML = html; return document.body; };

it("reads name, location and service from the closest tracked element", () => {
  const b = dom(`<a data-event="quote-click" data-event-location="services" data-event-service="Automation Sprint"><span id="t">Get a quote</span></a>`);
  expect(eventFromElement(b.querySelector("#t")!)).toEqual({ name: "quote-click", data: { location: "services", service: "Automation Sprint" } });
});
it("nested tracked elements resolve to the closest one only", () => {
  const b = dom(`<div data-event="outer" data-event-location="x"><a id="a" data-event="whatsapp-click" data-event-location="hero">x</a></div>`);
  expect(eventFromElement(b.querySelector("#a")!)?.name).toBe("whatsapp-click");
});
it("untracked elements give null", () => {
  const b = dom(`<a id="a" href="#">x</a>`);
  expect(eventFromElement(b.querySelector("#a")!)).toBeNull();
});
