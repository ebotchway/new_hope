import { redirect } from "next/navigation";
import { PageHero } from "@/components/site/page-hero";
import { DonationForm } from "@/components/site/donation-form";
import { Reveal } from "@/components/site/reveal";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PLACEHOLDER_IMAGES } from "@/lib/placeholder-images";

export const metadata = { title: "Make a Donation" };

export default async function DonatePage(props: PageProps<"/donate">) {
  const searchParams = await props.searchParams;
  const childId = typeof searchParams.childId === "string" ? searchParams.childId : undefined;
  const frequencyParam = typeof searchParams.frequency === "string" ? searchParams.frequency : undefined;

  const [child, settings] = await Promise.all([
    childId ? prisma.child.findUnique({ where: { id: childId } }) : null,
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
  ]);

  if (child) {
    const session = await auth();
    if (!session) {
      redirect(`/login?callbackUrl=${encodeURIComponent(`/donate?childId=${childId}&frequency=${frequencyParam ?? "MONTHLY"}`)}`);
    }
  }

  return (
    <>
      <PageHero
        title="Empower Street Children Through Education"
        subtitle="Your generous donation provides school access, supplies, and hope to children in need. Together, we can transform lives."
        imageUrl={PLACEHOLDER_IMAGES.donateHero}
      />

      <section className="px-4 py-20">
        <div className="mx-auto max-w-xl">
          <Reveal>
            <DonationForm
              childId={child?.id}
              childName={child?.name}
              designation={child ? "CHILD_SPONSORSHIP" : "GENERAL"}
              defaultFrequency={frequencyParam === "ONE_TIME" ? "ONE_TIME" : "MONTHLY"}
              momoEnabled={Boolean(settings?.momoNumber)}
              momoProviderName={settings?.momoProvider ?? undefined}
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
