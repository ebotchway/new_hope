import { HeartHandshake } from "lucide-react";
import { formatDonorDisplayName, formatMoney, timeAgo } from "@/lib/format";

type Entry = {
  id: string;
  donorName: string;
  anonymous: boolean;
  amountCents: number;
  currency: string;
  createdAt: Date;
  childName?: string | null;
};

export function RecentActivityTicker({ entries }: { entries: Entry[] }) {
  if (entries.length === 0) return null;

  // Duplicate the list so the CSS marquee loops seamlessly.
  const items = [...entries, ...entries];

  return (
    <div className="flex items-stretch rounded-xl border border-border/80 bg-secondary/50 overflow-hidden shadow-2xs">
      <div className="flex shrink-0 items-center gap-1.5 border-r border-border/70 bg-secondary px-3.5 py-2.5 text-[11px] font-semibold tracking-wide text-foreground uppercase">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        Recent Support
      </div>
      <div
        className="group flex flex-1 overflow-hidden"
        style={{ maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)" }}
      >
        <div className="flex shrink-0 animate-[marquee_32s_linear_infinite] items-center gap-8 py-2.5 pl-6 group-hover:paused">
          {items.map((entry, i) => (
            <div key={`${entry.id}-${i}`} className="flex shrink-0 items-center gap-2 whitespace-nowrap text-xs">
              <HeartHandshake className="size-3.5 shrink-0 text-brand-primary" />
              <span className="font-semibold text-foreground">{formatDonorDisplayName(entry.donorName, entry.anonymous)}</span>
              <span className="text-muted-foreground">
                contributed {formatMoney(entry.amountCents, entry.currency)}
                {entry.childName ? ` for ${entry.childName}` : ""} · {timeAgo(entry.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
