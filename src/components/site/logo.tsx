import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  tagline = false,
  light = false,
}: {
  className?: string;
  tagline?: boolean;
  light?: boolean;
}) {
  return (
    <Link href="/" className={cn("inline-flex flex-col leading-none", className)}>
      <span
        className={cn(
          "text-xl font-bold tracking-tight",
          light ? "text-white" : "text-brand-navy"
        )}
      >
        Livingh<span className="text-brand-accent">o</span>pe
      </span>
      {tagline && (
        <span
          className={cn(
            "text-[10px] tracking-widest uppercase mt-1",
            light ? "text-white/60" : "text-muted-foreground"
          )}
        >
          Brighten The Future
        </span>
      )}
    </Link>
  );
}
