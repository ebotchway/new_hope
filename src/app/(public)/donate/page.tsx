import { PageHero } from "@/components/site/page-hero";
import { DonationForm } from "@/components/site/donation-form";
import { Reveal } from "@/components/site/reveal";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PLACEHOLDER_IMAGES } from "@/lib/placeholder-images";

export const metadata = { title: "Make a Donation — LivingHope" };

export default async function DonatePage(props: PageProps<"/donate">) {
  const searchParams = await props.searchParams;
  const childId = typeof searchParams.childId === "string" ? searchParams.childId : undefined;
  const frequencyParam = typeof searchParams.frequency === "string" ? searchParams.frequency : undefined;

  const [session, child, settings] = await Promise.all([
    auth(),
    childId ? prisma.child.findUnique({ where: { id: childId, archived: false } }) : null,
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
  ]);

  return (
    <>
      <PageHero
        title={child ? `Sponsor ${child.name}` : "Empower Street Children Through Education"}
        subtitle={
          child
            ? `Your sponsorship ensures ${child.name} receives comprehensive schooling, books, meals, and mentorship.`
            : "Your generous donation provides school access, supplies, and hope to children in need. Together, we can transform lives."
        }
        imageUrl={child?.photoUrl ?? PLACEHOLDER_IMAGES.donateHero}
      />

      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-xl">
          <Reveal>
            <DonationForm
              childId={child?.id}
              childName={child?.name}
              designation={child ? "CHILD_SPONSORSHIP" : "GENERAL"}
              defaultFrequency={frequencyParam === "ONE_TIME" ? "ONE_TIME" : "MONTHLY"}
              prefillName={session?.user?.name ?? undefined}
              prefillEmail={session?.user?.email ?? undefined}
              momoEnabled={Boolean(settings?.momoNumber)}
              momoProviderName={settings?.momoProvider ?? undefined}
              momoRate={settings?.momoRateUsdToGhs ?? 15.5}
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
