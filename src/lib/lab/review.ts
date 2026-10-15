import { getRole, normalize } from "./aria";
import {
  candidates,
  classSelector,
  cssPath,
  locatorCode,
  pageRoots,
  resolve,
  suggestLocator,
  xpathFor,
  type Issue,
  type LocatorPart,
  type Review,
  type Suggestion,
} from "./locator";

const DOCS = {
  strictness: "https://playwright.dev/docs/locators#strictness",
  locators: "https://playwright.dev/docs/locators",
  other: "https://playwright.dev/docs/other-locators",
  bestPractices: "https://playwright.dev/docs/best-practices#use-locators",
  filter: "https://playwright.dev/docs/locators#filtering-locators",
};

export interface ReviewContext {
  /** The recorded element, if it's still on screen. */
  target?: Element | null;
  /** The text a toHaveText assertion checks, to catch circular locators. */
  assertText?: string;
}

const CONTROL_ROLES = new Set(["button", "link", "checkbox", "radio", "tab", "menuitem"]);

/** A code review for one locator: does it work, and will it keep working? */
export function review(parts: LocatorPart[], roots: ParentNode[], ctx: ReviewContext = {}): Review {
  const hits = resolve(parts, roots);
  const issues: Issue[] = [];
  const target = ctx.target?.isConnected ? ctx.target : null;

  if (ctx.target && !target) {
    issues.push({
      tone: "info",
      title: "Element not on screen",
      body: "The recorded element isn't on screen right now, so this only checks how many elements match what's visible.",
    });
  }

  if (hits.length === 0) {
    issues.push({
      tone: "error",
      title: "Matches nothing",
      body: "Nothing on the page matches this. Playwright would keep retrying until the timeout, then fail with a TimeoutError.",
      docs: DOCS.locators,
    });
  } else if (hits.length > 1) {
    issues.push({
      tone: "error",
      title: "Strict mode violation",
      body: `This matches ${hits.length} elements. Playwright refuses to act on an ambiguous locator rather than guessing which one you meant. Narrow it with filter() or chain it from a parent.`,
      docs: DOCS.strictness,
    });
  } else if (target && hits[0] !== target) {
    issues.push({
      tone: "error",
      title: "Matches the wrong element",
      body: "This resolves to exactly one element, just not the one you recorded. The test would pass or fail for the wrong reasons.",
    });
  }

  for (const part of parts) {
    if (part.by === "xpath") {
      issues.push({
        tone: "warning",
        title: "XPath follows the DOM's shape",
        body: "This is the kind of path DevTools' Copy XPath produces. Add a wrapper div and it breaks, even though nothing changed for the user. XPath also can't see inside shadow DOM, and Playwright's built-in locators can.",
        docs: DOCS.other,
      });
    } else if (part.by === "css") {
      const sel = part.selector;
      if (/:nth-(child|of-type)|>/.test(sel)) {
        issues.push({
          tone: "warning",
          title: "Positional CSS",
          body: ":nth-child() and long > chains encode the page's layout. A refactor that users never notice still breaks the test.",
          docs: DOCS.bestPractices,
        });
      } else if (/\.[a-z]/i.test(sel)) {
        issues.push({
          tone: "warning",
          title: "Styling classes aren't identifiers",
          body: "These classes describe how the element looks. A restyle renames them and the test fails while the feature still works. If nothing user-facing is unique, add a data-testid.",
          docs: DOCS.bestPractices,
        });
      } else if (/#/.test(sel)) {
        issues.push({
          tone: "info",
          title: "IDs work, but users never see them",
          body: "More stable than classes, but easy to rename and invisible to users. A role or label also checks what the user actually experiences.",
          docs: DOCS.bestPractices,
        });
      }
    } else if (part.by === "nth") {
      issues.push({
        tone: "warning",
        title: "Order-dependent",
        body: "nth(), first() and last() pick by position. Sort, filter or add an item and the test breaks, or worse, quietly acts on the wrong one. Filter by what makes the item unique instead.",
        docs: DOCS.filter,
      });
    }
  }

  const last = parts.at(-1);
  if (last?.by === "text" && hits.length === 1 && CONTROL_ROLES.has(getRole(hits[0]) ?? "")) {
    issues.push({
      tone: "info",
      title: "Prefer getByRole for controls",
      body: "getByText finds it, but getByRole would also confirm it's a real control with the right accessible name. That's a free accessibility check.",
      docs: DOCS.locators,
    });
  }

  if (ctx.assertText) {
    const needle = normalize(ctx.assertText).toLowerCase();
    const circular = parts.some((p) => {
      const m = p.by === "role" ? p.name : p.by === "text" ? p.text : undefined;
      return m?.kind === "string" && normalize(m.value).toLowerCase() === needle;
    });
    if (circular) {
      issues.push({
        tone: "warning",
        title: "Circular locator",
        body: "This finds the element by the same text the assertion checks. If the text changes, the locator fails first, and the error tells you less than it should.",
        docs: DOCS.bestPractices,
      });
    }
  }

  const grade = issues.some((i) => i.tone === "error")
    ? "fails"
    : issues.some((i) => i.tone === "warning")
      ? "brittle"
      : issues.some((i) => i.tone === "info" && i.title !== "Element not on screen")
        ? "ok"
        : "solid";
  return { grade, count: hits.length, issues };
}

const GRADE_ORDER = { solid: 0, ok: 1, brittle: 2, fails: 3 };

/**
 * The recommended locator plus the alternatives people actually reach for
 * (CSS classes, DevTools paths, nth(), ambiguous roles), each reviewed.
 */
export function locatorOptions(el: Element, root: Element, ctx: Omit<ReviewContext, "target"> = {}) {
  const roots = pageRoots(root);
  const best = suggestLocator(el, root, { avoidText: Boolean(ctx.assertText) });
  const pool: Suggestion[] = [best];

  for (const c of candidates(el)) {
    // exact: true only earns a spot when it's the recommendation itself.
    if (c.strategy === "role-exact") continue;
    pool.push(c);
    const hits = resolve(c.parts, roots);
    const index = hits.indexOf(el);
    if (hits.length > 1 && index >= 0) pool.push({ parts: [...c.parts, { by: "nth", index }], strategy: "nth" });
  }

  const text = normalize(el.textContent);
  if (text && text.length <= 60 && CONTROL_ROLES.has(getRole(el) ?? "")) {
    pool.push({ parts: [{ by: "text", text: { kind: "string", value: text } }], strategy: "text-control" });
  }

  const classes = classSelector(el);
  if (classes) pool.push({ parts: [{ by: "css", selector: classes }], strategy: "css-class" });
  pool.push({ parts: [{ by: "css", selector: cssPath(el, root) }], strategy: "css-path" });
  pool.push({ parts: [{ by: "xpath", expr: xpathFor(el, root) }], strategy: "xpath" });

  const seen = new Set<string>();
  const options = pool
    .filter((s) => {
      const code = locatorCode(s.parts);
      if (seen.has(code)) return false;
      seen.add(code);
      return true;
    })
    .map((s) => ({ ...s, review: review(s.parts, roots, { target: el, assertText: ctx.assertText }) }));

  const [first, ...rest] = options;
  rest.sort((a, b) => GRADE_ORDER[a.review.grade] - GRADE_ORDER[b.review.grade]);
  return { best: first, options: [first, ...rest].slice(0, 8) };
}
