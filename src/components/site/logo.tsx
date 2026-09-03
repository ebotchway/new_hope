import Link from "next/link";
import { cn } from "@/lib/utils";

const WORDMARK_SIZE = {
  md: "text-2xl",
  lg: "text-3xl",
} as const;

export function Logo({
  className,
  tagline = false,
  light = false,
  size = "md",
}: {
  className?: string;
  tagline?: boolean;
  light?: boolean;
  size?: keyof typeof WORDMARK_SIZE;
}) {
  return (
    <Link href="/" className={cn("inline-flex flex-col leading-none", className)}>
      <span
        className={cn(
          "font-heading font-semibold tracking-tight",
          WORDMARK_SIZE[size],
          light ? "text-white" : "text-foreground"
        )}
      >
        Livingh<span className="text-brand-accent">o</span>pe
      </span>
      {tagline && (
        <span
          className={cn(
            "mt-1.5 text-[10px] font-medium tracking-[0.2em] uppercase",
            light ? "text-white/60" : "text-muted-foreground"
          )}
        >
          Brighten The Future
        </span>
      )}
    </Link>
  );
}
