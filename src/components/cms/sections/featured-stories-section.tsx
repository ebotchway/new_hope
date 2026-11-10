import { FeaturedStoriesSectionProps } from "@/lib/cms-types";
import { StoryCarousel } from "@/components/site/story-carousel";
import { RecentActivityTicker } from "@/components/site/recent-activity-ticker";

export interface StorySummary {
  id: string;
  name: string;
  age: number | null;
  quote: string;
  mediaUrl: string | null;
  imageUrl: string | null;
}

export interface RecentDonationEntry {
  id: string;
  donorName: string;
  anonymous: boolean;
  amountCents: number;
  currency: string;
  createdAt: Date;
  childName?: string | null;
}

export function CmsFeaturedStoriesSection({
  props,
  stories = [],
  recentDonations = [],
}: {
  props: FeaturedStoriesSectionProps;
  stories?: StorySummary[];
  recentDonations?: RecentDonationEntry[];
}) {
  return (
    <section className="px-4 py-16 sm:py-24 bg-muted/30">
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

        {stories.length > 0 ? (
          <StoryCarousel stories={stories} />
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No published impact stories available right now.
          </div>
        )}

        {props.showRecentDonors && recentDonations.length > 0 && (
          <div className="mt-16">
            <RecentActivityTicker entries={recentDonations} />
          </div>
        )}
      </div>
    </section>
  );
}
