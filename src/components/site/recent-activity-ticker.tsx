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
    <div className="flex items-stretch border-y bg-secondary/60">
      <div className="flex shrink-0 items-center gap-1.5 border-r bg-secondary px-4 py-3 text-xs font-semibold tracking-wide text-foreground uppercase">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        Live
      </div>
      <div
        className="group flex flex-1 overflow-hidden"
        style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}
      >
        <div className="flex shrink-0 animate-[marquee_32s_linear_infinite] items-center gap-8 py-3 pl-8 group-hover:paused">
          {items.map((entry, i) => (
            <div key={`${entry.id}-${i}`} className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm">
              <HeartHandshake className="size-3.5 shrink-0 text-foreground" />
              <span className="font-medium">{formatDonorDisplayName(entry.donorName, entry.anonymous)}</span>
              <span className="text-muted-foreground">
                gave {formatMoney(entry.amountCents, entry.currency)}
                {entry.childName ? ` for ${entry.childName}` : ""} · {timeAgo(entry.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
