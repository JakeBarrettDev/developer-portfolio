import { Mail } from "lucide-react";
import Image from "next/image";
import { GitHubIcon, LinkedInIcon } from "./icons";
import { site } from "@/data/site";

const social = "rounded-full border border-border p-2.5 text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent";

/** Colophon: who this is, how to reach me, and the studio behind the client work. */
export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-6 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-display text-2xl font-medium">Jake Barrett</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            QA automation at VML. Websites for artists and small businesses through{" "}
            <a href={site.studio.url} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-accent">
              {site.studio.name}
            </a>
            .
          </p>
        </div>

        <div className="md:col-span-4">
          <p className="eyebrow text-muted-foreground">Get in touch</p>
          <a href={`mailto:${site.email}`} className="mt-3 inline-block break-all font-display text-lg hover:text-accent">
            {site.email}
          </a>
        </div>

        <div className="flex items-start gap-3 md:col-span-3 md:justify-end">
          <a href={site.github} target="_blank" rel="noopener noreferrer" className={social} aria-label="GitHub">
            <GitHubIcon className="h-5 w-5" />
          </a>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className={social} aria-label="LinkedIn">
            <LinkedInIcon className="h-5 w-5" />
          </a>
          <a href={`mailto:${site.email}`} className={social} aria-label="Email">
            <Mail className="h-5 w-5" />
          </a>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border/60 pt-6 md:col-span-12">
          <p className="eyebrow text-muted-foreground">
            &copy; {new Date().getFullYear()} Jake Barrett · Built with Next.js
          </p>
          <a href={site.studio.url} target="_blank" rel="noopener noreferrer" className="relative block h-8 w-8 opacity-40 transition-opacity hover:opacity-70">
            <Image src="/maroon-raccoon-logo.svg" alt={site.studio.name} fill className="object-contain brightness-200" />
          </a>
        </div>
      </div>
    </footer>
  );
}
