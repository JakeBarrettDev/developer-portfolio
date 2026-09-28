"use client";

import { useEffect, useState } from "react";

/** Rotates through a list of roles. Holds on the first one if the visitor prefers reduced motion. */
export default function RoleCycler({ roles, interval = 2800 }: { roles: string[]; interval?: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % roles.length), interval);
    return () => clearInterval(id);
  }, [roles.length, interval]);

  return (
    <>
      <span className="sr-only">{roles.join(", ")}</span>
      <span aria-hidden="true" className="inline-block overflow-hidden align-bottom">
        <span key={index} className="animate-role-in inline-block">
          {roles[index]}
        </span>
      </span>
    </>
  );
}
