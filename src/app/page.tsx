import { ArrowRight, Code2, Music, Dog, Briefcase } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="space-y-32">
      {/* ── Hero ── */}
      <section className="hero-gradient relative -mx-6 -mt-16 px-6 pb-24 pt-24 sm:pt-32">
        {/* Decorative shapes */}
        <div className="pointer-events-none absolute left-8 top-20 h-32 w-32 animate-float rounded-full border border-accent/10 opacity-40 sm:left-16 sm:h-48 sm:w-48" />
        <div className="pointer-events-none absolute right-12 top-40 h-20 w-20 animate-float-delayed rounded-full bg-accent/5 opacity-60 sm:right-24 sm:h-28 sm:w-28" />
        <div className="pointer-events-none absolute bottom-16 left-1/3 h-16 w-16 animate-float-delayed rounded-full border border-accent/8" />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-10 sm:flex-row sm:items-center sm:gap-16">
          {/* Photo */}
          <div
            className="animate-fade-up relative shrink-0"
            style={{ animationDelay: "0ms" }}
          >
            <div className="animate-pulse-glow relative h-44 w-44 overflow-hidden rounded-2xl border-2 border-accent/20 sm:h-56 sm:w-56 lg:h-64 lg:w-64">
              <Image
                src="/jake.jpg"
                alt="Jake Barrett"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 640px) 176px, (max-width: 1024px) 224px, 256px"
              />
            </div>
            {/* Decorative corner accent */}
            <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-br-2xl border-b-2 border-r-2 border-accent/40" />
            <div className="absolute -left-2 -top-2 h-8 w-8 rounded-tl-2xl border-l-2 border-t-2 border-accent/40" />
          </div>

          {/* Text */}
          <div className="text-center sm:text-left">
            <p
              className="animate-fade-up text-xs font-bold tracking-[0.3em] text-accent uppercase"
              style={{ animationDelay: "100ms" }}
            >
              Full-Stack Developer
            </p>
            <h1
              className="animate-fade-up mt-4 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
              style={{ animationDelay: "200ms" }}
            >
              Hey, I&apos;m{" "}
              <span className="relative">
                Jake
                <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-accent/30" />
              </span>
              .
            </h1>
            <p
              className="animate-fade-up mt-5 max-w-md text-lg leading-relaxed text-muted-foreground"
              style={{ animationDelay: "300ms" }}
            >
              I build things for the web that are clean, fast, and fun to use.
              Currently doing QA automation at{" "}
              <span className="font-medium text-foreground">VML</span> and
              freelancing through{" "}
              <span className="font-medium text-accent">Maroon Raccoon</span>.
            </p>
            <div
              className="animate-fade-up mt-8 flex flex-wrap justify-center gap-4 sm:justify-start"
              style={{ animationDelay: "400ms" }}
            >
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent-hover hover:shadow-lg hover:shadow-glow"
              >
                View My Work
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold transition-all hover:border-accent/40 hover:bg-accent-light hover:text-accent"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section>
        <div
          className="animate-slide-left flex items-center gap-4"
          style={{ animationDelay: "500ms" }}
        >
          <h2 className="font-display text-3xl font-bold">About Me</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        </div>

        <div className="mt-10 grid gap-10 sm:grid-cols-5">
          <div className="space-y-5 sm:col-span-3">
            <p className="text-base leading-relaxed text-muted-foreground">
              I&apos;m a full-stack developer who loves building things that make
              people say &ldquo;Whoa.&rdquo; I work primarily with React,
              TypeScript, and Node.js, and I care deeply about clean UI and
              thoughtful backend logic.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              I got my start in coding with{" "}
              <span className="font-medium text-foreground">LaunchCode</span> in
              2024. In the full-stack program I learned the fundamentals — HTML,
              CSS, JavaScript, Python — plus frameworks like React and Flask with
              databases like MySQL and MongoDB. The culmination of that journey
              was{" "}
              <Link
                href="/projects"
                className="link-underline font-medium text-accent"
              >
                Swesso
              </Link>
              , my full-stack capstone project.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Outside of that, I&apos;ve spent 5 years at{" "}
              <span className="font-medium text-foreground">UDC</span>{" "}
              maintaining a Squarespace site I built from scratch, and I run my
              own LLC building sites for artists and businesses.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:col-span-2">
            {[
              {
                icon: Code2,
                title: "Builder",
                text: "Always sketching out ideas for the next project.",
              },
              {
                icon: Music,
                title: "Musician",
                text: "Playing music when I'm not writing code.",
              },
              {
                icon: Dog,
                title: "Corgi Dad",
                text: "Training Finn is a full-time side gig.",
              },
              {
                icon: Briefcase,
                title: "Freelancer",
                text: "Running Maroon Raccoon, building for clients.",
              },
            ].map(({ icon: Icon, title, text }, i) => (
              <div
                key={title}
                className="animate-fade-up group rounded-xl border border-border bg-surface p-5 transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-glow"
                style={{ animationDelay: `${600 + i * 100}ms` }}
              >
                <Icon className="mb-3 h-5 w-5 text-accent transition-transform group-hover:scale-110" />
                <h3 className="font-display text-sm font-bold uppercase tracking-wider">
                  {title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
