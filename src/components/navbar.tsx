"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FileDown, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-tight text-accent transition-opacity hover:opacity-80"
        >
          Jake Barrett
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "link-underline text-sm tracking-wide transition-colors",
                pathname === href
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </Link>
          ))}
          <a
            href="/resume.pdf"
            download
            className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-light px-4 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <FileDown className="h-3.5 w-3.5" />
            Resume
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="text-muted-foreground transition-colors hover:text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border/60 px-6 pb-5 pt-3 md:hidden">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block py-2.5 text-sm tracking-wide transition-colors",
                pathname === href
                  ? "text-accent font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </Link>
          ))}
          <a
            href="/resume.pdf"
            download
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-light px-4 py-1.5 text-sm font-medium text-accent"
          >
            <FileDown className="h-3.5 w-3.5" />
            Resume
          </a>
        </div>
      )}
    </nav>
  );
}
