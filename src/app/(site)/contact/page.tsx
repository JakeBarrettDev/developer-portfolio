import type { Metadata } from "next";
import { Mail, MapPin } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/icons";
import ContactForm from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Jake.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-12">
      <div>
        <div className="animate-slide-left flex items-center gap-4">
          <h1 className="font-display text-3xl font-bold">Get in Touch</h1>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        </div>
        <p
          className="animate-fade-up mt-3 text-muted-foreground"
          style={{ animationDelay: "100ms" }}
        >
          Have a question or want to work together? I&apos;d love to hear from
          you.
        </p>
      </div>

      {/* Quick links */}
      <div
        className="animate-fade-up grid gap-4 sm:grid-cols-3"
        style={{ animationDelay: "200ms" }}
      >
        <a
          href="mailto:jacob_barrett@icloud.com"
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
          href="https://github.com/JakeBarrettDev"
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
          href="https://www.linkedin.com/in/jacob-barrett-844007115/"
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
