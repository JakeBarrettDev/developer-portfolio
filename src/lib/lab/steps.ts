import { locatorCode, partCode, quote, type Suggestion } from "./locator";

export type Assertion = "toBeVisible" | "toHaveText" | "toHaveValue" | "toBeChecked";

export type Action =
  | { type: "goto"; url: string }
  | { type: "click" }
  | { type: "fill"; value: string; secret?: boolean }
  | { type: "check" }
  | { type: "uncheck" }
  | { type: "select"; option: string }
  | { type: "press"; key: string }
  | { type: "expect"; assertion: Assertion; value?: string };

export interface Step {
  id: string;
  action: Action;
  locator?: Suggestion;
  /** A `data-lab-hint` from the sandbox element, for context-specific notes. */
  hint?: string;
}

export interface Note {
  title: string;
  body: string;
  docs?: string;
}

const DOCS = {
  locators: "https://playwright.dev/docs/locators",
  filter: "https://playwright.dev/docs/locators#filtering-locators",
  actionability: "https://playwright.dev/docs/actionability",
  assertions: "https://playwright.dev/docs/test-assertions",
  bestPractices: "https://playwright.dev/docs/best-practices",
  auth: "https://playwright.dev/docs/auth",
  baseURL: "https://playwright.dev/docs/test-webserver#adding-a-baseurl",
  input: "https://playwright.dev/docs/input",
};

// ── Codegen ──

const MAX_LINE = 78; // Prettier's 80, minus the test body indent

function actionCall(action: Action): string {
  switch (action.type) {
    case "click":
      return ".click()";
    case "fill":
      return `.fill(${quote(action.value)})`;
    case "check":
      return ".check()";
    case "uncheck":
      return ".uncheck()";
    case "select":
      return `.selectOption(${quote(action.option)})`;
    case "press":
      return `.press(${quote(action.key)})`;
    case "expect":
      return action.value === undefined ? `.${action.assertion}()` : `.${action.assertion}(${quote(action.value)})`;
    case "goto":
      return "";
  }
}

/** Code for one step, wrapped Prettier-style when the locator chain gets long. */
export function stepCode(step: Step): string {
  const { action } = step;
  if (action.type === "goto") return `await page.goto(${quote(action.url)});`;
  if (!step.locator) return "";

  const chain = locatorCode(step.locator.parts);
  const call = actionCall(action);

  if (action.type === "expect") {
    const line = `await expect(${chain})${call};`;
    if (line.length <= MAX_LINE) return line;
    const parts = step.locator.parts.map(partCode);
    return [`await expect(`, `  page${parts[0]}`, ...parts.slice(1).map((p) => `    ${p}`), `)${call};`].join("\n");
  }

  const line = `await ${chain}${call};`;
  if (line.length <= MAX_LINE) return line;
  return ["await page", ...step.locator.parts.map((p) => `  ${partCode(p)}`), `  ${call};`].join("\n");
}

function testTitle(name: string) {
  return name.trim() || "recorded flow";
}

export function testFile(name: string, steps: Step[]): string {
  const body = steps
    .map(stepCode)
    .filter(Boolean)
    .map((code) =>
      code
        .split("\n")
        .map((l) => `  ${l}`)
        .join("\n"),
    )
    .join("\n");
  return `import { test, expect } from '@playwright/test';\n\ntest(${quote(testTitle(name))}, async ({ page }) => {\n${body}\n});\n`;
}

// ── Annotations ──

function locatorNote(s: Suggestion): Note {
  const d = s.detail ?? {};
  switch (s.strategy) {
    case "role":
      if (s.parts.every((p) => p.by !== "role" || !p.name)) {
        return {
          title: "Role alone is enough",
          body: "Only one element has this role, so no name is needed. Live regions like status and alert are a good, semantic way to find toasts and messages that have no name.",
          docs: DOCS.locators,
        };
      }
      return {
        title: "Role + accessible name",
        body: "This is how users and screen readers find the element, so the test only breaks when the UI really changes, not when a class name or wrapper div does. It's Playwright's first recommendation for locators.",
        docs: DOCS.locators,
      };
    case "role-exact":
      return {
        title: "Why exact: true",
        body: d.conflict
          ? `Name matching is a case-insensitive substring by default, so this would also match '${d.conflict}'. exact: true narrows it to the one element.`
          : "Name matching is a case-insensitive substring by default; exact: true pins it to the full name.",
        docs: DOCS.locators,
      };
    case "role-regex":
      return {
        title: "A regex for a changing name",
        body: `The name '${d.conflict}' contains a value that changes while the test runs. A regex keeps the locator stable without falling back to something less specific.`,
        docs: DOCS.locators,
      };
    case "label":
      return {
        title: "getByLabel for form fields",
        body: "Finding a field by its label is how a user fills the form, and it also checks that the label is actually connected to the input. If it isn't, the test fails, which is what you want.",
        docs: DOCS.locators,
      };
    case "placeholder":
      return {
        title: "getByPlaceholder, with a caveat",
        body: "This field has a placeholder but no label. getByRole('searchbox') would work too, since browsers fall back to the placeholder for its name, but getByPlaceholder says what's really happening. In review I'd flag the field itself: placeholder-only inputs are an accessibility gap, and adding a label would make the test better too.",
        docs: DOCS.locators,
      };
    case "text":
      return {
        title: "getByText for static content",
        body: "Fine for non-interactive content. For buttons and links I use getByRole instead, so the test also checks the element's role.",
        docs: DOCS.locators,
      };
    case "testid":
      return {
        title: "Test id as a fallback",
        body: "Nothing a user can see identifies this element uniquely, so this uses data-testid: an explicit contract between the app and its tests.",
        docs: DOCS.locators,
      };
    case "testid-assert":
      return {
        title: "Avoiding a circular locator",
        body: "Finding this element by the same text you're asserting means the locator and the assertion pass or fail together. A test id finds the element independently of the value being checked.",
        docs: DOCS.bestPractices,
      };
    case "scoped":
      return {
        title: "Scoping instead of nth()",
        body: `${d.count ?? "Several"} elements match on their own${
          d.outside ? `, including ${d.outside === 1 ? "one" : d.outside} the app never rendered: Next.js adds a hidden route announcer to every page` : ""
        }. Instead of .nth(), which breaks when the order changes, the locator first narrows to the ${d.scopeRole}${d.hasText ? ` containing '${d.hasText}'` : ""}.`,
        docs: DOCS.filter,
      };
    case "css":
      return {
        title: "CSS fallback (a smell)",
        body: "Last resort: nothing semantic identifies this element. A positional selector like this is brittle. In a real codebase I'd add a role, label or test id instead of keeping it.",
        docs: DOCS.bestPractices,
      };
  }
}

function actionNote(action: Action): Note {
  switch (action.type) {
    case "goto":
      return {
        title: "Relative URL",
        body: "This resolves against baseURL in playwright.config.ts, so the same test runs on localhost, preview deploys and production.",
        docs: DOCS.baseURL,
      };
    case "click":
      return {
        title: "No manual waits",
        body: "click() waits for the element to be attached, visible, stable, enabled and not covered before it acts. No waitForTimeout or waitForSelector needed.",
        docs: DOCS.actionability,
      };
    case "fill":
      return action.secret
        ? {
            title: "About that password",
            body: "Hardcoded here so the demo runs. In a real suite it comes from an env var, or better, a setup project saves storageState once so most tests skip the login form entirely.",
            docs: DOCS.auth,
          }
        : {
            title: "fill(), not type()",
            body: "fill() focuses, clears and sets the value in one call, so there's no need to click() first. pressSequentially() is only for inputs that react to each keystroke.",
            docs: DOCS.input,
          };
    case "check":
    case "uncheck":
      return {
        title: `${action.type}() over click()`,
        body: `${action.type}() is idempotent: it only clicks when needed, then confirms the box actually ended up ${action.type === "check" ? "checked" : "unchecked"}.`,
        docs: DOCS.input,
      };
    case "select":
      return {
        title: "selectOption()",
        body: "Selects on a native <select> by value or label, and waits for the option to exist first.",
        docs: DOCS.input,
      };
    case "press":
      return {
        title: `press('${action.key}')`,
        body: "Submits the way a keyboard user would, which tests the form's submit handling as well as the button.",
        docs: DOCS.input,
      };
    case "expect":
      return {
        toBeVisible: {
          title: "Web-first assertion",
          body: "expect(locator).toBeVisible() retries until it passes or times out. Compare expect(await locator.isVisible()).toBe(true), which checks once and becomes a flaky test.",
          docs: DOCS.assertions,
        },
        toHaveText: {
          title: "toHaveText()",
          body: "Retries until the text matches, so values that update asynchronously are fine. It matches the full string; toContainText is for partial matches.",
          docs: DOCS.assertions,
        },
        toHaveValue: {
          title: "toHaveValue()",
          body: "Checks what the field ended up holding, not what was typed, which catches input masks and controlled-input bugs.",
          docs: DOCS.assertions,
        },
        toBeChecked: {
          title: "toBeChecked()",
          body: "Checks the real checked state, which also works for custom checkboxes built with role=\"checkbox\" and aria-checked.",
          docs: DOCS.assertions,
        },
      }[action.assertion];
  }
}

const HINTS: Record<string, Note> = {
  "async-list": {
    title: "Async content",
    body: "These products load after a delay. The locator retries until they render, so the test never needs to know how slow the API was.",
    docs: DOCS.actionability,
  },
  transient: {
    title: "Transient UI",
    body: "This toast disappears after a few seconds. Web-first assertions poll, so they catch it while it's visible. A single check could easily miss it.",
    docs: DOCS.assertions,
  },
  disables: {
    title: "Busy state",
    body: "This button disables itself while the order submits. The next step's locator waits for the confirmation screen, so no sleep is needed.",
    docs: DOCS.actionability,
  },
};

export function explain(step: Step): Note[] {
  const notes: Note[] = [];
  if (step.locator) notes.push(locatorNote(step.locator));
  notes.push(actionNote(step.action));
  if (step.hint && HINTS[step.hint]) notes.push(HINTS[step.hint]);
  return notes;
}
