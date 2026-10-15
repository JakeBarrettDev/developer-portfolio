import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/reveal";
import SectionHead from "@/components/section-head";
import LabTeaser from "@/components/lab-teaser";
import { projects, type Project } from "@/data/projects";
import { testimonials, vmlHighlights } from "@/data/profile";
import { site } from "@/data/site";

const KIND_LABEL: Record<Project["kind"], string> = {
  client: "Client",
  studio: "My studio",
  personal: "Personal",
};

const primaryButton =
  "group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all hover:bg-accent-hover hover:shadow-lg hover:shadow-glow";
const textLink = "link-underline inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-accent";

export default function Home() {
  const building = projects.find((p) => p.status === "in-progress");
  const swesso = projects.find((p) => p.slug === "swesso")!;
  const swessoCase = swesso.caseStudy;

  return (
    <div className="space-y-24 sm:space-y-32">
      {/* ── Masthead ── */}
      <section className="relative">
        <div className="eyebrow animate-fade-up flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-border pb-3 text-muted-foreground">
          <span className="text-foreground">Jake Barrett</span>
          <span className="hidden md:inline">QA automation · Web development</span>
          {building && (
            <Link href={`/projects/${building.slug}`} className="transition-colors hover:text-accent">
              Now building: <span className="text-foreground">{building.title}</span>
            </Link>
          )}
        </div>

        <h1
          className="animate-fade-up mt-10 max-w-5xl font-display text-[2.5rem] font-medium leading-[1.04] tracking-tight sm:mt-14 sm:text-6xl lg:text-[5.25rem]"
          style={{ animationDelay: "80ms" }}
        >
          I test software at <em className="font-normal italic text-accent">VML</em> and build websites for artists
          and small businesses.
        </h1>

        <div
          className="animate-fade-up mt-12 grid gap-10 border-t border-border pt-8 md:grid-cols-12"
          style={{ animationDelay: "160ms" }}
        >
          <div className="md:col-span-5">
            <p className="eyebrow text-accent">For hiring managers</p>
            <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
              I build and run the Playwright automation that keeps a large brand platform&apos;s releases free of
              regressions, and I&apos;ve built a test recorder that explains every line it writes.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-5">
              <Link href="/lab" className={primaryButton}>
                Try the Playwright Lab
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className={textLink}>
                LinkedIn <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <p className="eyebrow text-accent">For clients</p>
            <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
              Through my LLC,{" "}
              <a href={site.studio.url} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-accent">
                {site.studio.name}
              </a>
              , I design and build fast, accessible sites for people who&apos;d rather be making things.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-5">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold transition-all hover:border-accent/40 hover:bg-accent-light hover:text-accent"
              >
                Start a project
              </Link>
              <a href="#client-work" className={textLink}>
                What clients say
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 01 Lead story: the Lab ── */}
      <section>
        <SectionHead
          index="01"
          label="The Lab"
          title={<>Record a test. I&apos;ll explain every line.</>}
          action={{ href: "/lab", label: "Open the Lab" }}
        />
        <div className="mt-10 grid grid-cols-[minmax(0,1fr)] items-start gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="text-lg leading-relaxed text-muted-foreground">
              The Lab turns your clicks in a mini version of my art app into the test I&apos;d write, then reviews any
              locator you swap in: strict-mode violations, DevTools XPath, order-dependent{" "}
              <code className="font-mono text-base text-foreground">nth()</code> and the rest.
            </p>
            <ol className="mt-8 divide-y divide-border border-y border-border">
              {[
                ["Locate like a user", "Roles and labels before CSS."],
                ["Assert, don't wait", "Web-first assertions, no sleeps."],
                ["Verified for real", "The exported code runs in Playwright."],
              ].map(([title, body], i) => (
                <li key={title} className="flex gap-5 py-4">
                  <span className="eyebrow pt-1 text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <p>
                    <span className="font-display text-lg font-medium">{title}.</span>{" "}
                    <span className="text-muted-foreground">{body}</span>
                  </p>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-7">
            <LabTeaser />
          </Reveal>
        </div>
      </section>

      {/* ── 02 At VML ── */}
      <section>
        <SectionHead
          index="02"
          label="At VML"
          title="Keeping a large brand platform's releases free of regressions."
        />
        <dl className="mt-10 grid border-y border-border sm:grid-cols-3">
          {vmlHighlights.map((h, i) => (
            <Reveal
              key={h.label}
              delay={i * 80}
              className="border-b border-border py-8 last:border-b-0 sm:border-b-0 sm:border-l sm:px-8 sm:first:border-l-0 sm:first:pl-0"
            >
              <dt>
                <span className="block font-display text-6xl font-medium tracking-tight lg:text-7xl">{h.stat}</span>
                <span className="eyebrow mt-3 block text-accent">{h.label}</span>
              </dt>
              <dd className="mt-4 leading-relaxed text-muted-foreground">{h.body}</dd>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* ── 03 Case study ── */}
      <section>
        <SectionHead
          index="03"
          label="Case study"
          title={
            <>
              Swesso: learning art the way we <em className="font-normal italic">already</em> swipe.
            </>
          }
          action={{ href: "/projects/swesso", label: "Read the case study" }}
        />
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <figure>
              <div className="relative aspect-[800/408] overflow-hidden rounded-2xl border border-border">
                <Image
                  src={swesso.thumbnail}
                  alt="Swesso's welcome screen: Van Gogh's Irises behind the Swesso wordmark"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </div>
              <figcaption className="eyebrow mt-3 text-muted-foreground">Swesso · React, Spring Boot, PostgreSQL</figcaption>
            </figure>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-5">
            <p className="font-display text-6xl font-medium tracking-tight">{swessoCase.stat?.value}</p>
            <p className="eyebrow mt-2 text-accent">{swessoCase.stat?.label}</p>
            <dl className="mt-8 space-y-6">
              {(
                [
                  ["Brief", swessoCase.brief],
                  ["Approach", swessoCase.approach],
                  ["Outcome", swessoCase.outcome],
                ] as const
              ).map(([term, text]) => (
                <div key={term} className="grid gap-1 sm:grid-cols-[6rem_1fr] sm:gap-4">
                  <dt className="eyebrow pt-1 text-muted-foreground">{term}</dt>
                  <dd className="leading-relaxed">{text}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap gap-6">
              <a href={swesso.liveDemoUrl} target="_blank" rel="noopener noreferrer" className={textLink}>
                Visit swesso.com <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <Link href="/lab" className={textLink}>
                Try a mini Swesso in the Lab <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 04 Client work ── */}
      <section id="client-work" className="scroll-mt-24">
        <SectionHead
          index="04"
          label="Client work"
          title="Websites for people who'd rather be making things."
          action={{ href: "/contact", label: "Start a project" }}
        />
        <div className="mt-10 grid gap-12 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <Reveal key={t.role} delay={i * 100}>
              <figure className="border-l-2 border-accent pl-6">
                <blockquote className="font-display text-2xl font-normal italic leading-snug sm:text-3xl">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="eyebrow mt-5 text-muted-foreground">
                  {t.name && <span className="text-foreground">{t.name}, </span>}
                  {t.role}
                  {t.url && (
                    <>
                      {" · "}
                      <a href={t.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                        See the site
                      </a>
                    </>
                  )}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── 05 Index ── */}
      <section>
        <SectionHead index="05" label="Index" title="Everything I've built." action={{ href: "/projects", label: "All projects" }} />
        <table className="mt-8 w-full border-collapse text-left">
          <thead>
            <tr className="eyebrow border-b border-border text-muted-foreground">
              <th scope="col" className="w-12 py-3 font-normal">No.</th>
              <th scope="col" className="py-3 font-normal">Project</th>
              <th scope="col" className="hidden py-3 font-normal sm:table-cell">For</th>
              <th scope="col" className="hidden py-3 font-normal md:table-cell">Built with</th>
              <th scope="col" className="py-3 text-right font-normal">
                <span className="sr-only">Link</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p, i) => (
              <tr key={p.slug} className="group border-b border-border">
                <td className="eyebrow py-5 align-baseline text-accent">{String(i + 1).padStart(2, "0")}</td>
                <td className="py-5 align-baseline">
                  <Link href={`/projects/${p.slug}`} className="font-display text-xl font-medium transition-colors hover:text-accent sm:text-2xl">
                    {p.title}
                  </Link>
                  <span className="mt-1 block text-sm text-muted-foreground sm:hidden">{KIND_LABEL[p.kind]}</span>
                </td>
                <td className="hidden py-5 align-baseline text-sm text-muted-foreground sm:table-cell">{KIND_LABEL[p.kind]}</td>
                <td className="hidden py-5 align-baseline font-mono text-xs text-muted-foreground md:table-cell">
                  {p.techStack.slice(0, 3).join(" · ")}
                </td>
                <td className="py-5 text-right align-baseline text-sm">
                  {p.liveDemoUrl ? (
                    <a href={p.liveDemoUrl} target="_blank" rel="noopener noreferrer" className={textLink}>
                      Visit <ArrowUpRight className="h-3.5 w-3.5" />
                      <span className="sr-only"> {p.title}</span>
                    </a>
                  ) : (
                    <span className="text-muted-foreground">{p.status === "in-progress" ? "In progress" : "—"}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ── 06 About ── */}
      <section>
        <SectionHead index="06" label="About" />
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <Reveal className="max-w-[14rem] lg:col-span-3 lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-border">
              <Image src="/jake.jpg" alt="Jake Barrett" fill className="object-cover" sizes="(max-width: 1024px) 14rem, 20vw" />
            </div>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-8 lg:col-start-5">
            <p className="font-display text-3xl font-normal italic leading-snug sm:text-4xl">
              &ldquo;Software should carry the intention of the person who made it, not the other way
              around.&rdquo;
            </p>
            <div className="mt-8 max-w-2xl space-y-5 leading-relaxed text-muted-foreground">
              <p>
                I build things that reflect what I care about, and the best of them make culture a little easier to
                learn: Swesso teaches art history one swipe at a time, and the Lab runs on paintings from the Met.
              </p>
              <p>
                By day I&apos;m a QA automation engineer at <span className="text-foreground">VML</span>, building
                and running the Playwright suites that guard a large brand platform&apos;s releases. Through{" "}
                <span className="text-foreground">{site.studio.name}</span>, my LLC, I design and build websites for
                artists and small businesses. I work mostly in TypeScript, React, Next.js and Node.js.
              </p>
              <p>
                I got my start with <span className="text-foreground">LaunchCode</span>{" "}in 2024, where my full-stack
                capstone became Swesso. I&apos;ve also spent five years at <span className="text-foreground">UDC</span>{" "}
                maintaining a Squarespace site I built from scratch.
              </p>
            </div>
            <p className="eyebrow mt-8 text-muted-foreground">
              Off the clock: playing music, sketching the next project, and training Finn, my corgi.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
