"use client";

import { useRef } from "react";
import Image from "next/image";
import { ExternalLink, ArrowUpRight } from "lucide-react";
import { GitHubIcon } from "./icons";
import { cn } from "@/lib/utils";
import type { Project } from "@/data/projects";

const MAX_TILT_DEG = 4;

export default function ProjectCard({
  project,
  wide = false,
}: {
  project: Project;
  /** Full-width layout with the image beside the text (from md up). */
  wide?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (e.pointerType !== "mouse" || !card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    card.style.setProperty("--mx", `${x * 100}%`);
    card.style.setProperty("--my", `${y * 100}%`);
    // Wide cards tilt less so the effect reads the same across sizes.
    const tilt = wide ? MAX_TILT_DEG / 2 : MAX_TILT_DEG;
    card.style.setProperty("--rx", `${(x - 0.5) * tilt * 2}deg`);
    card.style.setProperty("--ry", `${(0.5 - y) * tilt * 2}deg`);
  }

  function handlePointerLeave() {
    const card = cardRef.current;
    card?.style.setProperty("--rx", "0deg");
    card?.style.setProperty("--ry", "0deg");
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }

  return (
    <div
      ref={cardRef}
      className={cn(
        "project-card group relative h-full overflow-hidden rounded-2xl border border-border bg-surface",
        wide && "md:grid md:grid-cols-5"
      )}
      style={{ "--card-accent": project.accent } as React.CSSProperties}
      onPointerEnter={() => videoRef.current?.play().catch(() => {})}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* Thumbnail / Video preview */}
      <div
        className={cn(
          "relative aspect-video overflow-hidden bg-muted",
          wide && "md:col-span-3 md:aspect-auto md:min-h-80"
        )}
      >
        <Image
          src={project.thumbnail}
          alt={`${project.title} screenshot`}
          fill
          className={cn(
            "object-cover object-top transition-all duration-700 group-hover:scale-105",
            project.previewVideo && "group-hover:opacity-0"
          )}
          sizes={wide ? "(max-width: 768px) 100vw, 60vw" : "(max-width: 768px) 100vw, 50vw"}
        />
        {project.previewVideo && (
          <video
            ref={videoRef}
            src={project.previewVideo}
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />
        )}
        {/* Gradient overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-60",
            wide && "md:bg-gradient-to-l md:opacity-40"
          )}
        />

        {project.status === "in-progress" && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-foreground opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-foreground" />
            </span>
            In Progress
          </span>
        )}

        {/* Floating arrow on hover */}
        {project.liveDemoUrl && (
          <div className="absolute right-4 top-4 translate-y-2 rounded-full bg-accent/90 p-2 text-accent-foreground opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Info */}
      <div
        className={cn(
          "relative space-y-3 p-6",
          wide && "md:col-span-2 md:flex md:flex-col md:justify-center md:p-8"
        )}
      >
        <h3
          className={cn(
            "project-card-title font-display font-bold transition-colors",
            wide ? "text-2xl" : "text-xl"
          )}
        >
          {project.title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>

        {/* Tech stack pills */}
        <div className="flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="project-card-pill rounded-full border border-border bg-muted/50 px-3 py-0.5 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="flex gap-5 pt-2">
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-accent"
          >
            <GitHubIcon className="h-4 w-4" />
            Code
          </a>
          {project.liveDemoUrl && (
            <a
              href={project.liveDemoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-accent"
            >
              <ExternalLink className="h-4 w-4" />
              Live Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
