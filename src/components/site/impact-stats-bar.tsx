import { GraduationCap, HandCoins, HeartHandshake } from "lucide-react";
import { AnimatedCounter } from "@/components/site/animated-counter";
import { Reveal } from "@/components/site/reveal";

export function ImpactStatsBar({
  totalRaisedCents,
  activeSponsorships,
  childrenHelped,
}: {
  totalRaisedCents: number;
  activeSponsorships: number;
  childrenHelped: number;
}) {
  const stats = [
    {
      icon: HandCoins,
      value: Math.round(totalRaisedCents / 100),
      prefix: "$",
      label: "Raised for our children",
    },
    {
      icon: HeartHandshake,
      value: activeSponsorships,
      label: "Active sponsorships",
    },
    {
      icon: GraduationCap,
      value: childrenHelped,
      label: "Children supported",
    },
  ];

  return (
    <section className="px-4 py-14">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="grid grid-cols-1 gap-6 rounded-2xl border bg-card p-8 sm:grid-cols-3 sm:divide-x">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2 text-center">
                <stat.icon className="size-5 text-brand-navy" />
                <AnimatedCounter
                  value={stat.value}
                  prefix={stat.prefix}
                  className="text-3xl font-bold text-brand-navy"
                />
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
