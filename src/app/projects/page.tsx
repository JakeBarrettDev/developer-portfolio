import type { Metadata } from "next";
import { projects } from "@/data/projects";
import ProjectCard from "@/components/project-card";

export const metadata: Metadata = {
  title: "Projects",
  description: "Things I've built.",
};

export default function ProjectsPage() {
  return (
    <div className="space-y-12">
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

      <div className="grid gap-8 sm:grid-cols-2">
        {projects.map((project, i) => (
          <div
            key={project.slug}
            className="animate-fade-up"
            style={{ animationDelay: `${150 + i * 120}ms` }}
          >
            <ProjectCard project={project} />
          </div>
        ))}
      </div>

      {/* Call to action */}
      <div
        className="animate-fade-up rounded-2xl border border-border bg-surface p-8 text-center"
        style={{ animationDelay: `${150 + projects.length * 120 + 100}ms` }}
      >
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
      </div>
    </div>
  );
}
