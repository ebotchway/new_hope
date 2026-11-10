"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FaqSectionProps } from "@/lib/cms-types";
import { cn } from "@/lib/utils";

export function CmsFaqSection({ props }: { props: FaqSectionProps }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="px-4 py-16 sm:py-24 bg-muted/20">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl font-heading">
            {props.heading}
          </h2>
          {props.subheading && (
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {props.subheading}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {props.items.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-border/70 bg-card transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between p-6 text-left font-semibold text-foreground sm:text-lg transition-colors hover:text-brand-primary"
                  aria-expanded={isOpen}
                >
                  <span className="font-heading pr-4">{item.question}</span>
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 text-muted-foreground transition-transform duration-200",
                      isOpen && "rotate-180 text-brand-primary"
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-base leading-relaxed text-muted-foreground border-t border-border/30">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

