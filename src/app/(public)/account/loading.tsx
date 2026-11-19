import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AccountLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8" role="status" aria-label="Loading Account">
      {/* User Header Profile Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="size-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-border/60 bg-card/50">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-28 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-20 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Section Skeleton */}
      <Card className="border-border/60 bg-card/50">
        <CardHeader>
          <Skeleton className="h-5 w-40 rounded" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}
