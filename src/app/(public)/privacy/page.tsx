export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-brand-navy">Privacy Policy</h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            LivingHope collects only the information needed to process donations, manage child
            sponsorships, and communicate with our supporters — including your name, email,
            phone number, and payment details processed securely through Stripe.
          </p>
          <p>
            We never sell donor information. You can opt out of email, SMS, or WhatsApp updates
            at any time from your account or by contacting us directly.
          </p>
          <p>
            For questions about how your data is used, please reach out via the contact details
            in our footer.
          </p>
        </div>
      </div>
    </section>
  );
}
