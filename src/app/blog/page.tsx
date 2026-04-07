import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PenLine } from "lucide-react";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Thoughts on code, projects, and learning.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="space-y-12">
      <div>
        <div className="animate-slide-left flex items-center gap-4">
          <h1 className="font-display text-3xl font-bold">Blog</h1>
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        </div>
        <p
          className="animate-fade-up mt-3 text-muted-foreground"
          style={{ animationDelay: "100ms" }}
        >
          Thoughts on code, projects, and learning.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="animate-fade-up rounded-2xl border border-dashed border-border p-12 text-center">
          <PenLine className="mx-auto mb-4 h-8 w-8 text-muted-foreground/40" />
          <p className="font-display text-lg font-semibold text-muted-foreground">
            No posts yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground/60">
            Check back soon — something&apos;s brewing.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {posts.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="animate-fade-up group relative block overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-all hover:border-accent/30 hover:shadow-xl hover:shadow-glow sm:p-8"
              style={{ animationDelay: `${150 + i * 100}ms` }}
            >
              {/* Accent bar on left */}
              <div className="absolute inset-y-0 left-0 w-1 bg-accent opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <time className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
                    {post.date}
                  </time>
                  <h2 className="mt-2 font-display text-xl font-bold transition-colors group-hover:text-accent">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {post.description}
                  </p>
                </div>
                <ArrowRight className="mt-6 h-5 w-5 shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-1 group-hover:text-accent" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
