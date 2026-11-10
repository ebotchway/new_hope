# LivingHope Content Management Matrix (Phase 2)

**Generated:** 2026-11-10  
**Scope:** Complete structural matrix mapping public-facing pages, sections, content blocks, data sources, editability, and administrative permissions.

---

## 1. Public Content Matrix

| Page Route | Section / Component | Current Source | CMS Target Model / Block | Editable Fields | Required Admin Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`/` (Homepage)** | Hero | `SiteSettings` + Hardcoded | `CmsRevision.sections` (`hero`) | Headline, Subtitle, Background Image URL, Primary CTA (label, URL), Secondary CTA (label, URL), Badge Text | `ADMIN` or `SUPERADMIN` |
| | Mission Statement | `SiteSettings.missionStatement` | `CmsRevision.sections` (`rich_text`) | Title, Body Markdown/HTML-safe text, Accent Box | `ADMIN` or `SUPERADMIN` |
| | Impact Statistics | `ImpactStat` table | `CmsRevision.sections` (`impact_stats`) | Title, Subtitle, Auto-calculate or Custom Stats toggle, Manual Stat items | `ADMIN` or `SUPERADMIN` |
| | Urgent Need / Narrative | Hardcoded in TSX | `CmsRevision.sections` (`image_text`) | Headline, Narrative text, Image URL, Image position, Bullet list | `ADMIN` or `SUPERADMIN` |
| | How Support Helps | Hardcoded in TSX | `CmsRevision.sections` (`card_grid`) | Section Title, Subtitle, Cards (icon, title, description, link) | `ADMIN` or `SUPERADMIN` |
| | Featured Children | `Child` table (active/unsponsored) | `CmsRevision.sections` (`featured_children`) | Section Title, Subtitle, Display Count, Specific Child IDs picker or auto-select | `ADMIN` or `SUPERADMIN` |
| | Featured Stories / Impact | `Story` table | `CmsRevision.sections` (`featured_stories`) | Section Title, Story selection (manual or latest 3), Layout mode | `ADMIN` or `SUPERADMIN` |
| | Testimonials | Hardcoded | `CmsRevision.sections` (`testimonials`) | Section Title, Testimonials list (quote, author, role, avatar, rating) | `ADMIN` or `SUPERADMIN` |
| | Call to Action Banner | Hardcoded in TSX | `CmsRevision.sections` (`donation_cta`) | Headline, Subheading, Button text, Preset amounts, Background tone | `ADMIN` or `SUPERADMIN` |
| **`/about`** | Hero Banner | Hardcoded in TSX | `CmsPage` (`about`) -> `hero` section | Title, Subtitle, Hero Image, Breadcrumbs | `ADMIN` or `SUPERADMIN` |
| | Who We Are / Vision | Hardcoded in TSX | `CmsPage` (`about`) -> `image_text` | Section Title, Lead text, Image URL, Paragraphs | `ADMIN` or `SUPERADMIN` |
| | Guiding Values | Hardcoded constant | `CmsPage` (`about`) -> `card_grid` | Value cards (Faith, Passion, Diligence, Dependability, Collaboration) | `ADMIN` or `SUPERADMIN` |
| | Milestone Timeline | `HistoryEvent` table | `CmsPage` (`about`) -> `HistoryEvent` integration | Integrated via History Event manager + section header | `ADMIN` or `SUPERADMIN` |
| | Leadership / Trustees | `Trustee` table | `CmsPage` (`about`) -> `Trustee` integration | Integrated via Trustees manager + section header | `ADMIN` or `SUPERADMIN` |
| **`/what-we-do`** | Hero Banner | Hardcoded in TSX | `CmsPage` (`what-we-do`) -> `hero` | Headline, Subtitle, Background Image | `ADMIN` or `SUPERADMIN` |
| | Core Programmes | Hardcoded in TSX | `CmsPage` (`what-we-do`) -> `programmes` | Programme Cards (title, category, description, image, stats) | `ADMIN` or `SUPERADMIN` |
| | Vocational Training & Skills | Hardcoded in TSX | `CmsPage` (`what-we-do`) -> `image_text` | Headline, Description, Gallery images, Outcome metrics | `ADMIN` or `SUPERADMIN` |
| **`/become-a-brightener`** | Hero & Introduction | Hardcoded in TSX | `CmsPage` (`become-a-brightener`) -> `hero` | Headline, Subtitle, Impact Summary | `ADMIN` or `SUPERADMIN` |
| | Partnership Categories | Hardcoded in TSX | `CmsPage` (`become-a-brightener`) -> `card_grid` | 6 categories (Individual, Group, Corporate, Church, Will, Volunteer) | `ADMIN` or `SUPERADMIN` |
| | Inquiry Form | `Inquiry` table | Form component with CMS-managed heading | Form Title, Intro text, Success message | `ADMIN` or `SUPERADMIN` |
| **`/sponsor-a-child`** | Sponsorship Hero & Steps | Hardcoded in TSX | `CmsPage` (`sponsor-a-child`) -> `hero` & `card_grid` | Headline, 4 Process Steps, FAQs, Perks/Benefits | `ADMIN` or `SUPERADMIN` |
| | Available Children Directory | `Child` table (operational) | Dynamic database query | Filter controls, Child cards, Live sponsorship status | System Operational (`CHILD_VIEW`) |
| **`/privacy` & `/terms`** | Legal Policies | Hardcoded in TSX | `CmsPage` (`privacy`, `terms`) -> `rich_text` | Full legal copy, Revision Date, Contact email | `ADMIN` or `SUPERADMIN` |
| **Global Navigation** | Header Menu | Hardcoded constant | `CmsNavItem` (`HEADER`) | Label, URL, Sort Order, Open in New Tab, Nested submenu | `ADMIN` or `SUPERADMIN` |
| **Global Footer** | Footer Columns & Links | Hardcoded constant | `CmsNavItem` (`FOOTER_COL1`, `FOOTER_COL2`, etc.) | Column Title, Links (label, url, sort order) | `ADMIN` or `SUPERADMIN` |
| **Global Branding** | Colors, Logo, Fonts | CSS classes & `SiteSettings` | `CmsAppearance` | Primary/Secondary colors, Font family, Logo URL, Dark Logo URL | `ADMIN` or `SUPERADMIN` |

---

## 2. Section Registry Definition

The LivingHope CMS employs a structured, schema-validated JSON section registry:

| Type Key | Name | Primary Props |
| :--- | :--- | :--- |
| `hero` | Hero Banner | `badge`, `title`, `subtitle`, `imageUrl`, `primaryCta`, `secondaryCta`, `alignment` |
| `rich_text` | Rich Narrative | `heading`, `subheading`, `contentHtml`, `containerWidth`, `backgroundColor` |
| `image_text` | Split Image & Text | `heading`, `lead`, `paragraphs`, `imageUrl`, `imageAlt`, `imagePosition` (left/right), `bulletPoints`, `cta` |
| `card_grid` | Feature / Category Grid | `heading`, `subheading`, `columns` (2, 3, 4), `cards` [{ title, description, icon, imageUrl, link }] |
| `impact_stats` | Metric Counter Grid | `heading`, `subheading`, `useLiveDatabase` (boolean), `customStats` [{ value, label, prefix, suffix }] |
| `featured_children` | Children Showcase | `heading`, `subheading`, `mode` (`auto_urgent` \| `manual`), `childIds` [], `maxCount` |
| `programmes` | Programmes Grid | `heading`, `subheading`, `programmes` [{ title, category, description, imageUrl, metrics }] |
| `featured_stories` | Impact Stories Carousel | `heading`, `subheading`, `storyIds` [], `showRecentDonors` (boolean) |
| `testimonials` | Supporter Voices | `heading`, `subheading`, `testimonials` [{ quote, author, role, avatarUrl, rating }] |
| `faq` | Accordion FAQs | `heading`, `subheading`, `items` [{ question, answer }] |
| `donation_cta` | Donation Banner | `heading`, `subheading`, `presetAmounts` [number], `defaultFrequency`, `primaryCtaLabel`, `accentColor` |
| `partnership_cta` | Partnership Callout | `heading`, `subheading`, `buttonLabel`, `buttonUrl`, `backgroundImageUrl` |
| `contact_info` | Contact Block | `heading`, `address`, `phone`, `email`, `hours`, `mapEmbedUrl` |

---

## 3. Governance and Security Rules

1. **System Reserved Slugs:** The following slugs are immutable system routes and cannot be usurped by CMS page creation:
   - `/admin`, `/admin/*`
   - `/api`, `/api/*`
   - `/account`, `/account/*`
   - `/login`, `/signup`, `/forgot-password`, `/reset-password`
   - `/donate`, `/donate/*`
   - `/preview`
2. **Sanitization:** Content stored in `rich_text` or section configurations is validated with strict Zod schemas. Disallowed tags (`<script>`, `<iframe>` unless explicitly whitelisted for map embed, `<object>`, `<embed>`, inline event handlers `onclick`, etc.) are stripped or rejected.
3. **Draft Separation:** Changes to drafts are isolated in `CmsRevision`. Public routes strictly query the revision referenced by `CmsPage.publishedRevisionId`.
4. **Graceful Fallbacks:** If a CMS page or section has no published revision or is deleted, the public frontend automatically renders the default hardcoded components and `SiteSettings` without throwing runtime errors or blank pages.

