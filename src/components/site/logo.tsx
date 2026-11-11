import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  tagline = false,
  light = false,
  size = "md",
}: {
  className?: string;
  tagline?: boolean;
  light?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const isLg = size === "lg";
  const isSm = size === "sm";

  return (
    <Link
      href="/"
      className={cn(
        "inline-flex flex-col select-none transition-opacity hover:opacity-95 leading-none shrink-0",
        className
      )}
      aria-label="LivingHope - Brighten The Future"
    >
      <div
        className={cn(
          "flex items-center font-heading font-extrabold tracking-tight",
          isLg ? "text-2xl sm:text-[28px]" : isSm ? "text-lg" : "text-xl sm:text-2xl",
          light ? "text-[#E2E8F0]" : "text-brand-navy dark:text-[#E2E8F0]"
        )}
      >
        <span>Livingh</span>
        {/* Distinctive official solid red circular letterform for 'o' */}
        <span
          className={cn(
            "inline-block rounded-full bg-[#DC2626] shrink-0 mx-[1px]",
            isLg ? "size-3.5 sm:size-4" : isSm ? "size-2.5" : "size-3 sm:size-3.5"
          )}
          aria-hidden="true"
        />
        <span>pe</span>
      </div>

      {tagline && (
        <div
          className={cn(
            "flex items-center justify-between gap-1.5 sm:gap-2 mt-1 sm:mt-1.5",
            light ? "text-[#CBD5E1]" : "text-slate-600 dark:text-slate-300"
          )}
        >
          <span className="h-[1px] flex-1 bg-current opacity-60" />
          <span
            className={cn(
              "font-sans font-bold tracking-[0.24em] uppercase whitespace-nowrap",
              isLg ? "text-[8px] sm:text-[9.5px]" : "text-[7px] sm:text-[8px]"
            )}
          >
            Brighten The Future
          </span>
          <span className="h-[1px] flex-1 bg-current opacity-60" />
        </div>
      )}
    </Link>
  );
}
