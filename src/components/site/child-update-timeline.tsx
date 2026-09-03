import Image from "next/image";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/site/reveal";
import { formatDate } from "@/lib/format";

type Update = {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  createdAt: Date;
};

export function ChildUpdateTimeline({ childName, updates }: { childName: string; updates: Update[] }) {
  if (updates.length === 0) return null;

  return (
    <section className="bg-secondary px-4 py-24">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <SectionHeading
            eyebrow="Progress Reports"
            title={`${childName}'s Journey`}
            subtitle="Updates from the school and our team, shared as they happen."
            className="mb-12"
          />
        </Reveal>
        <RevealGroup className="relative space-y-8 before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-px before:bg-border sm:before:left-[19px]">
          {updates.map((update) => (
            <RevealItem key={update.id} className="relative flex gap-5 pl-0">
              <span className="relative z-10 mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-navy sm:size-10">
                <span className="size-2 rounded-full bg-white" />
              </span>
              <div className="min-w-0 flex-1 rounded-2xl bg-card p-5 shadow-sm sm:p-6">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {formatDate(update.createdAt)}
                </p>
                <h3 className="mt-1.5 text-lg font-semibold text-foreground">{update.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{update.body}</p>
                {update.imageUrl && (
                  <div className="relative mt-4 aspect-16/9 overflow-hidden rounded-xl">
                    <Image
                      src={update.imageUrl}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 40vw, 90vw"
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
