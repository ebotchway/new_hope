import { cn } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

/**
 * Shown in place of a child's photo when none has been uploaded yet,
 * or when protecting beneficiary privacy under LivingHope child safeguarding rules.
 */
export function ChildPhotoPlaceholder({
  className,
  name,
}: {
  className?: string;
  name?: string;
}) {
  const initial = name ? name.trim().charAt(0).toUpperCase() : null;

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-brand-navy/10 via-secondary/80 to-brand-accent/15 p-4 text-center select-none",
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        <svg
          viewBox="0 0 120 120"
          className="size-20 sm:size-24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="60" cy="60" r="54" className="fill-brand-navy/10" />
          <path
            d="M40 82c0-14 9-23 20-23s20 9 20 23"
            className="stroke-brand-navy/40"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="60" cy="44" r="14" className="stroke-brand-navy/40" strokeWidth="3.5" />
          <path
            d="M84 36c3.5 3 3.5 9 0 12"
            className="stroke-brand-accent/60"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        {initial && (
          <span className="absolute text-lg font-bold text-brand-navy/70 font-heading">
            {initial}
          </span>
        )}
      </div>

      <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-background/80 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground shadow-xs backdrop-blur-xs">
        <ShieldCheck className="size-3 text-brand-primary" />
        <span>Photo Protected</span>
      </div>
    </div>
  );
}
