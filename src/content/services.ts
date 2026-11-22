import type { Price } from "../lib/price";

/**
 * Productised services. Prices approved by Melvine on 2026-11-22 (researched beginner rates).
 * `forWho`, `includes` and `timeline` are drafted for Melvine's review: keep `draft: true` until he approves them;
 * `npm run build:prod` refuses to build while any draft remains.
 */
export interface Service {
  id: "starter" | "sprint" | "build";
  name: string;
  forWho: string;
  includes: string[];
  timeline: string;
  price: { local: Price; international: Price };
  addOn: { label: string; price: Price } | null;
  draft: boolean;
}

export const RUNNING_COSTS = "Running costs (WhatsApp message fees, AI usage, hosting) are billed at cost.";

export const SERVICES: Service[] = [
  {
    id: "starter",
    name: "WhatsApp AI Agent Starter",
    forWho: "Shops, rentals and service businesses that answer the same WhatsApp questions every day.",
    includes: [
      "Answers your common customer questions on WhatsApp, day and night",
      "Hands the chat to you when a person is needed: bookings, complaints, anything it isn't sure about",
      "Set up on your WhatsApp Business number with your prices, hours, location and FAQs",
      "A short guide for you and 2 weeks of fixes after launch",
    ],
    timeline: "About 1–2 weeks",
    price: { local: { amount: 25000, currency: "KES" }, international: { amount: 250, currency: "USD" } },
    addOn: null,
    draft: false,
  },
  {
    id: "sprint",
    name: "Automation Sprint",
    forWho: "Teams losing hours to copy-and-paste work between forms, spreadsheets and messages.",
    includes: [
      "One workflow automated end to end, for example form to spreadsheet to WhatsApp or email alert",
      "A short call to map the steps before any building",
      "A demo, handover notes and an off switch you control",
      "2 weeks of fixes after handover",
    ],
    timeline: "About 1 week",
    price: { local: { amount: 20000, currency: "KES" }, international: { amount: 300, currency: "USD" } },
    addOn: null,
    draft: false,
  },
  {
    id: "build",
    name: "Web/App Build",
    forWho: "Businesses that need a fast website or simple web app that works well on phones.",
    includes: [
      "Mobile-first site or app, built to load fast on slow connections",
      "A simple admin so you can update prices, photos and text yourself",
      "Basic search-engine setup and visitor stats",
      "Weekly progress demos while it's being built",
    ],
    timeline: "About 2–4 weeks",
    price: { local: { amount: 35000, currency: "KES" }, international: { amount: 400, currency: "USD" } },
    addOn: { label: "M-Pesa checkout", price: { amount: 20000, currency: "KES" } },
    draft: false,
  },
];
