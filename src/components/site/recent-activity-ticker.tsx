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
    <div className="border-y bg-secondary/60 py-3">
      <div
        className="group flex overflow-hidden"
        style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}
      >
        <div className="flex shrink-0 animate-[marquee_32s_linear_infinite] items-center gap-8 group-hover:[animation-play-state:paused]">
          {items.map((entry, i) => (
            <div key={`${entry.id}-${i}`} className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm">
              <HeartHandshake className="size-3.5 shrink-0 text-brand-navy" />
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
