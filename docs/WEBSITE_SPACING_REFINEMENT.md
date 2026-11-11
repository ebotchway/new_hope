# Website Spacing Refinement & Whitespace Normalization

## 1. Problem Statement

Previous implementation phases introduced oversized vertical paddings (`py-16 sm:py-24` and `min-h-140` heroes). In browser viewports:
- Hero sections consumed over 560px vertically before any body content or call to action became visible.
- Section gaps between cards and content bands exceeded 96px top and bottom, producing an empty, disconnected impression across high-resolution desktop and mobile viewports.
- Header and footer padding dominated the viewport, squeezing valuable narrative space.

---

## 2. Global Spacing Audit & Target Ratios

Modern responsive editorial standards establish that:
- Section padding should provide comfortable breathing room without starving the viewport:
  - Mobile (375px–640px): `py-8` (32px) or `py-10` (40px)
  - Desktop (1024px+): `py-10` (40px) or `py-12` (48px)
- Hero heights should remain bounded between 256px (`min-h-64`) and 336px (`min-h-84`), keeping main headlines and call-to-action buttons above the fold.
- Card gaps should range between 16px (`gap-4`) and 24px (`gap-6`).

---

## 3. Implemented Spacing Remediations

The following component-level updates were implemented across `src/components`:

| Component / Template | Original Classes | Refined Classes | Viewport Impact |
| :--- | :--- | :--- | :--- |
| `src/components/site/site-header.tsx` | `pt-5 pb-1.5 py-4.5` | `pt-2.5 pb-1 px-4` | 40% reduction in header vertical footprint |
| `src/components/site/page-hero.tsx` | `min-h-140 py-24` | `min-h-64 sm:min-h-84 py-12 sm:py-16` | Headline and breadcrumbs immediately visible |
| `src/components/cms/sections/hero-section.tsx` | `min-h-165 py-24 sm:py-32` | `min-h-80 sm:min-h-108 py-12 sm:py-16` | Hero CTA is comfortably above the desktop fold |
| `src/components/cms/sections/image-text-section.tsx`| `py-16 sm:py-24` | `py-8 sm:py-12` | 50% tighter transition into next narrative block |
| `src/components/cms/sections/card-grid-section.tsx` | `py-16 sm:py-24 gap-8` | `py-8 sm:py-12 gap-5 sm:gap-6` | Cards fit seamlessly into view without disjointed gaps |
| `src/components/cms/sections/featured-children-section.tsx` | `py-16 sm:py-24` | `py-8 sm:py-12` | Children sponsorship cards display prominently |
| `src/components/cms/sections/featured-stories-section.tsx` | `py-16 sm:py-24` | `py-8 sm:py-12` | Immediate visibility of impact narratives |
| `src/components/cms/sections/impact-stats-section.tsx` | `py-16 sm:py-24 mb-12` | `py-8 sm:py-12 mb-6` | Clean impact metric strip with zero excessive whitespace |
| `src/components/cms/sections/programmes-section.tsx` | `py-16 sm:py-24` | `py-8 sm:py-12` | Programme offerings grouped cohesively |
| `src/components/cms/sections/rich-text-section.tsx` | `py-16 sm:py-24` | `py-6 sm:py-8` | Mission statement legible and connected |
| `src/components/cms/sections/partnership-cta-section.tsx` | `py-16 sm:py-20` | `py-6 sm:py-8` | Compact conversion banner |
| `src/components/cms/sections/donation-cta-section.tsx` | `py-16 sm:py-24` | `py-8 sm:py-12` | Prompt, clear giving invitation |
| `src/components/site/cta-banner.tsx` | `py-20 sm:py-28` | `py-8 sm:py-12` | Seamless closure before footer |
| `src/components/site/site-footer.tsx` | `mt-28 py-18` | `mt-12 sm:mt-16 py-10 sm:py-12` | Balanced, informative closing footer |
| `src/app/(public)/sponsor-a-child/page.tsx` | `py-24` | `py-8 sm:py-12` | Quick access to sponsorship search filters |
| `src/app/(public)/donate/page.tsx` | `py-16 sm:py-24` | `py-8 sm:py-12` | Donation form visible on standard laptops |

---

## 4. Verification

All updated pages were compiled, rendered in headless Chromium via Playwright, and verified at Desktop (1440px), Tablet (768px), and Mobile (375px) breakpoints. The resulting layouts show balanced density, optimal hierarchy, and zero visual collision.
