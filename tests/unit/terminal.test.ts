import { describe, it, expect } from "vitest";
import { runCommand, type TerminalData } from "../../src/lib/terminal";

const data: TerminalData = {
  name: "Melvine Jerry",
  oneLiner: "I build AI agents, automations and web apps.",
  proof: ["Diploma in Software Engineering", "BSc Electronics & Computer Engineering (in progress)"],
  timezone: "EAT (UTC+3)",
  work: [
    { project: "Luxe Condos", status: "In development · agent live January 2027", href: "/work/luxe-condos" },
    { project: "Opportunity Finder", status: "Live", href: "/work/opportunity-finder" },
    { project: "Applaude", status: "In development", href: "/work/applaude" },
  ],
  services: [
    { name: "WhatsApp AI Agent Starter", local: "KES 25,000", international: "USD 250" },
  ],
  whatsapp: "https://wa.me/254110753069",
  email: "melvinambwere@gmail.com",
  booking: "mailto:melvinambwere@gmail.com?subject=15-min%20call%20request",
};
const text = (r: ReturnType<typeof runCommand>) => r.lines.map((l) => l.map((s) => s.text).join(""));

describe("runCommand", () => {
  it("help lists every command", () => {
    const out = text(runCommand("help", data, "local")).join("\n");
    for (const c of ["help", "whoami", "projects", "hire", "contact", "theme", "motion", "clear", "exit"]) expect(out).toContain(c);
  });
  it("whoami", () => {
    expect(text(runCommand("whoami", data, "local"))).toEqual([
      "Melvine Jerry. I build AI agents, automations and web apps.",
      "Diploma in Software Engineering",
      "BSc Electronics & Computer Engineering (in progress)",
      "Based in Kenya, EAT (UTC+3).",
    ]);
  });
  it("projects link to case studies", () => {
    const r = runCommand("projects", data, "local");
    expect(r.lines).toHaveLength(3);
    expect(r.lines.map((l) => l.find((s) => s.href)?.href)).toEqual(["/work/luxe-condos", "/work/opportunity-finder", "/work/applaude"]);
    expect(text(r)[1]).toContain("Live");
  });
  it("hire uses the visitor's currency", () => {
    const local = text(runCommand("hire", data, "local")).join("\n");
    expect(local).toContain("From KES 25,000");
    expect(local).not.toContain("USD");
    const intl = text(runCommand("hire", data, "international")).join("\n");
    expect(intl).toContain("From USD 250");
    expect(intl).not.toContain("KES");
    const last = runCommand("hire", data, "local").lines.at(-1)!;
    expect(last.some((s) => s.href === data.whatsapp)).toBe(true);
    expect(runCommand("hire", data, "international").lines.at(-1)!.some((s) => s.href === `mailto:${data.email}`)).toBe(true);
  });
  it("contact links", () => {
    const hrefs = runCommand("contact", data, "local").lines.flat().map((s) => s.href).filter(Boolean);
    expect(hrefs).toEqual([data.whatsapp, `mailto:${data.email}`, data.booking]);
  });
  it("effects", () => {
    expect(runCommand("clear", data, "local").effect).toBe("clear");
    expect(runCommand("exit", data, "local").effect).toBe("exit");
    expect(runCommand("theme", data, "local").effect).toBe("toggle-theme");
    expect(runCommand("motion", data, "local").effect).toBe("toggle-motion");
  });
  it("trims, lower-cases, ignores empty input, and rejects unknown commands", () => {
    expect(text(runCommand("  WHOAMI ", data, "local"))[0]).toContain("Melvine Jerry");
    expect(runCommand("   ", data, "local").lines).toEqual([]);
    expect(text(runCommand("sudo rm", data, "local"))).toEqual(["command not found: sudo rm. Type help."]);
  });
});
