"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ProgressReportsFilterProps {
  childrenList: { id: string; name: string }[];
  selectedChildId: string;
  statusFilter: string;
  totalReports: number;
  publishedCount: number;
  draftCount: number;
}

export function ProgressReportsFilter({
  childrenList,
  selectedChildId,
  statusFilter,
  totalReports,
  publishedCount,
  draftCount,
}: ProgressReportsFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChildChange = (childId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (childId) {
      params.set("child", childId);
    } else {
      params.delete("child");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status !== "all") {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasActiveFilters = Boolean(selectedChildId) || statusFilter !== "all";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold text-muted-foreground">Filter by:</span>

        {/* Child Filter */}
        <div className="flex items-center gap-1.5">
          <select
            aria-label="Filter by Child"
            value={selectedChildId}
            onChange={(e) => handleChildChange(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium shadow-xs focus:outline-hidden focus:ring-2 focus:ring-ring"
          >
            <option value="">All Children ({childrenList.length})</option>
            {childrenList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <select
            aria-label="Filter by Status"
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium shadow-xs focus:outline-hidden focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Statuses ({totalReports})</option>
            <option value="published">Published Only ({publishedCount})</option>
            <option value="draft">Drafts Only ({draftCount})</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">
          <Link href="/admin/progress-reports">Reset Filters</Link>
        </Button>
      )}
    </div>
  );
}
