import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PeriodSelector } from "./period-selector";
import { ExportButton } from "./export-button";

interface ReportHeaderProps {
  title: string;
  description: string;
  breadcrumbs?: { label: string; href?: string }[];
  exportType?: string;
  showPeriodSelector?: boolean;
}

export function ReportHeader({
  title,
  description,
  breadcrumbs = [],
  exportType,
  showPeriodSelector = true,
}: ReportHeaderProps) {
  return (
    <div className="mb-6 space-y-3 border-b pb-5">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/admin" className="hover:text-foreground transition-colors">
          Admin
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href="/admin/reports" className="hover:text-foreground transition-colors">
          Reports
        </Link>
        {breadcrumbs.map((b, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <ChevronRight className="size-3.5" />
            {b.href ? (
              <Link href={b.href} className="hover:text-foreground transition-colors">
                {b.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{b.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-heading text-foreground">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {showPeriodSelector && <PeriodSelector />}
          {exportType && <ExportButton type={exportType} />}
        </div>
      </div>
    </div>
  );
}

