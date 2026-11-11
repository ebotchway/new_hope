import Image from "next/image";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { CtaBanner } from "@/components/site/cta-banner";
import { BrightenerRegistrationFlow } from "@/components/site/brightener-registration-flow";
import { Reveal } from "@/components/site/reveal";
import { PLACEHOLDER_IMAGES } from "@/lib/placeholder-images";
import { PARTNERSHIP_TYPES } from "@/lib/partnership-types";
import type { PartnershipType } from "@/generated/prisma/enums";

export const metadata = {
  title: "Become a Brightener | LivingHope Partnership & Volunteer Registration",
  description:
    "Join the LivingHope Brightener movement. Choose your path to impact as an individual supporter, active volunteer, corporate partner, faith community, group, or legacy benefactor.",
};

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
        subtitle="Step into a purposeful journey. Choose how you want to bring lasting light, dignity, and opportunity to children on the street."
        imageUrl={PLACEHOLDER_IMAGES.brightenerHero}
      />

      {/* Intro Context Banner - Compact Spacing */}
      <section className="px-4 py-8 sm:py-10 border-b border-border/40 bg-secondary/30">
        <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-12 items-center">
          <div className="md:col-span-7">
            <Reveal>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold/15 px-3 py-1 text-xs font-semibold text-brand-gold-dark mb-2">
                The Brightener Community
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-navy">
                Every Journey to Impact is Unique
              </h2>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
                Whether you offer monthly financial sponsorship, lend your vocational or educational skills in Accra, coordinate your company’s social impact initiative, or pledge a legacy gift, you are a vital partner in our mission.
              </p>
            </Reveal>
          </div>
          <div className="md:col-span-5">
            <Reveal delay={0.1}>
              <div className="relative aspect-16/9 overflow-hidden rounded-2xl shadow-sm border border-border/40">
                <Image
                  src={PLACEHOLDER_IMAGES.missionSecondary}
                  alt="Children learning together at LivingHope community center"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Interactive Registration Section */}
      <section id="register" className="px-4 py-8 sm:py-12 bg-background">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <SectionHeading
              eyebrow="Registration Journey"
              title="Select Your Path & Register"
              subtitle="Choose the partnership category that reflects your commitment. Complete your tailored registration and our team will connect with you directly."
              className="mb-8"
            />
          </Reveal>
          <Reveal delay={0.1}>
            <BrightenerRegistrationFlow defaultType={defaultType} />
          </Reveal>
        </div>
      </section>

      <CtaBanner
        title="Have Questions Before Registering?"
        subtitle="If you need general advice, want to arrange an in-person meeting, or have press/research inquiries, visit our dedicated contact desk."
        primary={{ href: "/contact", label: "Contact Our Team" }}
        secondary={{ href: "/sponsor-a-child", label: "Sponsor a Child Directly" }}
        className="pt-0"
      />
    </>
  );
}
