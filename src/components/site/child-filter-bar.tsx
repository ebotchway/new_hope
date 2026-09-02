"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GENDER_LABELS: Record<string, string> = {
  ANY: "Any gender",
  FEMALE: "Girls",
  MALE: "Boys",
};

const SORT_LABELS: Record<string, string> = {
  featured: "Featured first",
  newest: "Newest first",
};

export function ChildFilterBar({ locations }: { locations: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string | null) {
    if (value === null) return;
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ANY") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}#available-children`, { scroll: false });
  }

  return (
    <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
      <Select
        key={`gender-${searchParams.get("gender") ?? "ANY"}`}
        defaultValue={searchParams.get("gender") ?? "ANY"}
        onValueChange={(v: string | null) => setParam("gender", v)}
      >
        <SelectTrigger className="w-40 bg-white">
          <SelectValue placeholder="Gender">{(v: string) => GENDER_LABELS[v] ?? v}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ANY">Any gender</SelectItem>
          <SelectItem value="FEMALE">Girls</SelectItem>
          <SelectItem value="MALE">Boys</SelectItem>
        </SelectContent>
      </Select>

      {locations.length > 0 && (
        <Select
          key={`location-${searchParams.get("location") ?? "ANY"}`}
          defaultValue={searchParams.get("location") ?? "ANY"}
          onValueChange={(v: string | null) => setParam("location", v)}
        >
          <SelectTrigger className="w-48 bg-white">
            <SelectValue placeholder="Location">{(v: string) => (v === "ANY" ? "Any location" : v)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ANY">Any location</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select
        key={`sort-${searchParams.get("sort") ?? "featured"}`}
        defaultValue={searchParams.get("sort") ?? "featured"}
        onValueChange={(v: string | null) => setParam("sort", v)}
      >
        <SelectTrigger className="w-40 bg-white">
          <SelectValue placeholder="Sort">{(v: string) => SORT_LABELS[v] ?? v}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="featured">Featured first</SelectItem>
          <SelectItem value="newest">Newest first</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
