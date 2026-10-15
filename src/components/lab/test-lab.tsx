"use client";

import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { Check, CircleDot, Copy, ExternalLink, Pause, RotateCcw, ScanSearch, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { isFormControl, normalize } from "@/lib/lab/aria";
import { locatorCode, pageRoots, resolve, suggestLocator, type Review, type Suggestion } from "@/lib/lab/locator";
import { locatorOptions, review } from "@/lib/lab/review";
import { parseLocator } from "@/lib/lab/parse";
import { explain, stepCode, testFile, type Action, type Assertion, type Step } from "@/lib/lab/steps";
import SandboxApp from "./sandbox-app";
import CodeLine from "./code-line";

type Mode = "record" | "assert" | "paused";

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface AssertOption {
  label: string;
  action: Extract<Action, { type: "expect" }>;
  locator: Suggestion;
  options: Suggestion[];
  target: Element;
  hint?: string;
}

const SANDBOX_URL = "/lab/sandbox";
const GOTO: Step = { id: "goto", action: { type: "goto", url: SANDBOX_URL } };

const INTERACTIVE = "button, a[href], input, select, textarea, [role='button'], [role='link'], [role='checkbox'], [role='tab']";
const TEXT_INPUT_TYPES = new Set(["text", "email", "password", "search", "tel", "url", "number"]);

const isTextInput = (el: Element): el is HTMLInputElement | HTMLTextAreaElement =>
  el instanceof HTMLTextAreaElement || (el instanceof HTMLInputElement && TEXT_INPUT_TYPES.has(el.type));

/**
 * The element a click or hover really refers to, e.g. the button rather than
 * the icon inside it. "action" targets are things a click gets recorded on;
 * "inspect" also covers text, headings and images, for hovering and asserting.
 */
function pickTarget(raw: EventTarget | null, root: Element, purpose: "action" | "inspect"): Element | null {
  if (!(raw instanceof Element) || !root.contains(raw) || raw === root) return null;
  const interactive = raw.closest(INTERACTIVE);
  if (interactive && root.contains(interactive)) return interactive;

  const label = raw.closest("label");
  if (label?.control && root.contains(label.control)) return purpose === "inspect" ? label.control : null;

  if (purpose !== "inspect") return null;
  const meaningful = raw.closest("img, [data-testid], [role='status'], [role='alert'], h1, h2, h3, h4, h5, h6");
  if (meaningful && root.contains(meaningful)) return meaningful;
  const hasOwnText = Array.from(raw.childNodes).some((n) => n.nodeType === Node.TEXT_NODE && normalize(n.textContent));
  return hasOwnText ? raw : null;
}

function hintFor(el: Element, root: Element): string | undefined {
  const hinted = el.closest("[data-lab-hint]");
  return hinted && root.contains(hinted) ? (hinted.getAttribute("data-lab-hint") ?? undefined) : undefined;
}

function assertOptions(el: Element, root: Element): AssertOption[] {
  const base = locatorOptions(el, root);
  const hint = hintFor(el, root);
  const options: AssertOption[] = [];
  const add = (assertion: Assertion, value: string | undefined, located = base) =>
    options.push({
      label: value === undefined ? `${assertion}()` : `${assertion}('${value}')`,
      action: { type: "expect", assertion, value },
      locator: located.best,
      options: located.options,
      target: el,
      hint,
    });
  add("toBeVisible", undefined);

  if (el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio")) {
    if (el.checked) add("toBeChecked", undefined);
  } else if (isFormControl(el)) {
    if (el.value) add("toHaveValue", el.value);
  } else {
    const text = normalize(el.textContent);
    if (text && text.length <= 80) add("toHaveText", text, locatorOptions(el, root, { assertText: text }));
  }

  // Anything inside a list can assert on how many items the list has.
  const list = el.closest("ul, ol, [role='list']");
  if (list && root.contains(list)) {
    const listLocator = locatorOptions(list, root).best;
    const items: Suggestion = { parts: [...listLocator.parts, { by: "role", role: "listitem" }], strategy: listLocator.strategy };
    const count = resolve(items.parts, pageRoots(root)).length;
    options.push({
      label: `toHaveCount(${count})`,
      action: { type: "expect", assertion: "toHaveCount", value: String(count) },
      locator: items,
      options: [],
      target: list,
      hint,
    });
  }
  return options;
}

export default function TestLab() {
  const [mode, setMode] = useState<Mode>("record");
  const [steps, setSteps] = useState<Step[]>([GOTO]);
  const [selected, setSelected] = useState<string>(GOTO.id);
  const [testName, setTestName] = useState("find my matches");
  const [sandboxKey, setSandboxKey] = useState(0);
  const [hover, setHover] = useState<{ box: Box; code: string } | null>(null);
  const [highlights, setHighlights] = useState<Box[]>([]);
  const [menu, setMenu] = useState<{ box: Box; pos: { top: number; left: number }; options: AssertOption[] } | null>(null);
  const [copied, setCopied] = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);
  const lastFill = useRef<{ el: Element; id: string } | null>(null);
  const popupCount = useRef(0);
  const skipClickUntil = useRef(0);
  const modeRef = useRef(mode);

  const boxOf = useCallback((el: Element): Box => {
    const r = el.getBoundingClientRect();
    const f = frameRef.current!.getBoundingClientRect();
    return { top: r.top - f.top, left: r.left - f.left, width: r.width, height: r.height };
  }, []);

  const addStep = useCallback((step: Omit<Step, "id">) => {
    const id = `s${nextId.current++}`;
    lastFill.current = null;
    setSteps((s) => [...s, { ...step, id }]);
    setSelected(id);
    return id;
  }, []);

  /**
   * Called from capture-phase listeners, before the sandbox's own handlers run.
   * The locator is computed now, while the DOM still matches the event. State
   * updates go through a transition so React doesn't flush them mid-dispatch,
   * which would reset the sandbox's controlled inputs before onChange runs.
   */
  const record = useCallback(
    (el: Element, action: Action, opts?: { merge?: boolean }) => {
      const root = rootRef.current!;
      const prev = lastFill.current;
      if (opts?.merge && prev?.el === el) {
        startTransition(() => setSteps((s) => s.map((step) => (step.id === prev.id ? { ...step, action } : step))));
        return;
      }
      const { best, options } = locatorOptions(el, root);
      const step = { action, locator: best, options, target: el, hint: hintFor(el, root) };
      const id = `s${nextId.current++}`;
      lastFill.current = opts?.merge ? { el, id } : null;
      startTransition(() => {
        setSteps((s) => [...s, { ...step, id }]);
        setSelected(id);
      });
    },
    [],
  );

  // ── Capture-phase listeners on the sandbox ──
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onClick = (e: MouseEvent) => {
      const m = modeRef.current;
      if (m === "paused") return;
      const target = pickTarget(e.target, root, m === "assert" ? "inspect" : "action");

      if (m === "assert") {
        e.preventDefault();
        e.stopPropagation();
        if (!target) return;
        const box = boxOf(target);
        const frame = frameRef.current!;
        const options = assertOptions(target, root);
        const height = 40 + options.length * 34;
        const below = box.top + box.height + 8;
        setMenu({
          box,
          // Below the element, or above it when it would spill out of the frame.
          pos: {
            top: below + height <= frame.clientHeight ? below : Math.max(8, box.top - height - 8),
            left: Math.max(8, Math.min(box.left, frame.clientWidth - 264)),
          },
          options,
        });
        return;
      }

      startTransition(() => setHover(null));
      if (!target || isFormControl(target)) return; // fills, checks and selects are recorded from input/change
      if (e.detail === 0 && performance.now() < skipClickUntil.current) return; // Enter's synthetic submit click
      if (target instanceof HTMLAnchorElement && target.target === "_blank") {
        record(target, { type: "click", popup: { index: ++popupCount.current, host: new URL(target.href).hostname } });
      } else {
        record(target, { type: "click" });
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      // Keep the picker from focusing inputs or selecting text.
      if (modeRef.current === "assert") e.preventDefault();
    };

    const onInput = (e: Event) => {
      if (modeRef.current !== "record" || !(e.target instanceof Element) || !isTextInput(e.target)) return;
      const el = e.target;
      record(el, { type: "fill", value: el.value, secret: el.type === "password" }, { merge: true });
    };

    const onChange = (e: Event) => {
      if (modeRef.current !== "record") return;
      const el = e.target;
      if (el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio")) {
        record(el, { type: el.checked ? "check" : "uncheck" });
      } else if (el instanceof HTMLSelectElement) {
        record(el, { type: "select", option: normalize(el.selectedOptions[0]?.textContent) });
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (modeRef.current !== "record" || !(e.target instanceof Element)) return;
      if (e.key === "Enter" && isTextInput(e.target)) {
        skipClickUntil.current = performance.now() + 100;
        record(e.target, { type: "press", key: "Enter" });
      } else if (e.key === "Escape") {
        const target = pickTarget(e.target, root, "action");
        if (target) record(target, { type: "press", key: "Escape" });
      }
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = modeRef.current === "paused" ? null : pickTarget(e.target, root, "inspect");
      setHover(target ? { box: boxOf(target), code: locatorCode(suggestLocator(target, root).parts) } : null);
    };
    const onMouseLeave = () => setHover(null);

    root.addEventListener("click", onClick, true);
    root.addEventListener("mousedown", onMouseDown, true);
    root.addEventListener("input", onInput, true);
    root.addEventListener("change", onChange, true);
    root.addEventListener("keydown", onKeyDown, true);
    root.addEventListener("mouseover", onMouseOver);
    root.addEventListener("mouseleave", onMouseLeave);
    return () => {
      root.removeEventListener("click", onClick, true);
      root.removeEventListener("mousedown", onMouseDown, true);
      root.removeEventListener("input", onInput, true);
      root.removeEventListener("change", onChange, true);
      root.removeEventListener("keydown", onKeyDown, true);
      root.removeEventListener("mouseover", onMouseOver);
      root.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [boxOf, record]);

  const changeMode = (next: Mode) => {
    modeRef.current = next;
    setMode(next);
    setHover(null);
    setMenu(null);
  };

  const startOver = () => {
    setSteps([GOTO]);
    setSelected(GOTO.id);
    setSandboxKey((k) => k + 1);
    setMenu(null);
    setHover(null);
    lastFill.current = null;
    popupCount.current = 0;
  };

  const removeStep = (id: string) => {
    setSteps((s) => s.filter((step) => step.id !== id));
    if (lastFill.current?.id === id) lastFill.current = null;
    if (selected === id) setSelected(GOTO.id);
  };

  const pickLocator = (id: string, locator: Suggestion) =>
    setSteps((s) => s.map((step) => (step.id === id ? { ...step, locator } : step)));

  const issueCount = steps.filter((step) => toneOf(step)).length;

  const showElement = (step: Step) => {
    const root = rootRef.current;
    if (!root || !step.locator) return setHighlights([]);
    setHighlights(resolve(step.locator.parts, root).map(boxOf));
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(testFile(testName, steps));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked (permissions, insecure context); nothing useful to do.
    }
  };

  const modes: { id: Mode; label: string; icon: typeof CircleDot }[] = [
    { id: "record", label: "Record", icon: CircleDot },
    { id: "assert", label: "Assert", icon: ScanSearch },
    { id: "paused", label: "Pause", icon: Pause },
  ];

  return (
    <div className="space-y-4">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div role="radiogroup" aria-label="Recorder mode" className="inline-flex rounded-full border border-border bg-surface p-1">
          {modes.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={mode === id}
              onClick={() => changeMode(id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                mode === id ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", id === "record" && mode === "record" && "animate-pulse")} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {mode === "record" && "Use the app. Every action becomes a line of the test."}
          {mode === "assert" && "Click any element to add an expectation."}
          {mode === "paused" && "Recording paused. The app works normally."}
        </p>
        <button
          type="button"
          onClick={startOver}
          className="ml-auto inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-accent"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Start over
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* ── Browser frame ── */}
        <div className="overflow-hidden rounded-2xl border border-border bg-muted shadow-xl shadow-black/10">
          <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
            </div>
            <div className="flex-1 truncate rounded-md bg-background/70 px-3 py-1 font-mono text-xs text-muted-foreground">
              localhost:3000{SANDBOX_URL}
            </div>
            <a
              href={SANDBOX_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Open the sandbox on its own page"
              className="text-muted-foreground transition-colors hover:text-accent"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>

          <div ref={frameRef} className={cn("relative", mode === "assert" && "cursor-crosshair [&_*]:!cursor-crosshair")}>
            <div ref={rootRef}>
              <SandboxApp key={sandboxKey} />
            </div>

            {/* Overlay lives outside the sandbox root so it never affects locator resolution. */}
            <div className="pointer-events-none absolute inset-0 z-30" aria-hidden={!menu}>
              {highlights.map((b, i) => (
                <div
                  key={i}
                  className="absolute rounded-md border-2 border-dashed border-sky-400 bg-sky-400/10"
                  style={{ top: b.top - 2, left: b.left - 2, width: b.width + 4, height: b.height + 4 }}
                />
              ))}
              {hover && !menu && (
                <div
                  className="absolute rounded-md border-2 border-sky-400 bg-sky-400/10 transition-all duration-75"
                  style={{ top: hover.box.top - 3, left: hover.box.left - 3, width: hover.box.width + 6, height: hover.box.height + 6 }}
                />
              )}
              {menu && (
                <div className="pointer-events-auto absolute inset-0" onClick={() => setMenu(null)}>
                  <div
                    className="absolute rounded-md border-2 border-accent"
                    style={{ top: menu.box.top - 2, left: menu.box.left - 2, width: menu.box.width + 4, height: menu.box.height + 4 }}
                  />
                  <div
                    role="menu"
                    aria-label="Add assertion"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.key === "Escape" && setMenu(null)}
                    className="absolute w-64 overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
                    style={menu.pos}
                  >
                    <p className="border-b border-border px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      expect(locator)
                    </p>
                    {menu.options.map((o) => (
                      <button
                        key={o.label}
                        type="button"
                        role="menuitem"
                        autoFocus={o === menu.options[0]}
                        onClick={() => {
                          addStep({ action: o.action, locator: o.locator, options: o.options, target: o.target, hint: o.hint });
                          changeMode("record");
                        }}
                        className="block w-full truncate px-3 py-2 text-left font-mono text-xs transition-colors hover:bg-accent-light hover:text-accent focus:bg-accent-light focus:text-accent focus:outline-none"
                      >
                        .{o.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Locator bar, like the Playwright inspector's. */}
          <div className="flex items-center gap-2 border-t border-border bg-[#141416] px-4 py-2 font-mono text-[11px] text-[#7f848e]">
            <ScanSearch className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <div className="min-w-0 truncate">
              {hover ? <CodeLine code={hover.code} /> : mode === "paused" ? "Paused" : "Hover an element to see its locator"}
            </div>
          </div>
        </div>

        {/* ── Generated code ── */}
        <div className="flex min-h-[30rem] flex-col overflow-hidden rounded-2xl border border-[#2e2e32] bg-[#141416] text-[#e8e4df] shadow-xl shadow-black/10">
          <div className="flex items-center gap-3 border-b border-[#2e2e32] px-4 py-2.5">
            <span className="font-mono text-xs text-[#9a9590]">swesso.spec.ts</span>
            <span className="rounded-full bg-[#a01a2a]/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#f08a98]">
              {steps.length - 1} step{steps.length === 2 ? "" : "s"}
            </span>
            {issueCount > 0 && (
              <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                {issueCount} to review
              </span>
            )}
            <button
              type="button"
              onClick={copy}
              className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-[#9a9590] transition-colors hover:bg-white/5 hover:text-[#e8e4df]"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="flex-1 overflow-auto py-3 font-mono text-[12.5px] leading-6">
            <div className="px-4">
              <CodeLine code="import { test, expect } from '@playwright/test';" />
            </div>
            <div className="px-4">&nbsp;</div>
            <div className="whitespace-pre px-4">
              <span className="text-[#ffcb6b]">test</span>(<span className="text-[#c3e88d]">&apos;</span>
              <input
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                aria-label="Test name"
                spellCheck={false}
                size={Math.max(testName.length, 4)}
                className="border-b border-dashed border-[#c3e88d]/40 bg-transparent text-[#c3e88d] outline-none focus:border-[#c3e88d]"
              />
              <span className="text-[#c3e88d]">&apos;</span>, <span className="text-[#e5677a]">async</span> {"({ page }) => {"}
            </div>

            {steps.map((step) => {
              const isSelected = step.id === selected;
              const tone = toneOf(step);
              return (
                <div
                  key={step.id}
                  className={cn("group relative border-l-2 transition-colors", isSelected ? "border-[#e5677a] bg-white/[0.04]" : "border-transparent hover:bg-white/[0.02]")}
                  onMouseEnter={() => showElement(step)}
                  onMouseLeave={() => setHighlights([])}
                >
                  {tone && (
                    <span
                      title={tone === "error" ? "This locator fails" : "This locator is brittle"}
                      className={cn("absolute left-1.5 top-[0.55rem] h-1.5 w-1.5 rounded-full", tone === "error" ? "bg-red-400" : "bg-amber-300")}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setSelected(step.id)}
                    aria-expanded={isSelected}
                    className="block w-full cursor-pointer whitespace-pre px-4 text-left focus:outline-none focus-visible:bg-white/[0.06]"
                  >
                    {stepCode(step)
                      .split("\n")
                      .map((line, i) => (
                        <div key={i}>
                          {"  "}
                          <CodeLine code={line} />
                        </div>
                      ))}
                  </button>
                  {step.id !== GOTO.id && (
                    <button
                      type="button"
                      onClick={() => removeStep(step.id)}
                      aria-label="Delete step"
                      className="absolute right-2 top-1 rounded p-0.5 text-[#7f848e] opacity-0 transition-opacity hover:text-[#e5677a] focus:opacity-100 group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                  {isSelected && (
                    <>
                      <Notes step={step} />
                      {step.options && step.options.length > 0 && (
                        <LocatorPicker step={step} getRoot={() => rootRef.current} onPick={(l) => pickLocator(step.id, l)} />
                      )}
                    </>
                  )}
                </div>
              );
            })}

            {steps.length === 1 && (
              <div className="px-4">
                <CodeLine code="  // Log in (any email and password) or continue as a guest." />
              </div>
            )}
            <div className="px-4">{"});"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Notes({ step }: { step: Step }) {
  return (
    <div className="space-y-2 px-4 pb-3 pt-1 font-body">
      {explain(step).map((note) => (
        <div key={note.title} className={cn("rounded-lg border px-3 py-2", note.tone ? TONE_STYLES[note.tone].box : "border-[#2e2e32] bg-[#1a1a1d]")}>
          <p className={cn("flex items-center gap-2 text-xs font-semibold", note.tone ? TONE_STYLES[note.tone].title : "text-[#e8e4df]")}>
            {note.title}
            {note.docs && (
              <a
                href={note.docs}
                target="_blank"
                rel="noreferrer"
                className="ml-auto text-[10px] font-medium uppercase tracking-wider text-[#82aaff] hover:underline"
              >
                Docs
              </a>
            )}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#9a9590]">{note.body}</p>
        </div>
      ))}
    </div>
  );
}

const TONE_STYLES = {
  error: { box: "border-red-400/30 bg-red-400/[0.07]", title: "text-red-300" },
  warning: { box: "border-amber-300/30 bg-amber-300/[0.07]", title: "text-amber-200" },
  info: { box: "border-sky-400/25 bg-sky-400/[0.06]", title: "text-sky-200" },
};

const GRADES: Record<Review["grade"], { label: string; className: string }> = {
  solid: { label: "Solid", className: "bg-emerald-400/15 text-emerald-300" },
  ok: { label: "OK", className: "bg-sky-400/15 text-sky-300" },
  brittle: { label: "Brittle", className: "bg-amber-300/15 text-amber-200" },
  fails: { label: "Fails", className: "bg-red-400/15 text-red-300" },
};

/** The worst review finding on a step's locator, for the gutter marker. */
function toneOf(step: Step): "error" | "warning" | null {
  const issues = step.locator?.review?.issues ?? [];
  if (issues.some((i) => i.tone === "error")) return "error";
  if (issues.some((i) => i.tone === "warning")) return "warning";
  return null;
}

function GradePill({ grade }: { grade: Review["grade"] }) {
  return (
    <span className={cn("shrink-0 rounded px-1.5 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wider", GRADES[grade].className)}>
      {GRADES[grade].label}
    </span>
  );
}

function LocatorPicker({
  step,
  getRoot,
  onPick,
}: {
  step: Step;
  getRoot: () => Element | null;
  onPick: (locator: Suggestion) => void;
}) {
  const [draft, setDraft] = useState("");
  const [result, setResult] = useState<{ error: string } | { suggestion: Suggestion } | null>(null);
  const current = step.locator && locatorCode(step.locator.parts);
  const options = step.options ?? [];
  const isCustom = step.locator && !options.some((o) => locatorCode(o.parts) === current);
  const assertText = step.action.type === "expect" && step.action.assertion === "toHaveText" ? step.action.value : undefined;

  const evaluate = (value: string) => {
    setDraft(value);
    const root = getRoot();
    if (!value.trim() || !root) return setResult(null);
    const parsed = parseLocator(value);
    if ("error" in parsed) return setResult(parsed);
    const verdict = review(parsed.parts, pageRoots(root), { target: step.target, assertText });
    setResult({ suggestion: { parts: parsed.parts, strategy: "custom", review: verdict } });
  };

  const rows = isCustom && step.locator ? [step.locator, ...options] : options;

  return (
    <div className="mx-4 mb-3 overflow-hidden rounded-lg border border-[#2e2e32] font-body">
      <p className="flex items-baseline justify-between gap-2 border-b border-[#2e2e32] bg-[#1a1a1d] px-3 py-2 text-xs font-semibold text-[#e8e4df]">
        Locator options
        <span className="text-[10px] font-normal text-[#7f848e]">Try a worse one and see what I&apos;d say in review</span>
      </p>
      <ul>
        {rows.map((o, i) => {
          const code = locatorCode(o.parts);
          const active = code === current;
          return (
            <li key={code}>
              <button
                type="button"
                onClick={() => onPick(o)}
                aria-pressed={active}
                className={cn(
                  "flex w-full items-center gap-2 border-l-2 px-3 py-1.5 text-left transition-colors",
                  active ? "border-[#82aaff] bg-white/[0.05]" : "border-transparent hover:bg-white/[0.03]",
                )}
              >
                {o.review && <GradePill grade={o.review.grade} />}
                <span className="min-w-0 flex-1 truncate font-mono text-[11px]">
                  <CodeLine code={code} />
                </span>
                {o.strategy === "custom" ? (
                  <span className="shrink-0 text-[10px] text-[#82aaff]">yours</span>
                ) : (
                  i === (isCustom ? 1 : 0) && <span className="shrink-0 text-[10px] text-emerald-300">recommended</span>
                )}
                {o.review && (
                  <span className="w-14 shrink-0 text-right text-[10px] text-[#7f848e]">
                    {o.review.count} match{o.review.count === 1 ? "" : "es"}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-[#2e2e32] p-3">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#7f848e]" htmlFor={`custom-${step.id}`}>
          Write your own
        </label>
        <div className="mt-1.5 flex gap-2">
          <input
            id={`custom-${step.id}`}
            value={draft}
            onChange={(e) => evaluate(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && result && "suggestion" in result) onPick(result.suggestion);
            }}
            placeholder="page.locator('//button[2]')"
            spellCheck={false}
            autoComplete="off"
            className="min-w-0 flex-1 rounded-md border border-[#2e2e32] bg-[#0f0f11] px-2 py-1.5 font-mono text-[11px] text-[#e8e4df] outline-none placeholder:text-[#5c6370] focus:border-[#82aaff]/60"
          />
          <button
            type="button"
            disabled={!result || !("suggestion" in result)}
            onClick={() => result && "suggestion" in result && onPick(result.suggestion)}
            className="rounded-md bg-[#82aaff]/15 px-2.5 text-[11px] font-semibold text-[#82aaff] transition-colors hover:bg-[#82aaff]/25 disabled:opacity-40"
          >
            Use
          </button>
        </div>
        {result && "error" in result && <p className="mt-1.5 text-[11px] text-red-300">{result.error}</p>}
        {result && "suggestion" in result && result.suggestion.review && (
          <p className="mt-1.5 flex items-center gap-2 text-[11px] text-[#9a9590]">
            <GradePill grade={result.suggestion.review.grade} />
            {result.suggestion.review.count} match{result.suggestion.review.count === 1 ? "" : "es"}
            {result.suggestion.review.issues[0] && <span className="truncate">· {result.suggestion.review.issues[0].title}</span>}
          </p>
        )}
      </div>
    </div>
  );
}
