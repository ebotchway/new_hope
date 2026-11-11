"use client";

import { useRef, useState } from "react";
import { Play } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Story = {
  id: string;
  name: string;
  age: number | null;
  quote: string;
  mediaUrl: string | null;
  imageUrl: string | null;
};

export function StoryCarousel({ stories }: { stories: Story[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild?.clientWidth ?? 1;
    setActive(Math.round(el.scrollLeft / (cardWidth + 24)));
  }

  function scrollToIndex(index: number) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.children[index] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

  if (stories.length === 0) return null;

  // Single story presentation: centered, spacious, balanced card with rich quotation
  if (stories.length === 1) {
    const story = stories[0];
    return (
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
          <div className="relative sm:w-2/5 shrink-0 bg-secondary/50 min-h-56 sm:min-h-full">
            {story.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={story.imageUrl} alt={story.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full min-h-48 items-center justify-center p-6">
                <Avatar className="size-20 border-2 border-brand-gold">
                  <AvatarFallback className="bg-brand-navy text-2xl font-bold text-white">
                    {story.name.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
            {story.mediaUrl && (
              <button
                type="button"
                aria-label={`Play ${story.name}'s story`}
                className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors hover:bg-black/35"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-white/95 shadow-md">
                  <Play className="size-5 fill-brand-navy text-brand-navy ml-0.5" />
                </span>
              </button>
            )}
          </div>
          <div className="flex flex-1 flex-col justify-center gap-4 p-6 sm:p-8">
            <span className="text-3xl text-brand-gold font-serif leading-none select-none">“</span>
            <p className="text-base sm:text-lg leading-relaxed text-foreground -mt-3 italic">
              {story.quote}
            </p>
            <div className="flex items-center gap-2 border-t pt-3">
              <span className="text-sm font-bold text-brand-navy dark:text-blue-300">{story.name}</span>
              {story.age && (
                <span className="text-xs text-muted-foreground font-medium">· {story.age} years old</span>
              )}
              <span className="ml-auto inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                Sponsored Student
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Multi-story presentation: scrollable cards with carousel dots
  return (
    <div>
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {stories.map((story) => (
          <div
            key={story.id}
            className="flex w-[85%] shrink-0 snap-start overflow-hidden rounded-2xl border bg-card sm:w-[46%]"
          >
            <div className="relative w-2/5 shrink-0 bg-muted">
              {story.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={story.imageUrl} alt={story.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full min-h-40 items-center justify-center">
                  <Avatar className="size-16">
                    <AvatarFallback className="bg-brand-navy text-lg text-white">
                      {story.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              {story.mediaUrl && (
                <button
                  type="button"
                  aria-label={`Play ${story.name}'s story`}
                  className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30"
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-white/90">
                    <Play className="size-4 fill-brand-navy text-brand-navy" />
                  </span>
                </button>
              )}
            </div>
            <div className="flex flex-1 flex-col justify-center gap-3 p-5">
              <p className="text-sm text-foreground">{story.quote}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{story.name}</span>
                {story.age && (
                  <span className="text-xs text-muted-foreground">{story.age} years old</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        {stories.map((story, index) => (
          <button
            key={story.id}
            type="button"
            aria-label={`Go to story ${index + 1}`}
            onClick={() => scrollToIndex(index)}
            className={cn(
              "size-2 rounded-full transition-all",
              active === index ? "w-5 bg-brand-navy" : "bg-muted-foreground/30"
            )}
          />
        ))}
      </div>
    </div>
  );
}
