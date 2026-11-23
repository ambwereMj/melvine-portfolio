export const SECTIONS = [
  { id: "hero", label: "Home" },
  { id: "work", label: "Work" },
  { id: "services", label: "Services" },
  { id: "process", label: "How I work" },
  { id: "about", label: "About" },
  { id: "lab", label: "Lab" },
  { id: "contact", label: "Contact" },
] as const;

const whatsappMessage = (need: string) => `Hi Melvine, I saw your portfolio. I need: ${need} · Budget: ___ · Deadline: ___`;
export const WHATSAPP_NUMBER = "254110753069";
/** wa.me link that opens a chat with `text` already typed. */
export const whatsappUrlWithText = (text: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
/** WhatsApp link with the standard pre-filled message; `need` fills the "I need:" blank. */
export const whatsappUrlFor = (need: string) => whatsappUrlWithText(whatsappMessage(need));
export const WHATSAPP_MESSAGE = whatsappMessage("___");
export const WHATSAPP_URL = whatsappUrlFor("___");
export const EMAIL = "melvinambwere@gmail.com";
export const TIMEZONE_LABEL = "EAT (UTC+3)";
/** Cal.com 15-minute booking link. Until it exists, booking CTAs open an email request instead of a dead end. */
export const CAL_URL: string | null = null;
export const BOOKING_URL = CAL_URL ?? `mailto:${EMAIL}?subject=${encodeURIComponent("15-min call request")}`;
export const GITHUB_URL = "https://github.com/ambwereMj";

/** In-page anchor on the home page; absolute "/#id" everywhere else (e.g. case-study pages). */
export const sectionHref = (id: string, pathname: string) => (pathname === "/" ? `#${id}` : `/#${id}`);

/** Web3Forms access key (public by design; tied to Melvine's email). null = form falls back to WhatsApp. */
export const WEB3FORMS_KEY: string | null = "7d8e6d1b-35e3-451a-8779-0730b2b7e547";

/** M-Pesa payment details shown after "agree a quote" in How I work and Contact. null = nothing shown. */
export const MPESA_PAYMENT: import("./mpesa").MpesaPayment | null = null;

/** The site's public address (free Vercel address; switch to a custom domain later: change this line and add the domain in Vercel). */
export const SITE_URL = "https://melvine-jerry.vercel.app";

/** Umami Cloud website ID (from Melvine's Umami account). null = no analytics script at all. */
export const UMAMI_WEBSITE_ID: string | null = "0511f619-e87b-4104-ac1f-55353b79fff7";
export const UMAMI_SCRIPT_URL = "https://cloud.umami.is/script.js";
