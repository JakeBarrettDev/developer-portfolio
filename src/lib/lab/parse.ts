import type { LocatorPart, Matcher } from "./locator";

/**
 * Parses the subset of Playwright's locator API the Lab can evaluate, e.g.
 * `page.getByRole('button', { name: 'Add to cart' }).filter({ hasText: 'Mug' }).nth(1)`.
 * A pasted full line (`await …click();`) works too: action calls end the chain.
 */

type Value = string | number | boolean | RegExpValue | { [key: string]: Value };
interface RegExpValue {
  regex: string;
  flags: string;
}

const ACTIONS = new Set([
  "click", "dblclick", "fill", "press", "pressSequentially", "type", "check", "uncheck", "selectOption",
  "hover", "focus", "blur", "tap", "setInputFiles", "clear", "textContent", "innerText", "isVisible",
  "toBeVisible", "toHaveText", "toHaveValue", "toBeChecked", "toHaveCount", "toContainText",
]);

class ParseError extends Error {}

class Parser {
  i = 0;
  constructor(private s: string) {}

  ws() {
    while (this.i < this.s.length && /\s/.test(this.s[this.i])) this.i++;
  }

  peek() {
    this.ws();
    return this.s[this.i];
  }

  eat(ch: string) {
    if (this.peek() !== ch) throw new ParseError(`Expected "${ch}" at position ${this.i + 1}.`);
    this.i++;
  }

  ident(): string {
    this.ws();
    const m = /^[A-Za-z_$][\w$]*/.exec(this.s.slice(this.i));
    if (!m) throw new ParseError(`Expected a name at position ${this.i + 1}.`);
    this.i += m[0].length;
    return m[0];
  }

  string(): string {
    const quoteChar = this.s[this.i];
    this.i++;
    let out = "";
    while (this.i < this.s.length && this.s[this.i] !== quoteChar) {
      if (this.s[this.i] === "\\") this.i++;
      if (quoteChar === "`" && this.s.slice(this.i, this.i + 2) === "${") throw new ParseError("Template expressions aren't supported.");
      out += this.s[this.i++] ?? "";
    }
    if (this.s[this.i] !== quoteChar) throw new ParseError("Unterminated string.");
    this.i++;
    return out;
  }

  regex(): RegExpValue {
    this.i++; // opening slash
    let source = "";
    let inClass = false;
    while (this.i < this.s.length) {
      const ch = this.s[this.i];
      if (ch === "\\") {
        source += ch + (this.s[this.i + 1] ?? "");
        this.i += 2;
        continue;
      }
      if (ch === "[") inClass = true;
      else if (ch === "]") inClass = false;
      else if (ch === "/" && !inClass) break;
      source += ch;
      this.i++;
    }
    if (this.s[this.i] !== "/") throw new ParseError("Unterminated regex.");
    this.i++;
    const flags = /^[dgimsuyv]*/.exec(this.s.slice(this.i))![0];
    this.i += flags.length;
    try {
      new RegExp(source, flags);
    } catch {
      throw new ParseError(`Invalid regex /${source}/${flags}.`);
    }
    return { regex: source, flags };
  }

  value(): Value {
    const ch = this.peek();
    if (ch === "'" || ch === '"' || ch === "`") return this.string();
    if (ch === "/") return this.regex();
    if (ch === "{") return this.object();
    const m = /^(-?\d+|true|false)/.exec(this.s.slice(this.i));
    if (m) {
      this.i += m[0].length;
      return m[0] === "true" ? true : m[0] === "false" ? false : Number(m[0]);
    }
    throw new ParseError(`Unexpected "${ch ?? "end of input"}" at position ${this.i + 1}.`);
  }

  object(): { [key: string]: Value } {
    this.eat("{");
    const out: { [key: string]: Value } = {};
    while (this.peek() !== "}") {
      const ch = this.peek();
      const key = ch === "'" || ch === '"' ? this.string() : this.ident();
      this.eat(":");
      out[key] = this.value();
      if (this.peek() === ",") this.i++;
      else break;
    }
    this.eat("}");
    return out;
  }

  args(): Value[] {
    this.eat("(");
    const out: Value[] = [];
    while (this.peek() !== ")") {
      out.push(this.value());
      if (this.peek() === ",") this.i++;
      else break;
    }
    this.eat(")");
    return out;
  }
}

function isRegex(v: Value | undefined): v is RegExpValue {
  return typeof v === "object" && v !== null && "regex" in v;
}

function asMatcher(v: Value | undefined, opts: Value | undefined, method: string): Matcher {
  if (isRegex(v)) return { kind: "regex", source: v.regex, flags: v.flags };
  if (typeof v !== "string") throw new ParseError(`${method}() takes a string or a regex.`);
  const exact = typeof opts === "object" && !isRegex(opts) && opts.exact === true;
  return { kind: "string", value: v, exact };
}

function locatorPart(selector: string): LocatorPart {
  if (selector.startsWith("xpath=")) return { by: "xpath", expr: selector.slice(6) };
  if (/^(\/\/|\.\.|\()/.test(selector)) return { by: "xpath", expr: selector };
  const css = selector.startsWith("css=") ? selector.slice(4) : selector;
  if (/^(text|role|id|data-testid)=/.test(css)) throw new ParseError("Legacy selector engines aren't supported here; use getByText() or getByRole().");
  try {
    document.createDocumentFragment().querySelector(css);
  } catch {
    throw new ParseError(`"${css}" isn't a valid CSS selector.`);
  }
  return { by: "css", selector: css };
}

export function parseLocator(source: string): { parts: LocatorPart[] } | { error: string } {
  let src = source.trim().replace(/^await\s+/, "").replace(/;$/, "");
  // Unwrap expect(…) so a pasted assertion line works.
  const expectMatch = /^expect\(([\s\S]*)\)\s*\.(?:not\.)?\w+\([\s\S]*\)$/.exec(src);
  if (expectMatch) src = expectMatch[1];
  if (!src) return { error: "Type a locator, like page.getByRole('button', { name: 'Checkout' })." };
  if (!src.startsWith("page")) src = `page.${src.replace(/^\./, "")}`;

  const p = new Parser(src);
  const parts: LocatorPart[] = [];
  try {
    if (p.ident() !== "page") throw new ParseError("Start from page, e.g. page.getByText('Total').");
    while (p.peek() !== undefined) {
      p.eat(".");
      const method = p.ident();
      if (ACTIONS.has(method)) break;
      const [a, b] = p.args();
      switch (method) {
        case "getByRole": {
          if (typeof a !== "string") throw new ParseError("getByRole() needs a role name, like 'button'.");
          const opts = typeof b === "object" && !isRegex(b) ? b : {};
          const name = opts.name === undefined ? undefined : asMatcher(opts.name, opts, "getByRole name");
          parts.push({ by: "role", role: a, name });
          break;
        }
        case "getByLabel":
          parts.push({ by: "label", text: asMatcher(a, b, method) });
          break;
        case "getByPlaceholder":
          parts.push({ by: "placeholder", text: asMatcher(a, b, method) });
          break;
        case "getByText":
          parts.push({ by: "text", text: asMatcher(a, b, method) });
          break;
        case "getByAltText":
          parts.push({ by: "alt", text: asMatcher(a, b, method) });
          break;
        case "getByTestId":
          if (typeof a !== "string") throw new ParseError("getByTestId() takes a string.");
          parts.push({ by: "testid", id: a });
          break;
        case "locator": {
          if (typeof a !== "string") throw new ParseError("locator() takes a selector string.");
          parts.push(locatorPart(a));
          const hasText = typeof b === "object" && !isRegex(b) ? b.hasText : undefined;
          if (typeof hasText === "string") parts.push({ by: "filter", hasText });
          break;
        }
        case "filter": {
          const hasText = typeof a === "object" && !isRegex(a) ? a.hasText : undefined;
          if (typeof hasText !== "string") throw new ParseError("The Lab supports filter({ hasText: '…' }) with a string.");
          parts.push({ by: "filter", hasText });
          break;
        }
        case "nth":
          if (typeof a !== "number") throw new ParseError("nth() takes a number.");
          parts.push({ by: "nth", index: a });
          break;
        case "first":
          parts.push({ by: "nth", index: 0 });
          break;
        case "last":
          parts.push({ by: "nth", index: -1 });
          break;
        default:
          throw new ParseError(`${method}() isn't supported in the Lab yet. Try getByRole, getByText, getByLabel, locator, filter or nth.`);
      }
    }
  } catch (e) {
    return { error: e instanceof ParseError ? e.message : "Couldn't read that locator." };
  }
  if (!parts.length) return { error: "That chain has no locator in it." };
  return { parts };
}
