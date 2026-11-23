import { whatsappFallbackUrl } from "../lib/contact";
import { track } from "../lib/analytics";

const MESSAGES: Record<string, string> = {
  name: "Please enter your name.",
  contact: "Please add a WhatsApp number or email so I can reply.",
  message: "Please tell me what you need.",
};
const SUCCESS = "Thanks, I'll reply within 12 hours.";
const FAILURE = "That didn't send. Please message me on WhatsApp instead.";

/**
 * Progressive enhancement for the contact form. The form is hidden without JS (direct links remain).
 * With a Web3Forms key (data-key) it posts with fetch; without one it opens WhatsApp with what was typed.
 */
export function initContactForm(form: HTMLFormElement): void {
  form.hidden = false;
  form.noValidate = true; // our own messages replace the browser's; without JS, native "required" still applies
  const status = form.querySelector<HTMLElement>("#contact-status")!;
  const button = form.querySelector<HTMLButtonElement>("button[type=submit]")!;
  const fields = ["name", "contact", "message"].map((n) => form.elements.namedItem(n) as HTMLInputElement | HTMLTextAreaElement);
  let sending = false;

  function validate(): boolean {
    let first: HTMLElement | null = null;
    for (const f of fields) {
      const empty = f.value.trim() === "";
      const err = document.getElementById(`${f.id}-error`)!;
      err.textContent = empty ? MESSAGES[f.name] : "";
      f.setAttribute("aria-invalid", String(empty));
      if (empty && !first) first = f;
    }
    first?.focus();
    return first === null;
  }

  function values() {
    const audience = document.documentElement.dataset.audience === "international" ? "usd" : "kes";
    const budget = (form.elements.namedItem(`budget_${audience}`) as HTMLSelectElement).value;
    const [name, contact, message] = fields.map((f) => f.value.trim());
    return { name, contact, message, budget };
  }

  function showWithLink(message: string, url: string) {
    status.replaceChildren(`${message} `);
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = "Open WhatsApp with your message";
    a.className = "inline-flex min-h-[44px] items-center font-semibold text-accent underline underline-offset-4";
    status.append(a);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (sending || !validate()) return;
    const v = values();
    const fallback = whatsappFallbackUrl(v);
    const key = form.dataset.key;

    if (!key) {
      // In-app browsers can block the popup, so the same link is always shown too.
      showWithLink("Opening WhatsApp with your message…", fallback);
      track("contact-send", { method: "whatsapp-fallback", location: "contact" });
      window.open(fallback, "_blank", "noopener");
      return;
    }
    if ((form.elements.namedItem("botcheck") as HTMLInputElement).checked) {
      status.textContent = SUCCESS; // likely a bot: pretend success, send nothing
      return;
    }

    sending = true;
    button.disabled = true;
    status.textContent = "Sending…";
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: key,
          subject: "New portfolio enquiry",
          ...v,
          // Lets Melvine hit "reply" in his inbox when the visitor left an email address.
          ...(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.contact) ? { replyto: v.contact } : {}),
        }),
        signal: AbortSignal.timeout(Number(form.dataset.timeoutMs) || 15000),
      });
      const json = (await res.json().catch(() => ({}))) as { success?: boolean };
      if (!res.ok || json.success !== true) throw new Error(`HTTP ${res.status}`);
      status.textContent = SUCCESS;
      track("contact-send", { method: "web3forms", location: "contact" });
      form.reset();
    } catch {
      showWithLink(FAILURE, fallback);
    } finally {
      sending = false;
      button.disabled = false;
    }
  });

  for (const f of fields) {
    f.addEventListener("input", () => {
      if (f.getAttribute("aria-invalid") === "true" && f.value.trim()) {
        f.setAttribute("aria-invalid", "false");
        document.getElementById(`${f.id}-error`)!.textContent = "";
      }
    });
  }
}
