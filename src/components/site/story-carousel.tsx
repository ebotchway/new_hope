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

      {stories.length > 1 && (
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
      )}
    </div>
  );
}
