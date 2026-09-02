import { Progress } from "@/components/ui/progress";
import { formatMoney } from "@/lib/format";

export function SponsorshipProgress({
  raisedCents,
  goalCents,
}: {
  raisedCents: number;
  goalCents: number;
}) {
  if (goalCents <= 0) return null;

  const pct = Math.min(100, Math.round((raisedCents / goalCents) * 100));

  return (
    <div className="space-y-1.5">
      <Progress value={pct} className="h-2" />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground">{formatMoney(raisedCents)}</span> raised
        </span>
        <span>{pct}% of {formatMoney(goalCents)} goal</span>
      </div>
    </div>
  );
}
