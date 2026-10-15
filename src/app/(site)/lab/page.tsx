import type { Metadata } from "next";
import HeroSpotlight from "@/components/hero-spotlight";
import Reveal from "@/components/reveal";
import TestLab from "@/components/lab/test-lab";

export const metadata: Metadata = {
  title: "Playwright Lab",
  description: "Record a Playwright test by using a mini version of Swesso, with every line explained and every locator reviewed.",
};

const principles = [
  { title: "Locate like a user", body: "Roles, labels and visible text first. Test ids when nothing else works. CSS only as a last resort." },
  { title: "Assert, don't wait", body: "Web-first assertions and auto-waiting actions. No sleeps anywhere." },
  { title: "Explain every line", body: "Click any generated line to see why it was written that way." },
];

const challenges = [
  { title: "Log in", body: "'Log in' is also part of 'Log in as guest' and the form's heading. Watch the button's locator handle it." },
  { title: "Peek behind the stack", body: "Hover the artist on the top card. The cards behind it are hidden but still in the DOM, and only some locators know that." },
  { title: "Swipe", body: "Drag a card instead of pressing the heart, and see what gets recorded and why." },
  { title: "Open your matches", body: "'Matches (3)' changes as you go, so the locator switches to a regex." },
  { title: "Choose a worse locator", body: "Click a 'Remove' line and pick nth() or the XPath. Then sort the list by artist and think about which one survives." },
  { title: "Count the collection", body: "In Assert mode, click a card in your matches and pick toHaveCount." },
  { title: "Visit The Met", body: "'View at The Met' opens a new tab. Record it to see how a test catches a popup." },
  { title: "Find the bug", body: "One painting in your matches has no alt text. Hover the images until you find it." },
];

export default function LabPage() {
  return (
    <div className="space-y-12">
      {/* ── Hero ── */}
      <HeroSpotlight className="relative -mx-6 -mt-16 overflow-hidden px-6 pb-4 pt-20 sm:pt-28">
        <div className="hero-backdrop hero-gradient" />
        <div className="pointer-events-none absolute right-10 top-16 h-28 w-28 animate-float rounded-full border border-accent/10 opacity-50 sm:right-24 sm:h-40 sm:w-40" />

        <div className="relative mx-auto max-w-5xl">
          <p className="animate-fade-up text-xs font-bold uppercase tracking-[0.3em] text-accent" style={{ animationDelay: "0ms" }}>
            Playwright Lab
          </p>
          <h1
            className="animate-fade-up mt-4 max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl"
            style={{ animationDelay: "100ms" }}
          >
            Write a test by{" "}
            <span className="relative whitespace-nowrap">
              using the app
              <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-accent/30" />
            </span>
            .
          </h1>
          <p
            className="animate-fade-up mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground"
            style={{ animationDelay: "200ms" }}
          >
            I write Playwright suites for a living at VML. This lab records your clicks in a mini version of{" "}
            <span className="font-medium text-foreground">Swesso</span>, my art-matching app, and writes the test I
            would write. Every line comes with the reasoning a code generator usually keeps to itself, and you can
            swap in worse locators to see how I&apos;d review them.
          </p>

          <div className="animate-fade-up mt-8 grid gap-3 sm:grid-cols-3" style={{ animationDelay: "300ms" }}>
            {principles.map((p) => (
              <div key={p.title} className="rounded-xl border border-border bg-surface/70 p-4 backdrop-blur-sm">
                <p className="text-sm font-semibold">{p.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </HeroSpotlight>

      {/* ── The lab: breaks out of the site's column to use the full width ── */}
      <section className="animate-fade-up mx-[calc(50%-50vw)] px-4 sm:px-6" style={{ animationDelay: "400ms" }}>
        <div className="mx-auto max-w-[1280px]">
          <TestLab />
        </div>
      </section>

      {/* ── Things to try ── */}
      <section className="mx-[calc(50%-50vw)] px-4 sm:px-6">
        <div className="mx-auto max-w-[1280px]">
        <Reveal from="left" className="flex items-center gap-4">
          <h2 className="whitespace-nowrap font-display text-2xl font-bold">Things to try</h2>
          <div className="hidden h-px flex-1 bg-gradient-to-r from-border to-transparent sm:block" />
        </Reveal>
        <p className="mt-2 text-sm text-muted-foreground">Each screen hides a common locator or timing trap.</p>
        <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {challenges.map((c, i) => (
            <li key={c.title}>
              <Reveal delay={i * 60} className="h-full rounded-xl border border-border bg-surface p-4">
                <p className="flex items-baseline gap-2 text-sm font-semibold">
                  <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                  {c.title}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-xs text-muted-foreground">
          Paintings courtesy of The Metropolitan Museum of Art&apos;s Open Access program (public domain).
        </p>
        </div>
      </section>
    </div>
  );
}
