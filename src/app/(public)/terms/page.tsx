export const metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-brand-navy">Terms &amp; Conditions</h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            By donating or sponsoring a child through this website, you agree that contributions
            are made voluntarily to support LivingHope&apos;s charitable programs for
            street-dwelling children.
          </p>
          <p>
            Monthly sponsorships continue until cancelled. You can pause or end a sponsorship at
            any time from your account or by contacting our team.
          </p>
          <p>
            Donations are generally non-refundable once processed; please contact us directly if
            you believe a donation was made in error.
          </p>
        </div>
      </div>
    </section>
  );
}
