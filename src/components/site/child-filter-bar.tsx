"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowUpDown, X, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChildFilterBarProps {
  locations: string[];
  totalCount?: number;
}

export function ChildFilterBar({ locations, totalCount }: ChildFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentGender = searchParams.get("gender") || "ALL";
  const currentLocation = searchParams.get("location") || "ALL";
  const currentSort = searchParams.get("sort") || "featured";

  const hasActiveFilters =
    currentGender !== "ALL" || currentLocation !== "ALL" || currentSort !== "featured";

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL" || (key === "sort" && value === "featured")) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}#available-children` : pathname, { scroll: false });
  }

  function clearAllFilters() {
    router.push(pathname, { scroll: false });
  }

  return (
    <div className="mb-8 space-y-3">
      {/* Top Filter Container */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2.5 sm:p-3 rounded-2xl bg-card border border-border/80 shadow-xs">
        {/* Gender Segmented Control */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => updateFilter("gender", "ALL")}
            className={cn(
              "flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200",
              currentGender === "ALL"
                ? "bg-brand-navy text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            All Children
          </button>
          <button
            type="button"
            onClick={() => updateFilter("gender", "FEMALE")}
            className={cn(
              "flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200",
              currentGender === "FEMALE"
                ? "bg-brand-navy text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            Girls
          </button>
          <button
            type="button"
            onClick={() => updateFilter("gender", "MALE")}
            className={cn(
              "flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200",
              currentGender === "MALE"
                ? "bg-brand-navy text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            Boys
          </button>
        </div>

        {/* Dropdown Filters: Location & Sort */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
          {/* Location Filter */}
          {locations.length > 0 && (
            <div className="relative flex-1 sm:flex-initial">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <select
                value={currentLocation}
                onChange={(e) => updateFilter("location", e.target.value)}
                aria-label="Filter by Location"
                className="w-full sm:w-44 pl-8 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-input bg-background text-foreground font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-brand-gold/50 cursor-pointer shadow-xs"
              >
                <option value="ALL">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-[10px]">
                ▼
              </div>
            </div>
          )}

          {/* Sort Filter */}
          <div className="relative flex-1 sm:flex-initial">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <select
              value={currentSort}
              onChange={(e) => updateFilter("sort", e.target.value)}
              aria-label="Sort children"
              className="w-full sm:w-40 pl-8 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-input bg-background text-foreground font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-brand-gold/50 cursor-pointer shadow-xs"
            >
              <option value="featured">Featured First</option>
              <option value="newest">Newest First</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-[10px]">
              ▼
            </div>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-xl transition-colors border border-border/50"
              title="Reset all filters"
            >
              <X className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Counter Summary */}
      {typeof totalCount === "number" && (
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>
            Showing <strong className="text-foreground font-semibold">{totalCount}</strong>{" "}
            {totalCount === 1 ? "child" : "children"} awaiting sponsorship
          </span>
          {hasActiveFilters && (
            <span className="text-amber-600 dark:text-amber-400 font-medium">Filtered</span>
          )}
        </div>
      )}
    </div>
  );
}
