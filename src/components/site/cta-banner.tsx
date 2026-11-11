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
    <section className={cn("px-4 py-8 sm:py-12", className)}>
      <div
        className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl bg-brand-navy px-6 py-10 text-center text-white sm:px-12 sm:py-12"
        style={{
          backgroundImage:
            "radial-gradient(120% 140% at 15% -10%, color-mix(in oklch, var(--brand-navy-dark) 60%, transparent), transparent 60%)",
        }}
      >
        <h2 className="text-3xl tracking-tight text-balance sm:text-4xl lg:text-5xl">{title}</h2>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            {subtitle}
          </p>
        )}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full bg-white px-7 text-base text-brand-navy shadow-lg shadow-black/20 hover:bg-white/90"
          >
            <Link href={primary.href}>{primary.label}</Link>
          </Button>
          {secondary && (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/40 bg-transparent px-7 text-base text-white hover:bg-white/10 hover:text-white"
            >
              <Link href={secondary.href}>{secondary.label}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
