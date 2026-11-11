import { PageHero } from "@/components/site/page-hero";
import { GeneralInquiryForm } from "@/components/site/general-inquiry-form";
import { CtaBanner } from "@/components/site/cta-banner";
import { Reveal } from "@/components/site/reveal";
import { PLACEHOLDER_IMAGES } from "@/lib/placeholder-images";
import { Mail, Phone, MapPin, Clock, HeartHandshake, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Contact Us | LivingHope Charity Foundation",
  description:
    "Get in touch with the LivingHope team in Accra, Ghana. Submit a general inquiry, ask about child sponsorship, donations, media inquiries, or visiting our center.",
};

const CONTACT_CHANNELS = [
  {
    icon: Mail,
    title: "Email Us",
    detail: "info@livinghope.org.gh",
    subdetail: "We respond within 1–2 business days",
    href: "mailto:info@livinghope.org.gh",
  },
  {
    icon: Phone,
    title: "Call or WhatsApp",
    detail: "+233 24 123 4567",
    subdetail: "Monday–Friday, 8:30am–5:00pm GMT",
    href: "tel:+233241234567",
  },
  {
    icon: MapPin,
    title: "Accra Centre",
    detail: "LivingHope Centre, Ring Road Central",
    subdetail: "Accra, Greater Accra, Ghana",
    href: "https://maps.google.com/?q=Accra+Ghana",
  },
  {
    icon: Clock,
    title: "Visiting Hours",
    detail: "Mon–Fri: 8:30am – 5:00pm GMT",
    subdetail: "Pre-arranged visits only for safeguarding",
    href: null,
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Contact Us"
        subtitle="Have a question about our work, want to visit our center, or explore how to get involved? We would love to hear from you."
        imageUrl={PLACEHOLDER_IMAGES.contactHero}
      />

      {/* Main Contact Section */}
      <section className="px-4 py-8 sm:py-12 bg-background">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-12">
            {/* Left: Contact Info & Safeguarding Note */}
            <div className="lg:col-span-5 space-y-6">
              <Reveal>
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold/15 px-3 py-1 text-xs font-semibold text-brand-gold-dark mb-2">
                    Get in Touch
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-navy">
                    We’re Here to Help
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Whether you have questions regarding child sponsorship, one-time contributions, volunteer requirements, or partnerships, our team in Accra is ready to assist.
                  </p>
                </div>
              </Reveal>

              {/* Direct channels */}
              <Reveal delay={0.1} className="space-y-3">
                {CONTACT_CHANNELS.map((ch) => {
                  const Icon = ch.icon;
                  const content = (
                    <div className="flex items-start gap-3.5 rounded-xl border border-border/60 bg-card p-4 transition-all duration-200 hover:border-brand-navy/30 hover:shadow-xs">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-navy/10 text-brand-navy">
                        <Icon className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {ch.title}
                        </h3>
                        <p className="mt-0.5 text-sm font-medium text-foreground truncate">
                          {ch.detail}
                        </p>
                        <p className="text-xs text-muted-foreground">{ch.subdetail}</p>
                      </div>
                    </div>
                  );

                  return ch.href ? (
                    <Link
                      key={ch.title}
                      href={ch.href}
                      target={ch.href.startsWith("http") ? "_blank" : undefined}
                      rel={ch.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="block group"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div key={ch.title}>{content}</div>
                  );
                })}
              </Reveal>

              {/* Safeguarding notice */}
              <Reveal delay={0.2}>
                <div className="rounded-xl border border-brand-gold/30 bg-brand-gold/5 p-4 text-xs text-muted-foreground flex items-start gap-3">
                  <ShieldCheck className="size-5 shrink-0 text-brand-gold-dark mt-0.5" />
                  <div>
                    <strong className="font-semibold text-foreground">Visitor Safeguarding Policy:</strong>{" "}
                    To protect the safety and privacy of vulnerable children, all center visits require advance appointment scheduling, government ID verification, and adherence to our Child Protection Code of Conduct.
                  </div>
                </div>
              </Reveal>

              {/* Brightener pathway promotion */}
              <Reveal delay={0.25}>
                <div className="rounded-xl border border-brand-navy/15 bg-brand-navy/5 p-4">
                  <div className="flex items-start gap-3">
                    <HeartHandshake className="size-5 shrink-0 text-brand-navy mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-brand-navy">
                        Looking to Partner Long-Term?
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        If you are registering as a monthly Brightener, corporate partner, volunteer, or faith community, visit our dedicated partnership hub.
                      </p>
                      <Link
                        href="/become-a-brightener"
                        className="mt-2.5 inline-flex items-center text-xs font-semibold text-brand-navy hover:underline"
                      >
                        Go to Brightener Registration &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Right: General Inquiry Form */}
            <div className="lg:col-span-7">
              <Reveal delay={0.15}>
                <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8 shadow-xs">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold tracking-tight text-foreground">
                      Send Us a Message
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Fill out the form below and our team will get back to you promptly.
                    </p>
                  </div>
                  <GeneralInquiryForm />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <CtaBanner
        title="Want to Directly Transform a Life Today?"
        subtitle="Your monthly sponsorship provides education, nutrition, medical care, and safe housing to a child on the street."
        primary={{ href: "/sponsor-a-child", label: "Sponsor a Child" }}
        secondary={{ href: "/donate", label: "Make a General Donation" }}
        className="pt-0"
      />
    </>
  );
}
