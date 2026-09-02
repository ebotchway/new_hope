import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CtaBanner({
  title,
  subtitle,
  primary,
  secondary,
  className,
}: {
  title: string;
  subtitle?: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
  className?: string;
}) {
  return (
    <section className={cn("px-4 py-16 sm:py-24", className)}>
      <div className="mx-auto max-w-5xl rounded-2xl bg-brand-navy px-6 py-14 text-center text-white sm:px-12">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        {subtitle && (
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/80 sm:text-base">{subtitle}</p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="rounded-full bg-white text-brand-navy hover:bg-white/90">
            <Link href={primary.href}>{primary.label}</Link>
          </Button>
          {secondary && (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href={secondary.href}>{secondary.label}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
