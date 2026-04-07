import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPost } from "@/lib/blog";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.meta.title,
    description: post.meta.description,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-2xl">
      <Link
        href="/blog"
        className="link-underline mb-10 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to blog
      </Link>

      <header className="animate-fade-up mb-12">
        <time className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
          {post.meta.date}
        </time>
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight sm:text-5xl">
          {post.meta.title}
        </h1>
        <div className="mt-6 h-1 w-16 rounded-full bg-accent/30" />
      </header>

      <div
        className="animate-fade-up prose prose-neutral dark:prose-invert prose-headings:font-display prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:text-accent max-w-none"
        style={{ animationDelay: "200ms" }}
      >
        <MDXRemote source={post.content} />
      </div>
    </article>
  );
}
