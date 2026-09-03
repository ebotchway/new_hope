import { cn } from "@/lib/utils";
import { Breadcrumbs, type Crumb } from "@/components/site/breadcrumbs";

export function AdminPageHeader({
  title,
  description,
  action,
  className,
  breadcrumbs,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  /** Trail after "Dashboard" (which is always prepended); omit for the dashboard itself. */
  breadcrumbs?: Crumb[];
}) {
  return (
    <div className={cn("mb-6", className)}>
      {breadcrumbs && (
        <Breadcrumbs
          items={breadcrumbs}
          root={{ label: "Dashboard", href: "/admin" }}
          className="mb-3"
        />
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}
