import type { Metadata } from "next";
import { projects, type Project } from "@/data/projects";
import ProjectCard from "@/components/project-card";
import Reveal from "@/components/reveal";

export const metadata: Metadata = {
  title: "Projects",
  description: "Things I've built.",
};

const sections: {
  title: string;
  blurb: string;
  dot?: string;
  match: (p: Project) => boolean;
}[] = [
  {
    title: "Live",
    blurb: "Shipped and running. Click through and try them out.",
    dot: "bg-emerald-500",
    match: (p) => p.status === "live",
  },
  {
    title: "In Progress",
    blurb: "Being built right now.",
    dot: "bg-accent",
    match: (p) => p.status === "in-progress",
  },
  {
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

export default function ProjectsPage() {
  return (
    <div className="space-y-16">
      <div>
        <div className="animate-slide-left flex items-center gap-4">
          <h1 className="font-display text-3xl font-bold">Projects</h1>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        </div>
        <p
          className="animate-fade-up mt-3 text-muted-foreground"
          style={{ animationDelay: "100ms" }}
        >
          Things I&apos;ve built — hover for a preview, click to explore.
        </p>
      </div>

      {sections.map(({ title, blurb, dot, match }) => {
        const items = projects.filter(match);
        if (items.length === 0) return null;
        let column = 0;

        return (
          <section key={title} className="space-y-6">
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
