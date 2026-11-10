/**
 * LivingHope CMS Types & Section Registry Interfaces
 */

export type CmsSectionType =
  | "hero"
  | "rich_text"
  | "image_text"
  | "card_grid"
  | "impact_stats"
  | "featured_children"
  | "programmes"
  | "featured_stories"
  | "testimonials"
  | "faq"
  | "donation_cta"
  | "partnership_cta"
  | "contact_info";

export interface CmsCtaLink {
  label: string;
  href: string;
}

export interface HeroSectionProps {
  badge?: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
  primaryCta?: CmsCtaLink;
  secondaryCta?: CmsCtaLink;
  alignment?: "center" | "left";
}

export interface RichTextSectionProps {
  heading?: string;
  subheading?: string;
  content: string;
  containerWidth?: "narrow" | "default" | "wide";
  backgroundColor?: "white" | "muted" | "brand";
}

export interface ImageTextSectionProps {
  heading: string;
  lead?: string;
  paragraphs: string[];
  imageUrl: string;
  imageAlt: string;
  imagePosition: "left" | "right";
  bulletPoints?: string[];
  cta?: CmsCtaLink;
}

export interface CardGridItem {
  title: string;
  description: string;
  icon?: string;
  imageUrl?: string;
  link?: CmsCtaLink;
}

export interface CardGridSectionProps {
  heading: string;
  subheading?: string;
  columns: 2 | 3 | 4;
  cards: CardGridItem[];
}

export interface CustomStatItem {
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
}

export interface ImpactStatsSectionProps {
  heading: string;
  subheading?: string;
  useLiveDatabase: boolean;
  customStats?: CustomStatItem[];
}

export interface FeaturedChildrenSectionProps {
  heading: string;
  subheading?: string;
  mode: "auto_urgent" | "manual";
  childIds?: string[];
  maxCount: number;
}

export interface ProgrammeItem {
  title: string;
  category: string;
  description: string;
  imageUrl?: string;
  metrics?: string;
}

export interface ProgrammesSectionProps {
  heading: string;
  subheading?: string;
  programmes: ProgrammeItem[];
}

export interface FeaturedStoriesSectionProps {
  heading: string;
  subheading?: string;
  storyIds?: string[];
  showRecentDonors?: boolean;
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role?: string;
  avatarUrl?: string;
  rating?: number;
}

export interface TestimonialsSectionProps {
  heading: string;
  subheading?: string;
  testimonials: TestimonialItem[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqSectionProps {
  heading: string;
  subheading?: string;
  items: FaqItem[];
}

export interface DonationCtaSectionProps {
  heading: string;
  subheading?: string;
  presetAmounts?: number[];
  primaryCtaLabel?: string;
  accentColor?: string;
}

export interface PartnershipCtaSectionProps {
  heading: string;
  subheading?: string;
  buttonLabel: string;
  buttonUrl: string;
  backgroundImageUrl?: string;
}

export interface ContactInfoSectionProps {
  heading: string;
  subheading?: string;
  address?: string;
  phone?: string;
  email?: string;
  hours?: string;
  mapEmbedUrl?: string;
}

export type CmsSectionPropsMap = {
  hero: HeroSectionProps;
  rich_text: RichTextSectionProps;
  image_text: ImageTextSectionProps;
  card_grid: CardGridSectionProps;
  impact_stats: ImpactStatsSectionProps;
  featured_children: FeaturedChildrenSectionProps;
  programmes: ProgrammesSectionProps;
  featured_stories: FeaturedStoriesSectionProps;
  testimonials: TestimonialsSectionProps;
  faq: FaqSectionProps;
  donation_cta: DonationCtaSectionProps;
  partnership_cta: PartnershipCtaSectionProps;
  contact_info: ContactInfoSectionProps;
};

export interface CmsSection<K extends CmsSectionType = CmsSectionType> {
  id: string;
  type: K;
  enabled: boolean;
  props: CmsSectionPropsMap[K];
}

export interface CmsPageData {
  id: string;
  slug: string;
  title: string;
  publicTitle?: string | null;
  description?: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedRevisionId?: string | null;
  isSystem: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImageUrl?: string | null;
  canonicalUrl?: string | null;
  noIndex: boolean;
  publishedAt?: Date | string | null;
  sections: CmsSection[];
  revisionNumber?: number;
}

