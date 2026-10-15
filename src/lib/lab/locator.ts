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
  | { by: "alt"; text: Matcher }
  | { by: "filter"; hasText: string }
  | { by: "css"; selector: string }
  | { by: "xpath"; expr: string }
  | { by: "nth"; index: number };

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
  | "css"
  | "alt"
  // The options below are offered so visitors can pick them and get critiqued.
  | "text-control"
  | "nth"
  | "css-class"
  | "css-path"
  | "xpath"
  | "custom";

export type Tone = "error" | "warning" | "info";

export interface Issue {
  tone: Tone;
  title: string;
  body: string;
  docs?: string;
}

export interface Review {
  grade: "solid" | "ok" | "brittle" | "fails";
  count: number;
  issues: Issue[];
}

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
    /** How many of the colliding matches live outside the app's own markup. */
    outside?: number;
    /** How many of the colliding matches are hidden (still counted by non-role locators). */
    hidden?: number;
  };
  /** Set when the locator is offered as an option or typed in by a visitor. */
  review?: Review;
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

/**
 * Every element in scope. Only getByRole skips hidden elements; text, label,
 * alt, test id, CSS and XPath all count aria-hidden and display:none matches
 * too (verified against Playwright 1.64), which is how hidden duplicates
 * cause surprise strict-mode violations.
 */
function descendants(scope: ParentNode): Element[] {
  return Array.from(scope.querySelectorAll("*"));
}

function queryXPath(scope: ParentNode, expr: string): Element[] {
  // XPath can't see into shadow roots, and neither can Playwright's xpath engine.
  if (scope instanceof ShadowRoot || !(scope instanceof Node)) return [];
  const doc = scope.ownerDocument ?? (scope as unknown as Document);
  // Like Playwright, a chained `//` expression searches inside its scope.
  const relative = expr.startsWith("//") ? `.${expr}` : expr;
  try {
    const result = doc.evaluate(relative, scope, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    const out: Element[] = [];
    for (let i = 0; i < result.snapshotLength; i++) {
      const node = result.snapshotItem(i);
      if (node instanceof Element && node !== scope && scope.contains(node)) out.push(node);
    }
    return out;
  } catch {
    return [];
  }
}

function queryPart(scope: ParentNode, part: Exclude<LocatorPart, { by: "filter" } | { by: "nth" }>): Element[] {
  switch (part.by) {
    case "role":
      return descendants(scope).filter(
        (el) => isVisible(el) && getRole(el) === part.role && (!part.name || matches(getAccessibleName(el), part.name)),
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
    case "alt":
      return descendants(scope).filter(
        (el) => el.matches("img, area, input[type='image']") && matches(el.getAttribute("alt") ?? "", part.text),
      );
    case "css":
      try {
        return Array.from(scope.querySelectorAll(part.selector));
      } catch {
        return [];
      }
    case "xpath":
      return queryXPath(scope, part.expr);
  }
}

/** Resolves a locator chain to the elements it matches inside the given root(s). */
export function resolve(parts: LocatorPart[], roots: ParentNode | ParentNode[]): Element[] {
  let current: ParentNode[] = Array.isArray(roots) ? roots : [roots];
  for (const part of parts) {
    if (part.by === "filter") {
      const needle = part.hasText.toLowerCase();
      current = current.filter((node) => normalize(node.textContent).toLowerCase().includes(needle));
    } else if (part.by === "nth") {
      const pick = current.at(part.index);
      current = pick ? [pick] : [];
    } else {
      const next = new Set<Element>();
      for (const scope of current) for (const el of queryPart(scope, part)) next.add(el);
      current = Array.from(next);
    }
  }
  return current.filter((node): node is Element => node instanceof Element);
}

/**
 * Everything an exported test can see on /lab/sandbox. That page has no site
 * chrome, so it's the app plus whatever the framework injects at document
 * level: Next.js's route announcer, an open shadow root with role="alert"
 * (Playwright's locators pierce open shadow roots). Checking uniqueness
 * against the app alone produced locators that hit strict-mode violations.
 */
export function pageRoots(root: Element): ParentNode[] {
  const injected = Array.from(root.ownerDocument.querySelectorAll("next-route-announcer"))
    .map((host) => host.shadowRoot)
    .filter((shadow): shadow is ShadowRoot => shadow !== null);
  return [root, ...injected];
}

// ── Suggesting ──

const SCOPE_ROLES = new Set(["listitem", "dialog", "form", "article", "region", "row", "navigation", "group"]);

function toRegexSource(name: string): string {
  return name.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&").replace(/\d+/g, "\\d+");
}

/** Own-element candidates in Playwright's recommended priority order. */
export function candidates(el: Element, opts: SuggestOptions = {}): Suggestion[] {
  const out: Suggestion[] = [];

  const alt = el.matches("img, area, input[type='image']") ? normalize(el.getAttribute("alt")) : "";
  if (alt) out.push({ parts: [{ by: "alt", text: { kind: "string", value: alt } }], strategy: "alt" });

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

export function isUnique(parts: LocatorPart[], el: Element, roots: ParentNode[]): boolean {
  const hits = resolve(parts, roots);
  return hits.length === 1 && hits[0] === el;
}

/** Text that tells one scope container apart from its siblings — its heading, ideally. */
function distinguishingText(scope: Element): string | null {
  const heading = scope.querySelector("h1, h2, h3, h4, h5, h6, [role='heading']");
  const text = normalize(heading?.textContent) || normalize(scope.querySelector("strong, p, span")?.textContent);
  return text || null;
}

function scopeLocators(scope: Element, roots: ParentNode[]): { parts: LocatorPart[]; hasText?: string }[] {
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
  return out.filter((s) => isUnique(s.parts, scope, roots));
}

/** The app's outermost element, which carries id="sandbox" on every page. */
export const SANDBOX_ID = "sandbox";

function anchorOf(root: Element): Element {
  return root.querySelector(`#${SANDBOX_ID}`) ?? root;
}

/** Index among same-tag siblings, or null when the tag is unique there (DevTools omits it). */
function sameTagIndex(node: Element): number | null {
  const siblings = node.parentElement ? Array.from(node.parentElement.children) : [node];
  const sameTag = siblings.filter((c) => c.tagName === node.tagName);
  return sameTag.length > 1 ? sameTag.indexOf(node) + 1 : null;
}

/** What DevTools' "Copy selector" gives you, anchored to the app's id. */
export function cssPath(el: Element, root: Element): string {
  const anchor = anchorOf(root);
  const segments: string[] = [];
  for (let node: Element | null = el; node && node !== anchor && node !== root; node = node.parentElement) {
    const tag = node.tagName.toLowerCase();
    const siblings = node.parentElement ? Array.from(node.parentElement.children) : [node];
    segments.unshift(sameTagIndex(node) ? `${tag}:nth-child(${siblings.indexOf(node) + 1})` : tag);
  }
  return [`#${SANDBOX_ID}`, ...segments].join(" > ");
}

/** What DevTools' "Copy XPath" gives you. */
export function xpathFor(el: Element, root: Element): string {
  const anchor = anchorOf(root);
  const segments: string[] = [];
  for (let node: Element | null = el; node && node !== anchor && node !== root; node = node.parentElement) {
    const index = sameTagIndex(node);
    segments.unshift(`${node.tagName.toLowerCase()}${index ? `[${index}]` : ""}`);
  }
  return [`//*[@id="${SANDBOX_ID}"]`, ...segments].join("/");
}

/** A selector built from the element's classes, the way people often write them by hand. */
export function classSelector(el: Element): string | null {
  const classes = Array.from(el.classList).filter((c) => /^[a-z][\w-]*$/i.test(c));
  return classes.length ? `${el.tagName.toLowerCase()}.${classes.slice(0, 2).join(".")}` : null;
}

/**
 * Picks the most resilient locator that uniquely identifies `el`, where
 * `root` is the sandbox app and uniqueness is checked against the whole exported page.
 */
export function suggestLocator(el: Element, root: Element, opts: SuggestOptions = {}): Suggestion {
  const roots = pageRoots(root);
  const own = candidates(el, opts);

  for (const c of own) {
    if (!isUnique(c.parts, el, roots)) continue;
    if (c.strategy === "role-exact") {
      // Only worth calling out when the loose match actually collided with something.
      const { role } = c.parts[0] as Extract<LocatorPart, { by: "role" }>;
      const loose = resolve([{ by: "role", role, name: { kind: "string", value: getAccessibleName(el) } }], roots);
      const other = loose.find((x) => x !== el);
      return { ...c, detail: { conflict: other ? getAccessibleName(other) : undefined } };
    }
    return c;
  }

  // Nothing unique on its own: narrow to a meaningful container first.
  for (let scope = el.parentElement; scope && scope !== root; scope = scope.parentElement) {
    const scopeRole = getRole(scope);
    if (!(scopeRole && SCOPE_ROLES.has(scopeRole)) && !scope.hasAttribute("data-testid")) continue;
    for (const s of scopeLocators(scope, roots)) {
      for (const c of own) {
        if (c.strategy === "role-exact") continue;
        const parts = [...s.parts, ...c.parts];
        if (isUnique(parts, el, roots)) {
          const collisions = resolve(c.parts, roots);
          return {
            parts,
            strategy: "scoped",
            detail: {
              count: collisions.length,
              outside: collisions.filter((hit) => !root.contains(hit)).length,
              hidden: collisions.filter((hit) => root.contains(hit) && !isVisible(hit)).length,
              scopeRole: scopeRole ?? "container",
              hasText: s.hasText,
              inner: c.strategy,
            },
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
    case "alt":
      return `.getByAltText(${matcherCode(part.text)})`;
    case "filter":
      return `.filter({ hasText: ${quote(part.hasText)} })`;
    case "css":
      return `.locator(${quote(part.selector)})`;
    case "xpath":
      return `.locator(${quote(`xpath=${part.expr}`)})`;
    case "nth":
      return part.index === 0 ? ".first()" : part.index === -1 ? ".last()" : `.nth(${part.index})`;
  }
}

export function locatorCode(parts: LocatorPart[]): string {
  return "page" + parts.map(partCode).join("");
}
