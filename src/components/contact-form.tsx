"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { sendMessage } from "@/app/contact/action";

export default function ContactForm() {
  const [state, formAction, isPending] = useActionState(sendMessage, {
    success: false,
    message: "",
  });

  return (
    <form action={formAction} className="space-y-5">
      {state.message && (
        <div
          className={`rounded-xl px-5 py-4 text-sm ${
            state.success
              ? "border border-green-500/20 bg-green-500/10 text-green-400"
              : "border border-red-500/20 bg-red-500/10 text-red-400"
          }`}
        >
          {state.message}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={50}
            placeholder="Jake Barrett"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/40 focus:border-accent/50 focus:ring-2 focus:ring-accent/10"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/40 focus:border-accent/50 focus:ring-2 focus:ring-accent/10"
          />
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
          maxLength={10000}
          rows={6}
          placeholder="Tell me about your project..."
          className="w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/40 focus:border-accent/50 focus:ring-2 focus:ring-accent/10"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent-hover hover:shadow-lg hover:shadow-glow disabled:opacity-50"
      >
        {isPending ? (
          "Sending..."
        ) : (
          <>
            Send Message
            <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </>
        )}
      </button>
    </form>
  );
}
