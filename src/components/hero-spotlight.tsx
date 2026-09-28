"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/** Hero section with a soft glow that trails the mouse cursor. */
export default function HeroSpotlight({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  function handlePointerMove(e: React.PointerEvent<HTMLElement>) {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--hx", `${e.clientX - rect.left}px`);
    ref.current.style.setProperty("--hy", `${e.clientY - rect.top}px`);
  }

  return (
    <section
      ref={ref}
      onPointerMove={handlePointerMove}
      className={cn("hero-spotlight", className)}
    >
      {children}
    </section>
  );
}
