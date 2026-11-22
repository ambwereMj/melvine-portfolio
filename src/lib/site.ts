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
/** WhatsApp link with the standard pre-filled message; `need` fills the "I need:" blank. */
export const whatsappUrlFor = (need: string) => `https://wa.me/254110753069?text=${encodeURIComponent(whatsappMessage(need))}`;
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
