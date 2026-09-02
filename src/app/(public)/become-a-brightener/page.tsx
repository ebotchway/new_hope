import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { CtaBanner } from "@/components/site/cta-banner";
import { PartnershipInquiryForm } from "@/components/site/partnership-inquiry-form";
import { Reveal, RevealGroup, RevealItem } from "@/components/site/reveal";
import { PLACEHOLDER_IMAGES } from "@/lib/placeholder-images";
import { PARTNERSHIP_TYPES } from "@/lib/partnership-types";
import type { PartnershipType } from "@/generated/prisma/enums";

export const metadata = { title: "Become a Brightener" };

export default async function BecomeABrightenerPage(
  props: PageProps<"/become-a-brightener">
) {
  const searchParams = await props.searchParams;
  const requestedType = Array.isArray(searchParams.type) ? searchParams.type[0] : searchParams.type;
  const defaultType = PARTNERSHIP_TYPES.some((t) => t.type === requestedType)
    ? (requestedType as PartnershipType)
    : undefined;

  return (
    <>
      <PageHero
        title="Become a Brightener"
        subtitle="Join our mission to illuminate futures. Your partnership, big or small, creates lasting change."
        imageUrl={PLACEHOLDER_IMAGES.brightenerHero}
      />

      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionHeading
              title="Your Path to Impact"
              subtitle="We have various ways for you to make a lasting impact. Explore each of them to find one that best meets your desire to help a street child."
              className="mb-10"
            />
          </Reveal>
          <Reveal delay={0.1} className="relative aspect-21/9 overflow-hidden rounded-2xl">
            <Image
              src={PLACEHOLDER_IMAGES.missionSecondary}
              alt="Children supported by LivingHope"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </Reveal>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionHeading title="Explore Our Partnership Options" className="mb-10" />
          </Reveal>
          <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PARTNERSHIP_TYPES.map((option, index) => {
              const Icon = option.icon;
              const highlighted = index === 0;
              return (
                <RevealItem key={option.type}>
                  <Card
                    className={
                      highlighted
                        ? "h-full border-none bg-brand-navy text-white transition-transform duration-300 hover:-translate-y-1"
                        : "h-full border-none bg-secondary transition-transform duration-300 hover:-translate-y-1"
                    }
                  >
                    <CardContent className="flex h-full flex-col gap-4 p-6">
                      <Icon className={highlighted ? "size-6" : "size-6 text-brand-navy"} />
                      <div>
                        <h3 className="font-semibold">{option.title}</h3>
                        <p className={highlighted ? "mt-2 text-sm text-white/80" : "mt-2 text-sm text-muted-foreground"}>
                          {option.description}
                        </p>
                      </div>
                      <Button
                        asChild
                        className={
                          highlighted
                            ? "mt-auto w-full rounded-full bg-white text-brand-navy hover:bg-white/90"
                            : "mt-auto w-full rounded-full bg-brand-navy text-white hover:bg-brand-navy-dark"
                        }
                      >
                        <a href={`/become-a-brightener?type=${option.type}#inquire`}>Learn More</a>
                      </Button>
                    </CardContent>
                  </Card>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </section>

      <section id="inquire" className="px-4 pb-20">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <SectionHeading
              title="Tell Us How You'd Like to Help"
              subtitle="Share a few details and our partnerships team will reach out with next steps."
              className="mb-8"
            />
          </Reveal>
          <Reveal delay={0.1}>
            <PartnershipInquiryForm defaultType={defaultType} />
          </Reveal>
        </div>
      </section>

      <CtaBanner
        title="Ready to Make a Difference?"
        subtitle="Every partnership, every contribution, and every hour volunteered helps us provide hope and a brighter future to children in need. Your support transforms lives."
        primary={{ href: "/donate", label: "Make a General Donation" }}
        secondary={{ href: "/sponsor-a-child", label: "Sponsor a Street Child" }}
        className="pt-0"
      />
    </>
  );
}
