import type { ReactNode } from "react";

/** Just enough TypeScript highlighting for generated Playwright code. */
const TOKEN =
  /('(?:\\.|[^'\\])*')|(\/(?:\\.|[^/\\])+\/[gimsuy]*)|(\/\/.*$)|\b(await|async|import|from|true)\b|\b(page|expect|test)\b|([A-Za-z_]\w*)(?=\()/g;

const COLORS = ["", "text-[#c3e88d]", "text-[#f78c6c]", "italic text-[#7f848e]", "text-[#e5677a]", "text-[#ffcb6b]", "text-[#82aaff]"];

export default function CodeLine({ code }: { code: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  for (const match of code.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) out.push(code.slice(last, index));
    const group = match.findIndex((m, i) => i > 0 && m !== undefined);
    out.push(
      <span key={index} className={COLORS[group]}>
        {match[0]}
      </span>,
    );
    last = index + match[0].length;
  }
  if (last < code.length) out.push(code.slice(last));
  return <>{out.length ? out : "\u00a0"}</>;
}
