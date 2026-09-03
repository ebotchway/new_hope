
export const metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold text-foreground">Terms &amp; Conditions</h1>
        <div className="mt-8 space-y-5 rounded-3xl bg-secondary p-8 text-sm leading-relaxed text-muted-foreground sm:p-10">
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
