import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { ContactInfoSectionProps } from "@/lib/cms-types";

export function CmsContactInfoSection({ props }: { props: ContactInfoSectionProps }) {
  return (
    <section className="px-4 py-16 sm:py-24" id="contact">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl font-heading">
            {props.heading}
          </h2>
          {props.subheading && (
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {props.subheading}
            </p>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-2 items-start">
          <div className="space-y-6 rounded-3xl border border-border/70 bg-card p-8 sm:p-10 shadow-xs">
            {props.address && (
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                  <MapPin className="size-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-lg">Our Office</h4>
                  <p className="mt-1 text-muted-foreground leading-relaxed">{props.address}</p>
                </div>
              </div>
            )}

            {props.phone && (
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                  <Phone className="size-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-lg">Call Us</h4>
                  <a
                    href={`tel:${props.phone}`}
                    className="mt-1 block text-muted-foreground hover:text-brand-primary"
                  >
                    {props.phone}
                  </a>
                </div>
              </div>
            )}

            {props.email && (
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                  <Mail className="size-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-lg">Email Us</h4>
                  <a
                    href={`mailto:${props.email}`}
                    className="mt-1 block text-muted-foreground hover:text-brand-primary"
                  >
                    {props.email}
                  </a>
                </div>
              </div>
            )}

            {props.hours && (
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                  <Clock className="size-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-lg">Operating Hours</h4>
                  <p className="mt-1 text-muted-foreground">{props.hours}</p>
                </div>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-3xl border border-border/70 bg-muted aspect-4/3 lg:aspect-square flex items-center justify-center shadow-xs">
            {props.mapEmbedUrl ? (
              <iframe
                title="Office Location Map"
                src={props.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <MapPin className="mx-auto size-12 text-brand-primary/40 mb-3" />
                <p className="font-medium">Greater Accra Region, Ghana</p>
                <p className="text-xs text-muted-foreground mt-1">Visiting by prior appointment</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

