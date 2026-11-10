import { RichTextSectionProps } from "@/lib/cms-types";
import { cn } from "@/lib/utils";

export function CmsRichTextSection({ props }: { props: RichTextSectionProps }) {
  const widthClasses = {
    narrow: "max-w-3xl",
    default: "max-w-4xl",
    wide: "max-w-6xl",
  };

  const bgClasses = {
    white: "bg-background text-foreground",
    muted: "bg-muted/40 text-foreground",
    brand: "bg-linear-to-br from-brand-primary to-emerald-950 text-white",
  };

  const isBrand = props.backgroundColor === "brand";

  return (
    <section className="px-4 py-12">
      <div
        className={cn(
          "mx-auto rounded-3xl p-8 sm:p-14 shadow-xs",
          widthClasses[props.containerWidth || "default"],
          bgClasses[props.backgroundColor || "white"]
        )}
      >
        {props.heading && (
          <h2
            className={cn(
              "text-3xl font-bold tracking-tight sm:text-4xl font-heading mb-4",
              isBrand ? "text-white" : "text-foreground"
            )}
          >
            {props.heading}
          </h2>
        )}
        {props.subheading && (
          <p
            className={cn(
              "text-lg mb-8 leading-relaxed",
              isBrand ? "text-white/80" : "text-muted-foreground"
            )}
          >
            {props.subheading}
          </p>
        )}
        <div
          className={cn(
            "prose prose-lg max-w-none leading-relaxed",
            isBrand ? "text-white/95 prose-invert" : "text-foreground/90"
          )}
        >
          {props.content.split("\n\n").map((para, index) => (
            <p key={index} className="mb-4">
              {para}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

