import { toggleTheme, toggleMotion, isLight, isReduced } from "./prefs-actions";

/**
 * Command palette behaviour (WAI-ARIA combobox + listbox inside a native <dialog>).
 * Items are server-rendered; this only filters, moves the selection and runs commands.
 */
type Handler = () => void;
const extraActions: Record<string, Handler> = {};

/** Lets the terminal (Task 4) plug in its own "open-terminal" action. */
export function registerAction(name: string, fn: Handler): void {
  extraActions[name] = fn;
}

let opener: HTMLElement | null = null;

export function initPalette(): void {
  const dialog = document.getElementById("palette") as HTMLDialogElement | null;
  if (!dialog) return;
  const input = dialog.querySelector<HTMLInputElement>("#palette-input")!;
  const options = [...dialog.querySelectorAll<HTMLElement>("[role=option]")];
  const groups = [...dialog.querySelectorAll<HTMLElement>("[role=group]")];
  const empty = dialog.querySelector<HTMLElement>("[data-empty]")!;
  const status = dialog.querySelector<HTMLElement>("#palette-status")!;
  const title = dialog.querySelector<HTMLElement>("#palette-title")!;
  let active = -1;

  const visible = () => options.filter((o) => !o.hidden);

  function select(index: number) {
    const list = visible();
    options.forEach((o) => o.setAttribute("aria-selected", "false"));
    if (list.length === 0) {
      active = -1;
      input.removeAttribute("aria-activedescendant");
      return;
    }
    active = (index + list.length) % list.length;
    const el = list[active];
    el.setAttribute("aria-selected", "true");
    input.setAttribute("aria-activedescendant", el.id);
    el.scrollIntoView({ block: "nearest" });
  }

  function filter() {
    const words = input.value.toLowerCase().split(/\s+/).filter(Boolean);
    for (const o of options) {
      const hay = `${o.textContent} ${o.dataset.keywords ?? ""}`.toLowerCase();
      o.hidden = !words.every((w) => hay.includes(w));
    }
    for (const g of groups) g.hidden = ![...g.querySelectorAll<HTMLElement>("[role=option]")].some((o) => !o.hidden);
    const any = visible().length > 0;
    empty.hidden = any;
    input.setAttribute("aria-expanded", String(any));
    select(0);
  }

  function refreshLabels() {
    const theme = dialog!.querySelector("#cmd-theme");
    const motion = dialog!.querySelector("#cmd-motion");
    if (theme) theme.textContent = isLight() ? "Switch to dark theme" : "Switch to light theme";
    if (motion) motion.textContent = isReduced() ? "Turn reduce motion off" : "Turn reduce motion on";
  }

  function open(trigger?: HTMLElement | null) {
    if (dialog!.open) return;
    opener = trigger ?? (document.activeElement as HTMLElement | null);
    input.value = "";
    status.textContent = "";
    refreshLabels();
    filter();
    dialog!.showModal();
    if (window.matchMedia("(pointer: coarse)").matches) title.focus();
    else input.focus();
  }

  function close() {
    if (dialog!.open) dialog!.close();
  }

  /** In-page jump: always scrolls (even to the current hash) and moves focus into the target section. */
  function jumpTo(hash: string) {
    const target = document.getElementById(hash.slice(1));
    opener = null; // focus goes to the target, not back to the menu button
    close();
    if (!target) { location.hash = hash; return; }
    history.pushState(null, "", hash);
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.scrollIntoView({ block: "start", behavior: isReduced() ? "instant" : "smooth" });
    target.focus({ preventScroll: true });
  }

  async function copyEmail(address: string) {
    try {
      await navigator.clipboard.writeText(address);
      status.textContent = "Email address copied";
    } catch {
      const field = dialog!.querySelector<HTMLInputElement>("[data-copy-fallback]")!;
      field.classList.remove("sr-only");
      field.select();
      status.textContent = "Copy the selected email address";
    }
  }

  function run(el: HTMLElement | undefined) {
    if (!el) return;
    const { href, action } = el.dataset;
    if (href) {
      if (href.startsWith("#")) return jumpTo(href);
      close();
      if (el.dataset.external !== undefined) window.open(href, "_blank", "noopener");
      else location.href = href;
      return;
    }
    if (action === "toggle-theme") toggleTheme();
    else if (action === "toggle-motion") toggleMotion();
    else if (action === "copy-email") void copyEmail(dialog!.querySelector<HTMLInputElement>("[data-copy-fallback]")!.value);
    else if (action && extraActions[action]) extraActions[action]();
    refreshLabels();
  }

  dialog.addEventListener("close", () => {
    opener?.focus();
    opener = null;
  });
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) close(); // backdrop click
    const target = e.target as Element;
    if (target.closest("[data-palette-close]")) close();
    const option = target.closest<HTMLElement>("[role=option]");
    if (option) run(option);
  });
  dialog.addEventListener("mousemove", (e) => {
    const option = (e.target as Element).closest<HTMLElement>("[role=option]");
    if (option && !option.hidden && option.getAttribute("aria-selected") !== "true") select(visible().indexOf(option));
  });
  input.addEventListener("input", filter);
  input.addEventListener("keydown", (e) => {
    const n = visible().length;
    if (e.key === "ArrowDown") select(active + 1);
    else if (e.key === "ArrowUp") select(active - 1);
    else if (e.key === "Home" && n) select(0);
    else if (e.key === "End" && n) select(n - 1);
    else if (e.key === "Enter") run(visible()[active]);
    else return;
    e.preventDefault();
  });
  // Typing while the heading has focus (phones) goes to the search box.
  title.addEventListener("keydown", (e) => {
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) input.focus();
  });

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (dialog.open) close();
      else open();
    }
  });
  document.addEventListener("click", (e) => {
    const trigger = (e.target as Element).closest<HTMLElement>("[data-palette-open]");
    if (trigger) open(trigger);
  });

  if (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) {
    document.querySelectorAll("[data-shortcut]").forEach((k) => (k.textContent = "⌘K"));
  }
}
