import type { Metadata } from "next";
import { projects, type Project } from "@/data/projects";
import ProjectCard from "@/components/project-card";
import Reveal from "@/components/reveal";
import HeroSpotlight from "@/components/hero-spotlight";

export const metadata: Metadata = {
  title: "Projects",
  description: "Things I've built.",
};

const sections: {
  id: string;
  title: string;
  blurb: string;
  dot?: string;
  match: (p: Project) => boolean;
}[] = [
  {
    id: "live",
    title: "Live",
    blurb: "Shipped and running. Click through and try them out.",
    dot: "bg-emerald-500",
    match: (p) => p.status === "live",
  },
  {
    id: "in-progress",
    title: "In Progress",
    blurb: "Being built right now.",
    dot: "bg-accent",
    match: (p) => p.status === "in-progress",
  },
  {
    id: "other-work",
    title: "Other Work",
    blurb: "Earlier builds and client work.",
    match: (p) => !p.status,
  },
];

/** Featured cards span the full row; so does a leftover odd card, to keep the grid gap-free. */
function isWide(items: Project[], project: Project) {
  if (project.featured) return true;
  const rest = items.filter((p) => !p.featured);
  return rest.length % 2 === 1 && rest[rest.length - 1] === project;
}

const techStack = [...new Set(projects.flatMap((p) => p.techStack))];

export default function ProjectsPage() {
  const liveCount = projects.filter((p) => p.status === "live").length;
  const buildingCount = projects.filter((p) => p.status === "in-progress").length;
  const stats = [
    { value: liveCount, label: "Live", href: "#live", dot: "bg-emerald-500" },
    { value: buildingCount, label: "In progress", href: "#in-progress", dot: "bg-accent" },
    { value: techStack.length, label: "Technologies" },
  ];

  return (
    <div className="space-y-16">
      {/* ── Hero ── */}
      <HeroSpotlight className="relative -mx-6 -mt-16 overflow-hidden px-6 pb-12 pt-20 sm:pt-28">
        <div className="hero-backdrop hero-gradient" />
        <div className="pointer-events-none absolute right-10 top-16 h-28 w-28 animate-float rounded-full border border-accent/10 opacity-50 sm:right-24 sm:h-40 sm:w-40" />
        <div className="pointer-events-none absolute bottom-32 right-1/4 hidden h-16 w-16 animate-float-delayed rounded-full bg-accent/5 sm:block" />

        <div className="relative mx-auto max-w-5xl">
          <p
            className="animate-fade-up text-xs font-bold uppercase tracking-[0.3em] text-accent"
            style={{ animationDelay: "0ms" }}
          >
            Projects
          </p>
          <h1
            className="animate-fade-up mt-4 max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl"
            style={{ animationDelay: "100ms" }}
          >
            Things I&apos;ve{" "}
            <span className="relative whitespace-nowrap">
              built
              <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-accent/30" />
            </span>
            , shipped, and am still tinkering with.
          </h1>
          <p
            className="animate-fade-up mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground"
            style={{ animationDelay: "200ms" }}
          >
            Client sites, a horror movie-night planner, and a worldbuilding tool
            for Dungeon Masters. Hover a card for a preview, or click through to
            try the live ones.
          </p>

          {/* Stats */}
          <div
            className="animate-fade-up mt-10 grid max-w-xl grid-cols-3 gap-3 sm:gap-4"
            style={{ animationDelay: "300ms" }}
          >
            {stats.map(({ value, label, href, dot }) => {
              const body = (
                <>
                  <span className="block font-display text-3xl font-bold sm:text-4xl">{value}</span>
                  <span className="mt-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:text-sm">
                    {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
                    {label}
                  </span>
                </>
              );
              const tile =
                "rounded-xl border border-border bg-surface/70 p-4 backdrop-blur-sm";
              return href ? (
                <a
                  key={label}
                  href={href}
                  className={`${tile} transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg hover:shadow-glow`}
                >
                  {body}
                </a>
              ) : (
                <div key={label} className={tile}>
                  {body}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tech marquee */}
        <div
          className="animate-fade-in marquee relative mx-auto mt-12 max-w-5xl overflow-hidden"
          style={{ animationDelay: "500ms" }}
        >
          <div className="marquee-track flex w-max gap-3">
            {[...techStack, ...techStack].map((tech, i) => (
              <span
                key={i}
                aria-hidden={i >= techStack.length}
                className="whitespace-nowrap rounded-full border border-border bg-surface/60 px-4 py-1.5 text-sm text-muted-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </HeroSpotlight>

      {sections.map(({ id, title, blurb, dot, match }) => {
        const items = projects.filter(match);
        if (items.length === 0) return null;
        let column = 0;

        return (
          <section key={id} id={id} className="scroll-mt-28 space-y-6">
            <Reveal from="left">
              <div className="flex items-center gap-3">
                {dot && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${dot}`} />
                    <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${dot}`} />
                  </span>
                )}
                <h2 className="font-display text-xl font-bold">{title}</h2>
                <span className="rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {items.length}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{blurb}</p>
            </Reveal>

            <div className="grid gap-8 sm:grid-cols-2">
              {items.map((project) => {
                const wide = isWide(items, project);
                const delay = wide ? 0 : (column++ % 2) * 120;
                return (
                  <Reveal
                    key={project.slug}
                    className={wide ? "sm:col-span-2" : undefined}
                    delay={delay}
                  >
                    <ProjectCard project={project} wide={wide} />
                  </Reveal>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Call to action */}
      <Reveal className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="font-display text-lg font-semibold">
          Want to build something together?
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          I&apos;m always open to new projects and collaborations.
        </p>
        <a
          href="/contact"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent-hover hover:shadow-lg hover:shadow-glow"
        >
          Let&apos;s Talk
        </a>
      </Reveal>
    </div>
  );
}
