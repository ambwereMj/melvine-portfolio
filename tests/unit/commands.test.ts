import { it, expect } from "vitest";
import { buildCommands, matches } from "../../src/lib/commands";

const work = [
  { id: "luxe-condos", project: "Luxe Condos" },
  { id: "opportunity-finder", project: "Opportunity Finder" },
  { id: "applaude", project: "Applaude" },
];
const home = buildCommands({ pathname: "/", work });
const find = (label: string) => home.find((c) => c.label === label)!;

it("groups come in the agreed order", () => {
  const groups = [...new Set(home.map((c) => c.group))];
  expect(groups).toEqual(["Go to", "Case studies", "Contact", "Display", "Extras"]);
});
it("section links are in-page on home and absolute elsewhere", () => {
  expect(home[0]).toMatchObject({ label: "Home", href: "#hero" });
  expect(buildCommands({ pathname: "/work/applaude", work })[0].href).toBe("/#hero");
});
it("case studies are labelled by project and link to their pages", () => {
  expect(home.filter((c) => c.group === "Case studies").map((c) => [c.label, c.href])).toEqual([
    ["Luxe Condos", "/work/luxe-condos/"],
    ["Opportunity Finder", "/work/opportunity-finder/"],
    ["Applaude", "/work/applaude/"],
  ]);
});
it("contact and display actions", () => {
  expect(find("Chat on WhatsApp").href).toMatch(/^https:\/\/wa\.me\//);
  expect(find("Copy email address").action).toBe("copy-email");
  expect(home.filter((c) => c.group === "Display").map((c) => c.action)).toEqual(["toggle-theme", "toggle-motion"]);
  expect(find("Open terminal").action).toBe("open-terminal");
});
it("matching", () => {
  const labels = (q: string) => home.filter((c) => matches(c, q)).map((c) => c.label);
  expect(labels("wa")).toContain("Chat on WhatsApp");
  expect(labels("work")).toEqual(expect.arrayContaining(["Work", "Luxe Condos", "Opportunity Finder", "Applaude"]));
  expect(labels("serv")).toEqual(["Services"]);
  expect(labels("zzz")).toEqual([]);
  expect(labels("").length).toBe(home.length);
  expect(labels("LIGHT theme").length).toBe(1);
});
