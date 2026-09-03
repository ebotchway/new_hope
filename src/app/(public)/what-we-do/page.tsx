import Image from "next/image";
import { GraduationCap, HardHat } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { CtaBanner } from "@/components/site/cta-banner";
import { Reveal, RevealGroup, RevealItem } from "@/components/site/reveal";
import { PLACEHOLDER_IMAGES } from "@/lib/placeholder-images";

export const metadata = { title: "What We Do" };

export default function WhatWeDoPage() {
  return (
    <>
      <PageHero
        title="We Connect Generous People to Needy Children"
        subtitle="If you are looking for an avenue to channel your generosity, we have impoverished street-dwelling children for you. They are in dire need of generosity."
        imageUrl={PLACEHOLDER_IMAGES.whatWeDoHero}
      />

      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionHeading eyebrow="Our Approach" title="Our Mission in Action" align="left" className="mb-12" />
          </Reveal>
          <div className="grid gap-8 sm:grid-cols-2">
            <Reveal className="flex flex-col gap-5">
              <p className="text-base leading-relaxed text-muted-foreground">
                LivingHope breaks the poverty cycle by providing underprivileged children with
                quality education. We provide school fees and educational supplies.
              </p>
              <div className="relative aspect-4/3 overflow-hidden rounded-3xl shadow-sm">
                <Image
                  src={PLACEHOLDER_IMAGES.missionSecondary}
                  alt="Children with school books"
                  fill
                  sizes="(min-width: 640px) 45vw, 90vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            </Reveal>
            <Reveal direction="left" delay={0.1} className="flex flex-col gap-4">
              <div className="relative aspect-4/3 overflow-hidden rounded-3xl shadow-sm">
                <Image
                  src={PLACEHOLDER_IMAGES.brightenerHero}
                  alt="Vocational training workshop"
                  fill
                  sizes="(min-width: 640px) 45vw, 90vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                We sponsor vocational training for older youth
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionHeading eyebrow="The Method" title="How We Transform Lives" className="mb-12" />
          </Reveal>
          <RevealGroup className="grid gap-5 sm:grid-cols-2">
            <RevealItem>
              <Card className="h-full rounded-2xl border-none bg-secondary shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg">
                <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-navy/10">
                    <HardHat className="size-7 text-foreground" />
                  </span>
                  <h3 className="text-xl font-semibold text-foreground">Vocational Training</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    We empower older youth with vocational skills for employment and economic
                    independence.
                  </p>
                </CardContent>
              </Card>
            </RevealItem>
            <RevealItem>
              <Card className="h-full rounded-2xl border-none bg-brand-navy text-white shadow-xl shadow-brand-navy/15 transition-all duration-300 hover:-translate-y-1.5">
                <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-white/15">
                    <GraduationCap className="size-7" />
                  </span>
                  <h3 className="text-xl font-semibold">Quality Education</h3>
                  <p className="text-sm leading-relaxed text-white/80">
                    We provide comprehensive schooling including tuition, books, uniforms, and daily
                    meals.
                  </p>
                </CardContent>
              </Card>
            </RevealItem>
          </RevealGroup>
        </div>
      </section>

      <CtaBanner
        title="Connect Your Generosity to a Needy Street Child"
        subtitle="You can brighten the future of a street child by giving them access to education or vocational apprenticeship."
        primary={{ href: "/sponsor-a-child", label: "Connect to a Needy Child" }}
        className="pt-0"
      />
    </>
  );
}
