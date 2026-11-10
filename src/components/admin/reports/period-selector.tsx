"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PERIOD_OPTIONS = [
  { value: "all_time", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "this_year", label: "This Year" },
];

export function PeriodSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPeriod = searchParams.get("period") || "all_time";

  const handlePeriodChange = (val: string | null) => {
    if (!val) return;
    const params = new URLSearchParams(searchParams.toString());
    if (val === "all_time") {
      params.delete("period");
    } else {
      params.set("period", val);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Calendar className="size-4 text-muted-foreground hidden sm:inline" />
      <Select value={currentPeriod} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-[160px] h-9 text-xs rounded-xl bg-card border-border/80">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {PERIOD_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
