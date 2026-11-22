import { runCommand, type TerminalData, type Line } from "../lib/terminal";
import { registerAction } from "./palette";
import { toggleTheme, toggleMotion } from "./prefs-actions";

/** Wires the terminal view inside the palette: switching views, input history, rendering output. */
export function initTerminal(): void {
  const dialog = document.getElementById("palette") as HTMLDialogElement | null;
  const dataEl = document.getElementById("terminal-data");
  if (!dialog || !dataEl) return;
  const data = JSON.parse(dataEl.textContent || "{}") as TerminalData;
  const listView = dialog.querySelector<HTMLElement>("[data-view=list]")!;
  const termView = dialog.querySelector<HTMLElement>("[data-view=terminal]")!;
  const out = termView.querySelector<HTMLElement>("[data-testid=terminal-output]")!;
  const form = termView.querySelector<HTMLFormElement>("[data-terminal-form]")!;
  const input = termView.querySelector<HTMLInputElement>("#terminal-input")!;
  const paletteInput = dialog.querySelector<HTMLInputElement>("#palette-input")!;
  const history: string[] = [];
  let cursor = 0;

  const audience = () => (document.documentElement.dataset.audience === "international" ? "international" : "local");

  function show(view: "list" | "terminal") {
    listView.hidden = view !== "list";
    termView.hidden = view !== "terminal";
    (view === "terminal" ? input : paletteInput).focus();
  }

  function print(lines: Line[]) {
    for (const line of lines) {
      const p = document.createElement("p");
      for (const seg of line) {
        if (seg.href) {
          const a = document.createElement("a");
          a.href = seg.href;
          a.textContent = seg.text;
          a.className = "text-accent underline underline-offset-2";
          if (/^https?:/.test(seg.href)) { a.target = "_blank"; a.rel = "noopener"; }
          p.append(a);
        } else p.append(seg.text);
      }
      out.append(p);
    }
    out.scrollTop = out.scrollHeight;
  }

  registerAction("open-terminal", () => show("terminal"));
  dialog.addEventListener("close", () => { listView.hidden = false; termView.hidden = true; });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value;
    input.value = "";
    if (value.trim()) { history.push(value); cursor = history.length; }
    const echo = document.createElement("p");
    echo.className = "text-muted";
    echo.textContent = `$ ${value}`;
    out.append(echo);
    const { lines, effect } = runCommand(value, data, audience());
    print(lines);
    if (effect === "clear") out.replaceChildren();
    else if (effect === "exit") show("list");
    else if (effect === "toggle-theme") toggleTheme();
    else if (effect === "toggle-motion") toggleMotion();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && history.length) {
      cursor = Math.max(0, cursor - 1);
      input.value = history[cursor];
    } else if (e.key === "ArrowDown" && history.length) {
      cursor = Math.min(history.length, cursor + 1);
      input.value = history[cursor] ?? "";
    } else return;
    e.preventDefault();
  });
}
