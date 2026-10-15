"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { site } from "@/data/site";

const TOPICS = ["A website for my business", "Hiring / a role", "Something else"];

const field =
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/40 focus:border-accent/50 focus:ring-2 focus:ring-accent/10";

/**
 * Composes the message in the visitor's own email app. There's no delivery
 * service behind this site yet, so it never claims a message was "sent".
 */
export default function ContactForm() {
  const [opened, setOpened] = useState(false);

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const name = String(data.get("name"));
        const topic = String(data.get("topic"));
        const subject = `${topic}: message from ${name}`;
        const body = `${data.get("message")}\n\n${name}\n${data.get("email")}`;
        window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        setOpened(true);
      }}
    >
      {opened && (
        <div role="status" className="rounded-xl border border-border bg-surface px-5 py-4 text-sm text-muted-foreground">
          Your email app should open with the message ready to send. If it didn&apos;t, write to{" "}
          <a href={`mailto:${site.email}`} className="font-medium text-accent hover:underline">
            {site.email}
          </a>
          .
        </div>
      )}

      <div>
        <label htmlFor="topic" className="mb-1.5 block text-sm font-medium">
          What&apos;s it about?
        </label>
        <select id="topic" name="topic" className={field} defaultValue={TOPICS[0]}>
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
            Name
          </label>
          <input id="name" name="name" type="text" required minLength={2} maxLength={50} placeholder="Your name" className={field} />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <input id="email" name="email" type="email" required placeholder="you@example.com" className={field} />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          placeholder="Tell me about your project..."
          className={`${field} resize-y`}
        />
      </div>

      <button
        type="submit"
        className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent-hover hover:shadow-lg hover:shadow-glow"
      >
        Write it in my email app
        <Mail className="h-4 w-4" />
      </button>
      <p className="text-center text-xs text-muted-foreground">
        Opens your email app with everything filled in. Nothing is sent until you hit send there.
      </p>
    </form>
  );
}
