/** How I work. Step titles and facts come from Melvine's brief; the step details are drafted for his review. */
export interface Process { steps: { title: string; detail: string }[]; facts: string[]; draft: boolean }

export const PROCESS: Process = {
  steps: [
    { title: "A short call", detail: "A 15-minute call to understand what you need and whether I'm the right fit." },
    { title: "A scoped quote", detail: "A written quote with what's included, the timeline and the price, before any work starts." },
    { title: "Build with weekly demos", detail: "You see working progress every week, so we can change direction early instead of late." },
    { title: "Handover and support", detail: "You get the working system, short handover notes, and the support agreed in your quote." },
  ],
  facts: ["EAT (UTC+3)", "Replies within 12 hours", "Pay via M-Pesa (local) or Wise/Payoneer (international)"],
  draft: false,
};
