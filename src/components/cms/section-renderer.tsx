import {
  CmsSection,
  HeroSectionProps,
  RichTextSectionProps,
  ImageTextSectionProps,
  CardGridSectionProps,
  ImpactStatsSectionProps,
  FeaturedChildrenSectionProps,
  ProgrammesSectionProps,
  FeaturedStoriesSectionProps,
  TestimonialsSectionProps,
  FaqSectionProps,
  DonationCtaSectionProps,
  PartnershipCtaSectionProps,
  ContactInfoSectionProps,
} from "@/lib/cms-types";
import { CmsHeroSection } from "./sections/hero-section";
import { CmsRichTextSection } from "./sections/rich-text-section";
import { CmsImageTextSection } from "./sections/image-text-section";
import { CmsCardGridSection } from "./sections/card-grid-section";
import { CmsImpactStatsSection } from "./sections/impact-stats-section";
import { CmsFeaturedChildrenSection, FeaturedChildSummary } from "./sections/featured-children-section";
import { CmsProgrammesSection } from "./sections/programmes-section";
import { CmsFeaturedStoriesSection, StorySummary, RecentDonationEntry } from "./sections/featured-stories-section";
import { CmsTestimonialsSection } from "./sections/testimonials-section";
import { CmsFaqSection } from "./sections/faq-section";
import { CmsDonationCtaSection } from "./sections/donation-cta-section";
import { CmsPartnershipCtaSection } from "./sections/partnership-cta-section";
import { CmsContactInfoSection } from "./sections/contact-info-section";

export interface CmsSectionRendererProps {
  section: CmsSection;
  liveStats?: {
    totalRaisedFormatted?: string;
    childrenHelped?: number;
    activeSponsorships?: number;
  };
  childrenData?: FeaturedChildSummary[];
  stories?: StorySummary[];
  recentDonations?: RecentDonationEntry[];
}

export function CmsSectionRenderer({
  section,
  liveStats,
  childrenData,
  stories,
  recentDonations,
}: CmsSectionRendererProps) {
  if (!section.enabled) {
    return null;
  }

  switch (section.type) {
    case "hero":
      return <CmsHeroSection props={section.props as HeroSectionProps} />;
    case "rich_text":
      return <CmsRichTextSection props={section.props as RichTextSectionProps} />;
    case "image_text":
      return <CmsImageTextSection props={section.props as ImageTextSectionProps} />;
    case "card_grid":
      return <CmsCardGridSection props={section.props as CardGridSectionProps} />;
    case "impact_stats":
      return <CmsImpactStatsSection props={section.props as ImpactStatsSectionProps} liveData={liveStats} />;
    case "featured_children":
      return (
        <CmsFeaturedChildrenSection
          props={section.props as FeaturedChildrenSectionProps}
          childrenData={childrenData}
        />
      );
    case "programmes":
      return <CmsProgrammesSection props={section.props as ProgrammesSectionProps} />;
    case "featured_stories":
      return (
        <CmsFeaturedStoriesSection
          props={section.props as FeaturedStoriesSectionProps}
          stories={stories}
          recentDonations={recentDonations}
        />
      );
    case "testimonials":
      return <CmsTestimonialsSection props={section.props as TestimonialsSectionProps} />;
    case "faq":
      return <CmsFaqSection props={section.props as FaqSectionProps} />;
    case "donation_cta":
      return <CmsDonationCtaSection props={section.props as DonationCtaSectionProps} />;
    case "partnership_cta":
      return <CmsPartnershipCtaSection props={section.props as PartnershipCtaSectionProps} />;
    case "contact_info":
      return <CmsContactInfoSection props={section.props as ContactInfoSectionProps} />;
    default:
      return null;
  }
}
