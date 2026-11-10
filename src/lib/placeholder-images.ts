/**
 * Optimized local WebP imagery used across the LivingHope platform.
 * All assets are locally stored in public/images and public/uploads
 * to eliminate third-party CDN latency, privacy leaks, and external dependency risks.
 */
export const PLACEHOLDER_IMAGES = {
  homeHero: "/images/home/hero.webp",
  whatWeDoHero: "/images/programmes/hero.webp",
  sponsorHero: "/images/sponsorship/hero.webp",
  brightenerHero: "/images/sponsorship/brightener-hero.webp",
  donateHero: "/images/donations/hero.webp",
  aboutHero: "/images/about/hero.webp",
  missionSecondary: "/images/about/mission.webp",
  impactBand: "/images/home/impact.webp",
  streetChild: "/images/home/street-child.webp",
  partnershipBanner: "/images/home/partnership-banner.webp",
  teamField: "/images/about/team-field.webp",
  childAvatar: "/images/placeholders/child-avatar.webp",
  fallback: "/images/placeholders/fallback.webp",
} as const;
