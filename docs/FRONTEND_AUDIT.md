# LivingHope Frontend & Content Audit (Phase 2)

**Audit Date:** 2026-11-10  
**Scope:** Complete route-by-route inventory of public-facing pages, sections, text, imagery, layouts, and current administrative controls.

---

## 1. Route-by-Route Content Inventory

### 1.1. Homepage (`/`)
* **File:** `src/app/(public)/page.tsx`
* **Current Data Sources:** `SiteSettings` (hero headline, subheadline, mission), `Story` (carousel), `Donation` (ticker & totals), `Child` (counts).
* **Hardcoded Elements:**
  - Hero background image (`PLACEHOLDER_IMAGES.homeHero`).
  - Mission box secondary gradient styling and button labels ("Make a General Donation", "Sponsor a Street Child").
  - "The Urgency of Our Mission" section headings and narrative paragraphs.
  - "How Your Support Helps" 3-column card grid.
  - "Become a Brightener" partnership card links.
  - CTA Banner ("Every child deserves a chance to learn...").
* **Admin Controls Needed:**
  - Visual Homepage Builder with section reordering, visibility toggling, custom headings, hero image selector, CTA customizer.

### 1.2. About Us (`/about`)
* **File:** `src/app/(public)/about/page.tsx`
* **Current Data Sources:** `ImpactStat`, `HistoryEvent`, `Trustee`, `Donation` (recent donors).
* **Hardcoded Elements:**
  - Hero image and descriptive subtitles.
  - "Who We Are" text block.
  - "Our Vision" block.
  - "Our Guiding Values" array (`VALUES`: Faith, Passion, Diligence, Dependability, Collaboration).
  - CTA Banner copy.
* **Admin Controls Needed:**
  - Page editor for About Us narrative sections, core values list manager, hero copy and image controls.

### 1.3. What We Do (`/what-we-do`)
* **File:** `src/app/(public)/what-we-do/page.tsx`
* **Current Data Sources:** None (100% hardcoded in component).
* **Hardcoded Elements:**
  - Hero title: "We Connect Generous People to Needy Children" and subtitle.
  - "Our Mission in Action" paragraphs and photos.
  - Programmes: School Enrollment & Uniforms, Vocational Carpentry & Skills.
  - Benefits cards & CTA Banner.
* **Admin Controls Needed:**
  - Full CMS Page management with rich text, image-text pairs, and programme card grids.

### 1.4. Become a Brightener (`/become-a-brightener`)
* **File:** `src/app/(public)/become-a-brightener/page.tsx`
* **Current Data Sources:** Partnership inquiry form submission action.
* **Hardcoded Elements:**
  - Hero image and text.
  - "Your Path to Impact" intro narrative.
  - 6 partnership categories from `PARTNERSHIP_TYPES` constant (Individual, Group, Corporate, Church, Will Gift, Volunteer).
* **Admin Controls Needed:**
  - Partnership page copy editor, category card descriptions editor, and CTA banner configuration.

### 1.5. Sponsor a Child (`/sponsor-a-child` & `/sponsor-a-child/[slug]`)
* **Files:** `src/app/(public)/sponsor-a-child/page.tsx`, `src/app/(public)/sponsor-a-child/[slug]/page.tsx`
* **Current Data Sources:** `Child` model, `ChildUpdate` model, `Donation` aggregates.
* **Hardcoded Elements:**
  - 4-step sponsorship process (`STEPS`: Check Available Children, Choose a Child, Select Sponsorship, Stay in Touch).
  - 6 sponsorship benefits bullet points (`BENEFITS`: School fees, Headteacher connection, Termly reports, Video exchanges, Tax deductions).
  - Directory hero copy.
* **Admin Controls Needed:**
  - Sponsorship introduction copy, process steps editor, and sponsorship perks editor while maintaining live database linkage to `Child` profiles.

### 1.6. Legal Pages (`/privacy` & `/terms`)
* **Files:** `src/app/(public)/privacy/page.tsx`, `src/app/(public)/terms/page.tsx`
* **Current Data Sources:** None (static text).
* **Admin Controls Needed:**
  - CMS Rich Text page editor to manage policy updates without redeploying code.

### 1.7. Navigation Header & Footer
* **Files:** `src/components/site/site-header.tsx`, `src/components/site/site-footer.tsx`
* **Current Data Sources:** Header links from hardcoded `NAV_LINKS` constant. Footer links from hardcoded constant; social URLs from `SiteSettings`.
* **Admin Controls Needed:**
  - Centralized Navigation Manager for header menu, footer menu columns, social links, and external/internal link safety.

---

## 2. Identified Deficiencies to Address in Phase 2

1. **No Draft / Publish Workflow:** Any change in `SiteSettings` immediately affected production with no staging or preview capability.
2. **No Reusable Media Library:** Images were uploaded one by one within forms directly to disk/blob without metadata, search, tags, or usage tracking.
3. **No Section Reordering on Homepage:** The order of sections was fixed in TSX.
4. **No Dynamic Page Creation:** Editors could not create new informational pages or campaigns (e.g. `/annual-report-2025` or `/christmas-drive`).
5. **Brand Appearance Hardcoded in CSS:** Colors, fonts, and button radii required code changes.

