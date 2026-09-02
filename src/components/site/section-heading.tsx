import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  subtitle,
  className,
  align = "center",
}: {
  title: string;
  subtitle?: string;
  className?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={cn(align === "center" && "mx-auto text-center", "max-w-2xl", className)}>
      <h2 className="text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-3 text-sm text-muted-foreground sm:text-base">{subtitle}</p>}
    </div>
  );
}
