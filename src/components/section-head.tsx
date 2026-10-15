import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Magazine-style running head: a hairline rule, a numbered mono label and an
 * optional serif headline, in place of card-style section titles.
 */
export default function SectionHead({
  index,
  label,
  title,
  action,
  className,
}: {
  index: string;
  label: string;
  title?: React.ReactNode;
  action?: { href: string; label: string; external?: boolean };
  className?: string;
}) {
  return (
    <header className={cn("border-t border-border pt-4", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="eyebrow text-muted-foreground">
          <span className="text-accent">{index}</span>
          <span aria-hidden="true"> — </span>
          {label}
        </p>
        {action &&
          (action.external ? (
            <a href={action.href} target="_blank" rel="noopener noreferrer" className="eyebrow group inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-accent">
              {action.label}
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
          ) : (
            <Link href={action.href} className="eyebrow group inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-accent">
              {action.label}
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          ))}
      </div>
      {title && (
        <h2 className="mt-6 max-w-4xl font-display text-3xl font-medium leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl">
          {title}
        </h2>
      )}
    </header>
  );
}
