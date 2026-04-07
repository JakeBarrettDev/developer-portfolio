"use client";

import { useRef } from "react";
import Image from "next/image";
import { ExternalLink, ArrowUpRight } from "lucide-react";
import { GitHubIcon } from "./icons";
import type { Project } from "@/data/projects";

export default function ProjectCard({ project }: { project: Project }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-500 hover:border-accent/30 hover:shadow-2xl hover:shadow-glow"
      onMouseEnter={() => videoRef.current?.play()}
      onMouseLeave={() => {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      }}
    >
      {/* Thumbnail / Video preview */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        <Image
          src={project.thumbnail}
          alt={`${project.title} screenshot`}
          fill
          className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-0"
          sizes="(max-width: 768px) 100vw, 50vw"
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
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-60" />

        {/* Floating arrow on hover */}
        {project.liveDemoUrl && (
          <div className="absolute right-4 top-4 translate-y-2 rounded-full bg-accent/90 p-2 text-accent-foreground opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="relative space-y-3 p-6">
        <h3 className="font-display text-xl font-bold transition-colors group-hover:text-accent">
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
              className="rounded-full border border-border bg-muted/50 px-3 py-0.5 text-xs font-medium text-muted-foreground transition-colors group-hover:border-accent/20 group-hover:text-foreground"
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
