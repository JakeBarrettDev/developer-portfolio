import { Mail } from "lucide-react";
import Image from "next/image";
import { GitHubIcon, LinkedInIcon } from "./icons";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-6 py-12">
        {/* Logo */}
        <a
          href="https://maroonraccoon.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="relative block h-12 w-12 opacity-40 transition-opacity hover:opacity-70"
        >
          <Image
            src="/maroon-raccoon-logo.svg"
            alt="Maroon Raccoon"
            fill
            className="object-contain brightness-200"
          />
        </a>

        {/* Social links */}
        <div className="flex gap-6">
          <a
            href="https://github.com/JakeBarrettDev"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-border p-2.5 text-muted-foreground transition-all hover:border-accent/40 hover:text-accent hover:shadow-lg hover:shadow-glow"
            aria-label="GitHub"
          >
            <GitHubIcon className="h-5 w-5" />
          </a>
          <a
            href="https://www.linkedin.com/in/jacob-barrett-844007115/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-border p-2.5 text-muted-foreground transition-all hover:border-accent/40 hover:text-accent hover:shadow-lg hover:shadow-glow"
            aria-label="LinkedIn"
          >
            <LinkedInIcon className="h-5 w-5" />
          </a>
          <a
            href="mailto:jacob_barrett@icloud.com"
            className="rounded-full border border-border p-2.5 text-muted-foreground transition-all hover:border-accent/40 hover:text-accent hover:shadow-lg hover:shadow-glow"
            aria-label="Email"
          >
            <Mail className="h-5 w-5" />
          </a>
        </div>

        {/* Copyright */}
        <p className="text-xs tracking-wide text-muted-foreground">
          &copy; {new Date().getFullYear()}{" "}
          <span className="font-medium text-accent">Jake Barrett</span>
          {" "}&mdash;{" "}
          Built with Next.js
        </p>
      </div>
    </footer>
  );
}
