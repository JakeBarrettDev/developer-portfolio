import type { Metadata } from "next";
import Link from "next/link";
import { projects, type Project } from "@/data/projects";
import ProjectCard from "@/components/project-card";
import Reveal from "@/components/reveal";
import SectionHead from "@/components/section-head";

export const metadata: Metadata = {
  title: "Projects",
  description: "Client websites, and the apps I build around art, horror movies and tabletop games.",
};

const sections: {
  id: string;
  label: string;
  title: string;
  match: (p: Project) => boolean;
}[] = [
  {
    id: "client-work",
    label: "Client work",
    title: "Sites for artists, builders and my own studio.",
    match: (p) => p.kind !== "personal",
  },
  {
    id: "personal",
    label: "Things I built for myself",
    title: "Apps that follow my interests: art, horror movies and tabletop games.",
    match: (p) => p.kind === "personal",
  },
];

/** Featured cards span the full row; so does a leftover odd card, to keep the grid gap-free. */
function isWide(items: Project[], project: Project) {
  if (project.featured) return true;
  const rest = items.filter((p) => !p.featured);
  return rest.length % 2 === 1 && rest[rest.length - 1] === project;
}

export default function ProjectsPage() {
  const live = projects.filter((p) => p.status === "live").length;
  const building = projects.filter((p) => p.status === "in-progress").length;

  return (
    <div className="space-y-24 sm:space-y-32">
      {/* ── Masthead ── */}
      <header>
        <div className="eyebrow animate-fade-up flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-border pb-3 text-muted-foreground">
          <span className="text-foreground">Projects</span>
          <span>
            {projects.length} projects · {live} live · {building} in progress
          </span>
        </div>
        <h1
          className="animate-fade-up mt-10 max-w-4xl font-display text-[2.5rem] font-medium leading-[1.04] tracking-tight sm:mt-14 sm:text-6xl lg:text-7xl"
          style={{ animationDelay: "80ms" }}
        >
          Things I&apos;ve built, shipped, and am <em className="font-normal italic text-accent">still</em> tinkering
          with.
        </h1>
        <p
          className="animate-fade-up mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground"
          style={{ animationDelay: "160ms" }}
        >
          Every project has a short case study: the brief, the approach and how it turned out. Hover a card for a
          preview.
        </p>
      </header>

      {sections.map(({ id, label, title, match }, i) => {
        const items = projects.filter(match);
        let column = 0;
        return (
          <section key={id} id={id} className="scroll-mt-24">
            <SectionHead index={String(i + 1).padStart(2, "0")} label={label} title={title} />
            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              {items.map((project) => {
                const wide = isWide(items, project);
                const delay = wide ? 0 : (column++ % 2) * 120;
                return (
                  <Reveal key={project.slug} className={wide ? "sm:col-span-2" : undefined} delay={delay}>
                    <ProjectCard project={project} wide={wide} />
                  </Reveal>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* ── Closing ── */}
      <section>
        <SectionHead index="03" label="Work together" />
        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-2xl font-display text-3xl font-medium leading-snug sm:text-4xl">
            Need a site, or hiring for QA? Either way, I&apos;d like to hear about it.
          </p>
          <Link
            href="/contact"
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent-hover hover:shadow-lg hover:shadow-glow sm:self-auto"
          >
            Get in touch
          </Link>
        </div>
      </section>
    </div>
  );
}
