/**
 * A small, deliberately partial take on the ARIA role and accessible-name
 * rules Playwright's getByRole/getByLabel rely on. Enough for the sandbox's
 * markup — not a spec-complete implementation.
 */

const INPUT_ROLES: Record<string, string> = {
  button: "button",
  submit: "button",
  reset: "button",
  checkbox: "checkbox",
  radio: "radio",
  range: "slider",
  number: "spinbutton",
  search: "searchbox",
  email: "textbox",
  tel: "textbox",
  text: "textbox",
  url: "textbox",
};

const TAG_ROLES: Record<string, string> = {
  button: "button",
  select: "combobox",
  textarea: "textbox",
  ul: "list",
  ol: "list",
  li: "listitem",
  nav: "navigation",
  main: "main",
  dialog: "dialog",
  form: "form",
  article: "article",
  h1: "heading",
  h2: "heading",
  h3: "heading",
  h4: "heading",
  h5: "heading",
  h6: "heading",
};

/** Roles whose accessible name comes from their text content. */
const NAME_FROM_CONTENT = new Set([
  "button",
  "link",
  "heading",
  "checkbox",
  "radio",
  "option",
  "tab",
  "menuitem",
  "cell",
]);

export function getRole(el: Element): string | null {
  const explicit = el.getAttribute("role");
  if (explicit) return explicit.split(" ")[0];

  const tag = el.tagName.toLowerCase();
  if (tag === "a") return el.hasAttribute("href") ? "link" : null;
  if (tag === "img") return el.getAttribute("alt") === "" ? "presentation" : "img";
  if (tag === "input") {
    const type = (el.getAttribute("type") ?? "text").toLowerCase();
    // Password inputs intentionally have no role — getByLabel is the way in.
    return INPUT_ROLES[type] ?? null;
  }
  return TAG_ROLES[tag] ?? null;
}

export function normalize(text: string | null | undefined): string {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

export function isFormControl(el: Element): el is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  return el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement;
}

/** Text of the <label>s associated with a form control, plus aria-label. */
export function getLabelTexts(el: Element): string[] {
  const texts: string[] = [];
  const ariaLabel = el.getAttribute("aria-label");
  if (ariaLabel) texts.push(normalize(ariaLabel));
  if (isFormControl(el) && el.labels) {
    for (const label of Array.from(el.labels)) texts.push(normalize(label.textContent));
  }
  return texts.filter(Boolean);
}

export function getAccessibleName(el: Element): string {
  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    const doc = el.ownerDocument;
    return normalize(
      labelledBy
        .split(" ")
        .map((id) => doc.getElementById(id)?.textContent ?? "")
        .join(" "),
    );
  }

  const ariaLabel = el.getAttribute("aria-label");
  if (ariaLabel) return normalize(ariaLabel);

  if (isFormControl(el)) {
    const labels = getLabelTexts(el);
    if (labels.length) return labels.join(" ");
  }

  if (el.tagName === "IMG") return normalize(el.getAttribute("alt"));

  const role = getRole(el);
  if (role && NAME_FROM_CONTENT.has(role)) return normalize(el.textContent);

  // Unlabelled fields fall back to title, then placeholder (HTML-AAM).
  return normalize(el.getAttribute("title") || el.getAttribute("placeholder"));
}

/** Playwright's role/text queries skip hidden elements by default. */
export function isVisible(el: Element): boolean {
  if (el.closest("[hidden], [aria-hidden='true']")) return false;
  if (typeof (el as HTMLElement).checkVisibility === "function") {
    return (el as HTMLElement).checkVisibility({ visibilityProperty: true } as CheckVisibilityOptions);
  }
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}
