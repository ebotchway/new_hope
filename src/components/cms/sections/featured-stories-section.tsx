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
    <section className="px-4 py-8 sm:py-12 bg-muted/30">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center mb-8 sm:mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl font-heading">
            {props.heading}
          </h2>
          {props.subheading && (
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
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
          <div className="mt-8 sm:mt-10">
            <RecentActivityTicker entries={recentDonations} />
          </div>
        )}
      </div>
    </section>
  );
}
