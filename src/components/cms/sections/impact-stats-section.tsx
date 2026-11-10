import { ImpactStatsSectionProps } from "@/lib/cms-types";

export function CmsImpactStatsSection({
  props,
  liveData,
}: {
  props: ImpactStatsSectionProps;
  liveData?: {
    totalRaisedFormatted?: string;
    childrenHelped?: number;
    activeSponsorships?: number;
  };
}) {
  const stats =
    props.useLiveDatabase && liveData
      ? [
          { value: liveData.totalRaisedFormatted || "$120K+", label: "Direct Support Deployed" },
          { value: `${liveData.childrenHelped || 450}+`, label: "Children Helped" },
          { value: `${liveData.activeSponsorships || 85}+`, label: "Active Sponsorships" },
          { value: "100%", label: "Field Transparency" },
        ]
      : props.customStats || [
          { value: "450+", label: "Children Enrolled" },
          { value: "100%", label: "Direct Support" },
          { value: "12", label: "Communities" },
          { value: "85+", label: "Graduates" },
        ];

  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-7xl rounded-3xl bg-linear-to-br from-slate-900 via-emerald-950 to-slate-900 px-6 py-12 text-white shadow-xl sm:px-12 sm:py-16">
        <div className="mx-auto max-w-2xl text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading text-white">
            {props.heading}
          </h2>
          {props.subheading && (
            <p className="mt-3 text-base text-emerald-200/80 sm:text-lg">{props.subheading}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:gap-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center rounded-2xl bg-white/5 p-6 text-center backdrop-blur-xs ring-1 ring-white/10"
            >
              <span className="text-3xl font-extrabold tracking-tight text-amber-400 sm:text-4xl lg:text-5xl font-heading">
                {stat.prefix}
                {stat.value}
                {stat.suffix}
              </span>
              <span className="mt-2 text-xs font-medium uppercase tracking-wider text-slate-300 sm:text-sm">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

