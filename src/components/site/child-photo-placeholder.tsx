import { cn } from "@/lib/utils";

/**
 * Shown in place of a child's photo when none has been uploaded yet. A soft,
 * brand-colored illustration reads as "no photo yet" rather than "broken image."
 */
export function ChildPhotoPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-navy/8 via-secondary to-brand-accent/10",
        className
      )}
    >
      <svg
        viewBox="0 0 120 120"
        className="h-2/5 w-2/5 max-h-28 max-w-28"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="60" cy="60" r="58" className="fill-brand-navy/5" />
        <path
          d="M40 78c0-14 9-23 20-23s20 9 20 23"
          className="stroke-brand-navy/30"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="60" cy="42" r="14" className="stroke-brand-navy/30" strokeWidth="3.5" />
        <path
          d="M84 34c3.5 3 3.5 9 0 12"
          className="stroke-brand-accent/60"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M90 30c6 5 6 15 0 20"
          className="stroke-brand-accent/35"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
