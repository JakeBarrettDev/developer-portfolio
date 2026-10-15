import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { site } from "@/data/site";
import { GitHubIcon, LinkedInIcon } from "@/components/icons";
import ContactForm from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Hire Jake, or start a website project with Maroon Raccoon.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-12">
      <div>
        <p className="eyebrow animate-fade-up text-accent">Contact</p>
        <h1 className="animate-fade-up mt-4 font-display text-4xl font-medium tracking-tight sm:text-5xl" style={{ animationDelay: "50ms" }}>
          Hiring, or need a website?
        </h1>
        <p
          className="animate-fade-up mt-4 text-lg leading-relaxed text-muted-foreground"
          style={{ animationDelay: "100ms" }}
        >
          Either way, this lands in my inbox. Tell me a little about the role or the project and I&apos;ll get back
          to you.
        </p>
      </div>

      {/* Quick links */}
      <div
        className="animate-fade-up grid gap-4 sm:grid-cols-3"
        style={{ animationDelay: "200ms" }}
      >
        <a
          href={`mailto:${site.email}`}
          className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-glow"
        >
          <div className="rounded-full bg-accent-light p-2.5">
            <Mail className="h-4 w-4 text-accent" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium group-hover:text-accent transition-colors">Say hello</p>
          </div>
        </a>
        <a
          href={site.github}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-glow"
        >
          <div className="rounded-full bg-accent-light p-2.5">
            <GitHubIcon className="h-4 w-4 text-accent" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">GitHub</p>
            <p className="text-sm font-medium group-hover:text-accent transition-colors">See my code</p>
          </div>
        </a>
        <a
          href={site.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-glow"
        >
          <div className="rounded-full bg-accent-light p-2.5">
            <LinkedInIcon className="h-4 w-4 text-accent" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">LinkedIn</p>
            <p className="text-sm font-medium group-hover:text-accent transition-colors">Connect</p>
          </div>
        </a>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          or send a message
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Form */}
      <div
        className="animate-fade-up"
        style={{ animationDelay: "300ms" }}
      >
        <ContactForm />
      </div>
    </div>
  );
}
