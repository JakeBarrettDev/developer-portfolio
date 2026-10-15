import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Lock } from "lucide-react";
import Reveal from "@/components/reveal";
import SectionHead from "@/components/section-head";
import { GitHubIcon } from "@/components/icons";
import { projects, type Project } from "@/data/projects";
import { testimonials } from "@/data/profile";

// Only the projects in data/projects.ts have pages; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return { title: project.title, description: project.caseStudy.brief };
}

const KIND_LABEL: Record<Project["kind"], string> = {
  client: "Client work",
  studio: "My studio",
  personal: "Personal project",
};

const textLink = "link-underline inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-accent";

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();

  const project = projects[index];
  const next = projects[(index + 1) % projects.length];
  const { caseStudy } = project;
  const quote = testimonials.find((t) => t.project === project.slug);
  const status =
    project.status === "live" ? (project.active ? "Live · still building" : "Live") : project.status === "in-progress" ? "In progress" : null;

  return (
    <article className="space-y-16 sm:space-y-24">
      <header>
        <Link href="/projects" className="eyebrow group inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-accent">
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
          All projects
        </Link>

        <div className="mt-10 grid gap-10 border-t border-border pt-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="eyebrow animate-fade-up text-accent">Case study · {KIND_LABEL[project.kind]}</p>
            <h1
              className="animate-fade-up mt-4 font-display text-5xl font-medium leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl"
              style={{ animationDelay: "60ms" }}
            >
              {project.title}
            </h1>
            <p className="animate-fade-up mt-6 max-w-2xl text-xl leading-relaxed text-muted-foreground" style={{ animationDelay: "120ms" }}>
              {project.description}
            </p>
          </div>

          {/* Metadata column */}
          <dl
            className="animate-fade-up grid grid-cols-2 gap-x-6 gap-y-5 self-end text-sm lg:col-span-3 lg:col-start-10 lg:grid-cols-1"
            style={{ animationDelay: "180ms" }}
          >
            <div>
              <dt className="eyebrow text-muted-foreground">Role</dt>
              <dd className="mt-1">{caseStudy.role}</dd>
            </div>
            {status && (
              <div>
                <dt className="eyebrow text-muted-foreground">Status</dt>
                <dd className="mt-1">{status}</dd>
              </div>
            )}
            <div className="col-span-2 lg:col-span-1">
              <dt className="eyebrow text-muted-foreground">Built with</dt>
              <dd className="mt-1 font-mono text-xs leading-relaxed text-muted-foreground">{project.techStack.join(" · ")}</dd>
            </div>
            <div className="col-span-2 flex flex-wrap gap-5 lg:col-span-1">
              {project.liveDemoUrl && (
                <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer" className={textLink}>
                  Visit the site <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              )}
              {project.githubUrl ? (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={textLink}>
                  <GitHubIcon className="h-3.5 w-3.5" /> Code
                </a>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" aria-hidden="true" /> Private repo
                </span>
              )}
            </div>
          </dl>
        </div>
      </header>

      {/* Source screenshots are 800px wide, so the image stops at 9 of 12 columns instead of upscaling. */}
      <Reveal className="lg:grid lg:grid-cols-12">
        <figure className="lg:col-span-9">
          <div className="relative aspect-[800/420] overflow-hidden rounded-2xl border border-border bg-muted">
            <Image
              src={project.thumbnail}
              alt={`${project.title} screenshot`}
              fill
              priority
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 920px"
            />
          </div>
        </figure>
      </Reveal>

      <section className="grid gap-12 lg:grid-cols-12">
        {caseStudy.stat && (
          <Reveal className="lg:col-span-4">
            <p className="font-display text-7xl font-medium tracking-tight">{caseStudy.stat.value}</p>
            <p className="eyebrow mt-3 text-accent">{caseStudy.stat.label}</p>
          </Reveal>
        )}
        <Reveal delay={80} className={caseStudy.stat ? "lg:col-span-7 lg:col-start-6" : "lg:col-span-8"}>
          <dl className="divide-y divide-border border-y border-border">
            {(
              [
                ["Brief", caseStudy.brief],
                ["Approach", caseStudy.approach],
                ["Outcome", caseStudy.outcome],
              ] as const
            ).map(([term, text], i) => (
              <div key={term} className="grid gap-2 py-6 sm:grid-cols-[8rem_1fr] sm:gap-6">
                <dt className="eyebrow pt-1.5 text-muted-foreground">
                  <span className="text-accent">{String(i + 1).padStart(2, "0")}</span> {term}
                </dt>
                <dd className="text-lg leading-relaxed">{text}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      {caseStudy.differentiators && (
        <section>
          <SectionHead index="01" label="What sets it apart" />
          <ol className="mt-8 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {caseStudy.differentiators.map((d, i) => (
              <li key={d.title}>
                <Reveal delay={(i % 3) * 80}>
                  <span className="eyebrow text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-2 font-display text-2xl font-medium leading-snug">{d.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{d.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>
      )}

      {caseStudy.engineering && (
        <section>
          <SectionHead index={caseStudy.differentiators ? "02" : "01"} label="Engineering highlights" />
          <ul className="mt-8 grid gap-x-12 md:grid-cols-2">
            {caseStudy.engineering.map((item) => {
              const [lead, ...restParts] = item.split(": ");
              const rest = restParts.join(": ");
              return (
                <li key={item} className="border-b border-border py-5 leading-relaxed text-muted-foreground">
                  {rest ? (
                    <>
                      <span className="font-medium text-foreground">{lead}.</span> {rest[0].toUpperCase() + rest.slice(1)}
                    </>
                  ) : (
                    item
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {quote && (
        <Reveal>
          <figure className="max-w-4xl border-l-2 border-accent pl-6 sm:pl-10">
            <blockquote className="font-display text-3xl font-normal italic leading-snug sm:text-5xl">
              &ldquo;{quote.quote}&rdquo;
            </blockquote>
            <figcaption className="eyebrow mt-6 text-muted-foreground">
              {quote.name && <span className="text-foreground">{quote.name}, </span>}
              {quote.role}
            </figcaption>
          </figure>
        </Reveal>
      )}

      {project.slug === "swesso" && (
        <Reveal>
          <aside className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="eyebrow text-accent">Also in the Lab</p>
              <p className="mt-2 font-display text-2xl font-medium">A mini Swesso is the Playwright Lab&apos;s test subject.</p>
            </div>
            <Link href="/lab" className={`${textLink} shrink-0`}>
              Try the Lab <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </aside>
        </Reveal>
      )}

      <nav aria-label="Next project" className="border-t border-border pt-6">
        <Link href={`/projects/${next.slug}`} className="group flex items-baseline justify-between gap-6">
          <span className="eyebrow text-muted-foreground">Next project</span>
          <span className="flex items-baseline gap-3 font-display text-3xl font-medium transition-colors group-hover:text-accent sm:text-4xl">
            {next.title}
            <ArrowRight className="h-5 w-5 self-center transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </Link>
      </nav>
    </article>
  );
}
