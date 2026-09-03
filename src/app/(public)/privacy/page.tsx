
export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold text-foreground">Privacy Policy</h1>
        <div className="mt-8 space-y-5 rounded-3xl bg-secondary p-8 text-sm leading-relaxed text-muted-foreground sm:p-10">
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
