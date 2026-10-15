import { getAccessibleName, getLabelTexts, getRole, isFormControl, isVisible, normalize } from "./aria";

/**
 * Mirrors Playwright's text matching: strings are case-insensitive substring
 * matches unless `exact`, regexes are tested as-is.
 */
export type Matcher =
  | { kind: "string"; value: string; exact?: boolean }
  | { kind: "regex"; source: string; flags: string };

export type LocatorPart =
  | { by: "role"; role: string; name?: Matcher }
  | { by: "label"; text: Matcher }
  | { by: "placeholder"; text: Matcher }
  | { by: "text"; text: Matcher }
  | { by: "testid"; id: string }
  | { by: "filter"; hasText: string }
  | { by: "css"; selector: string };

export type Strategy =
  | "role"
  | "role-exact"
  | "role-regex"
  | "label"
  | "placeholder"
  | "text"
  | "testid"
  | "testid-assert"
  | "scoped"
  | "css";

export interface Suggestion {
  parts: LocatorPart[];
  strategy: Strategy;
  /** Context for the annotation: what made the simpler locator insufficient. */
  detail?: {
    conflict?: string;
    count?: number;
    scopeRole?: string;
    hasText?: string;
    inner?: Strategy;
  };
}

export interface SuggestOptions {
  /** Skip locators derived from the element's text (used when asserting on that text). */
  avoidText?: boolean;
}

// ── Matching ──

function matches(text: string, m: Matcher): boolean {
  const t = normalize(text);
  if (m.kind === "regex") return new RegExp(m.source, m.flags).test(t);
  if (m.exact) return t === normalize(m.value);
  return t.toLowerCase().includes(normalize(m.value).toLowerCase());
}

function descendants(scope: Element): Element[] {
  return Array.from(scope.querySelectorAll("*")).filter(isVisible);
}

function queryPart(scope: Element, part: Exclude<LocatorPart, { by: "filter" }>): Element[] {
  switch (part.by) {
    case "role":
      return descendants(scope).filter(
        (el) => getRole(el) === part.role && (!part.name || matches(getAccessibleName(el), part.name)),
      );
    case "label":
      return descendants(scope).filter((el) => getLabelTexts(el).some((t) => matches(t, part.text)));
    case "placeholder":
      return descendants(scope).filter((el) => matches(el.getAttribute("placeholder") ?? "", part.text));
    case "text": {
      // The deepest elements whose text matches, like Playwright's getByText.
      const hits = descendants(scope).filter((el) => matches(el.textContent ?? "", part.text));
      return hits.filter((el) => !hits.some((other) => other !== el && el.contains(other)));
    }
    case "testid":
      return descendants(scope).filter((el) => el.getAttribute("data-testid") === part.id);
    case "css":
      return Array.from(scope.querySelectorAll(part.selector)).filter(isVisible);
  }
}

/** Resolves a locator chain to the elements it matches inside `root`. */
export function resolve(parts: LocatorPart[], root: Element): Element[] {
  let current: Element[] = [root];
  for (const part of parts) {
    if (part.by === "filter") {
      const needle = part.hasText.toLowerCase();
      current = current.filter((el) => normalize(el.textContent).toLowerCase().includes(needle));
    } else {
      const next = new Set<Element>();
      for (const scope of current) for (const el of queryPart(scope, part)) next.add(el);
      current = Array.from(next);
    }
  }
  return current;
}

// ── Suggesting ──

const SCOPE_ROLES = new Set(["listitem", "dialog", "form", "article", "region", "row", "navigation", "group"]);

function toRegexSource(name: string): string {
  return name.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&").replace(/\d+/g, "\\d+");
}

/** Own-element candidates in Playwright's recommended priority order. */
function candidates(el: Element, opts: SuggestOptions): Suggestion[] {
  const out: Suggestion[] = [];
  const role = getRole(el);
  const name = getAccessibleName(el);
  const nameFromText = !el.hasAttribute("aria-label") && !el.hasAttribute("aria-labelledby") && !isFormControl(el);
  const labels = getLabelTexts(el);

  if (isFormControl(el) && labels.length) {
    out.push({ parts: [{ by: "label", text: { kind: "string", value: labels[0] } }], strategy: "label" });
  }

  // Placeholder-only fields: getByPlaceholder reads clearer than a role whose
  // name is secretly the placeholder, and the annotation flags the a11y gap.
  const placeholder = el.getAttribute("placeholder");
  if (placeholder && !labels.length) {
    out.push({ parts: [{ by: "placeholder", text: { kind: "string", value: placeholder } }], strategy: "placeholder" });
  }

  if (role && role !== "presentation") {
    if (name && !(opts.avoidText && nameFromText)) {
      if (/\d/.test(name)) {
        out.push({
          parts: [{ by: "role", role, name: { kind: "regex", source: toRegexSource(name), flags: "" } }],
          strategy: "role-regex",
          detail: { conflict: name },
        });
      } else {
        out.push({ parts: [{ by: "role", role, name: { kind: "string", value: name } }], strategy: "role" });
        out.push({
          parts: [{ by: "role", role, name: { kind: "string", value: name, exact: true } }],
          strategy: "role-exact",
        });
      }
    } else {
      out.push({ parts: [{ by: "role", role }], strategy: "role" });
    }
  }

  const text = normalize(el.textContent);
  if (text && text.length <= 60 && !role && !opts.avoidText) {
    out.push({ parts: [{ by: "text", text: { kind: "string", value: text } }], strategy: "text" });
  }

  const testId = el.getAttribute("data-testid");
  if (testId) {
    out.push({
      parts: [{ by: "testid", id: testId }],
      strategy: opts.avoidText && text ? "testid-assert" : "testid",
    });
  }

  return out;
}

function isUnique(parts: LocatorPart[], el: Element, root: Element): boolean {
  const hits = resolve(parts, root);
  return hits.length === 1 && hits[0] === el;
}

/** Text that tells one scope container apart from its siblings — its heading, ideally. */
function distinguishingText(scope: Element): string | null {
  const heading = scope.querySelector("h1, h2, h3, h4, h5, h6, [role='heading']");
  const text = normalize(heading?.textContent) || normalize(scope.querySelector("strong, p, span")?.textContent);
  return text || null;
}

function scopeLocators(scope: Element, root: Element): { parts: LocatorPart[]; hasText?: string }[] {
  const role = getRole(scope);
  const out: { parts: LocatorPart[]; hasText?: string }[] = [];
  if (role) {
    const name = getAccessibleName(scope);
    if (name) out.push({ parts: [{ by: "role", role, name: { kind: "string", value: name } }] });
    out.push({ parts: [{ by: "role", role }] });
    const hasText = distinguishingText(scope);
    if (hasText) out.push({ parts: [{ by: "role", role }, { by: "filter", hasText }], hasText });
  }
  const testId = scope.getAttribute("data-testid");
  if (testId) out.push({ parts: [{ by: "testid", id: testId }] });
  return out.filter((s) => isUnique(s.parts, scope, root));
}

function cssPath(el: Element, root: Element): string {
  const segments: string[] = [];
  let node: Element | null = el;
  while (node && node !== root) {
    const tag: string = node.tagName.toLowerCase();
    const parent: Element | null = node.parentElement;
    const index = parent ? Array.from(parent.children).filter((c) => c.tagName === node!.tagName).indexOf(node) + 1 : 1;
    segments.unshift(`${tag}:nth-of-type(${index})`);
    node = parent;
  }
  return segments.join(" > ");
}

/** Picks the most resilient locator that uniquely identifies `el` within `root`. */
export function suggestLocator(el: Element, root: Element, opts: SuggestOptions = {}): Suggestion {
  const own = candidates(el, opts);

  for (const c of own) {
    if (!isUnique(c.parts, el, root)) continue;
    if (c.strategy === "role-exact") {
      // Only worth calling out when the loose match actually collided with something.
      const { role } = c.parts[0] as Extract<LocatorPart, { by: "role" }>;
      const loose = resolve([{ by: "role", role, name: { kind: "string", value: getAccessibleName(el) } }], root);
      const other = loose.find((x) => x !== el);
      return { ...c, detail: { conflict: other ? getAccessibleName(other) : undefined } };
    }
    return c;
  }

  // Nothing unique on its own: narrow to a meaningful container first.
  for (let scope = el.parentElement; scope && scope !== root; scope = scope.parentElement) {
    const scopeRole = getRole(scope);
    if (!(scopeRole && SCOPE_ROLES.has(scopeRole)) && !scope.hasAttribute("data-testid")) continue;
    for (const s of scopeLocators(scope, root)) {
      for (const c of own) {
        if (c.strategy === "role-exact") continue;
        const parts = [...s.parts, ...c.parts];
        if (isUnique(parts, el, root)) {
          return {
            parts,
            strategy: "scoped",
            detail: { count: resolve(c.parts, root).length, scopeRole: scopeRole ?? "container", hasText: s.hasText, inner: c.strategy },
          };
        }
      }
    }
  }

  return { parts: [{ by: "css", selector: cssPath(el, root) }], strategy: "css" };
}

// ── Code output ──

export function quote(value: string): string {
  return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

function matcherCode(m: Matcher): string {
  return m.kind === "regex" ? `/${m.source}/${m.flags}` : quote(m.value);
}

export function partCode(part: LocatorPart): string {
  switch (part.by) {
    case "role": {
      if (!part.name) return `.getByRole(${quote(part.role)})`;
      const exact = part.name.kind === "string" && part.name.exact ? ", exact: true" : "";
      return `.getByRole(${quote(part.role)}, { name: ${matcherCode(part.name)}${exact} })`;
    }
    case "label":
      return `.getByLabel(${matcherCode(part.text)})`;
    case "placeholder":
      return `.getByPlaceholder(${matcherCode(part.text)})`;
    case "text":
      return `.getByText(${matcherCode(part.text)})`;
    case "testid":
      return `.getByTestId(${quote(part.id)})`;
    case "filter":
      return `.filter({ hasText: ${quote(part.hasText)} })`;
    case "css":
      return `.locator(${quote(part.selector)})`;
  }
}

export function locatorCode(parts: LocatorPart[]): string {
  return "page" + parts.map(partCode).join("");
}
