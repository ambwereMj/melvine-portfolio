export const SECTIONS = [
  { id: "hero", label: "Home" },
  { id: "work", label: "Work" },
  { id: "services", label: "Services" },
  { id: "process", label: "How I work" },
  { id: "about", label: "About" },
  { id: "lab", label: "Lab" },
  { id: "contact", label: "Contact" },
] as const;

export const WHATSAPP_MESSAGE = "Hi Melvine, I saw your portfolio. I need: ___ · Budget: ___ · Deadline: ___";
export const WHATSAPP_URL = `https://wa.me/254110753069?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
export const EMAIL = "melvinambwere@gmail.com";
export const TIMEZONE_LABEL = "EAT (UTC+3)";
/** Cal.com 15-minute booking link. Until it exists, booking CTAs open an email request instead of a dead end. */
export const CAL_URL: string | null = null;
export const BOOKING_URL = CAL_URL ?? `mailto:${EMAIL}?subject=${encodeURIComponent("15-min call request")}`;
export const GITHUB_URL = "https://github.com/ambwereMj";
