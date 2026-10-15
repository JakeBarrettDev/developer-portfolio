"use client";

import { useEffect, useRef, useState } from "react";
import CodeLine from "@/components/lab/code-line";
import { cn } from "@/lib/utils";

/** Real output from the Lab: a short recorded flow, then a locator it rejects. */
const LINES = [
  "await page.goto('/lab/sandbox');",
  "await page.getByRole('button', { name: 'Log in as guest' }).click();",
  "await page.getByRole('button', { name: 'Love it' }).click();",
  "await page.getByRole('button', { name: /Matches \\(\\d+\\)/ }).click();",
  "await expect(",
  "  page.getByRole('list', { name: 'Your matches' })",
  "    .getByRole('listitem')",
  ").toHaveCount(1);",
];

const STEP_MS = 380;
const HIDDEN = "translate-y-1 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100";

/**
 * Types the lines in once the card scrolls into view, then shows a review of
 * a worse locator. Reduced-motion visitors get the finished card immediately.
 */
export default function LabTeaser() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(0);
  const total = LINES.length + 1; // +1 for the review row

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reduced motion: the motion-reduce: classes below show everything at once.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        timer = setInterval(() => {
          setShown((n) => {
            if (n + 1 >= total) clearInterval(timer);
            return Math.min(n + 1, total);
          });
        }, STEP_MS);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      clearInterval(timer);
    };
  }, [total]);

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-2xl border border-[#2e2e32] bg-[#141416] text-[#e8e4df] shadow-xl shadow-black/20"
    >
      <div className="flex items-center gap-3 border-b border-[#2e2e32] px-4 py-2.5">
        <span className="font-mono text-xs text-[#9a9590]">swesso.spec.ts</span>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#f08a98]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e5677a]" />
          Recording
        </span>
      </div>
      <div className="overflow-x-auto px-4 py-3 font-mono text-[11px] leading-6 xl:text-[11.5px]">
        {LINES.map((line, i) => (
          <div
            key={i}
            className={cn("whitespace-pre transition-all duration-300", i < shown ? "opacity-100" : HIDDEN)}
          >
            <CodeLine code={line} />
          </div>
        ))}
      </div>
      <div
        className={cn(
          "mx-4 mb-4 rounded-lg border border-red-400/30 bg-red-400/[0.07] px-3 py-2 transition-all duration-300",
          shown >= total ? "opacity-100" : HIDDEN,
        )}
      >
        <p className="flex items-center gap-2 font-mono text-[11px]">
          <span className="rounded bg-red-400/15 px-1.5 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wider text-red-300">
            Fails
          </span>
          <span className="truncate">
            <CodeLine code="page.getByText('Vincent van Gogh')" />
          </span>
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-[#9a9590]">
          Strict mode violation: 2 matches. The second is a card hidden behind the stack. getByRole skips it;
          getByText doesn&apos;t.
        </p>
      </div>
    </div>
  );
}
