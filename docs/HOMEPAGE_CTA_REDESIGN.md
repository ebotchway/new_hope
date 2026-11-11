# Homepage Promotional CTA Redesign & Layout Coordination

**LivingHope Charity Management Platform**  
**Component:** `PartnershipCtaSection` & `DonationCtaSection`  
**Page Integration:** `src/app/(public)/page.tsx`  

---

## 1. Problem Statement

Prior to Phase 8, the homepage featured two prominent conversion calls-to-action:
1. **Become a Brightener Partner CTA:** Encouraging corporate, church, and community partners to join the Brightener Network.
2. **Make a Donation CTA:** Encouraging recurring and one-off donor contributions.

### Defects Identified:
- **Vertical Stacking & Dead Space:** Both sections were rendered as full-width rectangular banners stacked directly on top of each other. This created a visual logjam where users encountered two massive conflicting conversion banners sequentially.
- **Incoherent Visual Identity:** One section used dark navy while the other used light gray with disparate paddings, fonts, and button sizes.
- **Excessive Spacing:** The stacked layout consumed over 1200px of vertical viewport height, requiring excessive scrolling to reach the footer.

---

## 2. Coordinated Two-Column Layout Architecture

### 2.1 Side-by-Side Coordinated Grid
In `src/app/(public)/page.tsx`, we introduced intelligent section pairing:
```tsx
{/* When both Partnership CTA and Donation CTA are active, render as a coordinated 2-column grid */}
{hasBothCtas ? (
  <section className="py-12 bg-muted/20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-2 items-stretch">
        <CmsPartnershipCtaSection props={partnershipProps} isCardMode={true} />
        <CmsDonationCtaSection props={donationProps} isCardMode={true} />
      </div>
    </div>
  </section>
) : (
  // Fallback to standalone rendering if only one section is enabled
  ...
)}
```

### 2.2 Card 1: Become a Brightener Partner (`src/components/cms/sections/partnership-cta-section.tsx`)
- **Theme:** High-contrast LivingHope Deep Navy (`#0B132B`) with subtle radial illumination.
- **Badge:** Gold pill (`bg-amber-400/20 text-amber-300`) with Sparkles icon: *"Partner Network"*.
- **Copy:** Focused on collective impact, corporate sponsorships, and faith community engagement.
- **Perks Checklist:** Compact 3-point bullet grid (Zero administration overhead, Real-time impact reporting, Dedicated liaison).
- **Action:** Full-width 48px CTA button routing directly to `/become-a-brightener`.

### 2.3 Card 2: Support Our Mission / Make a Donation (`src/components/cms/sections/donation-cta-section.tsx`)
- **Theme:** Rich Emerald gradient (`from-emerald-900 to-teal-950`) representing growth, hope, and direct financial stewardship.
- **Badge:** Emerald pill (`bg-emerald-400/20 text-emerald-300`) with HeartHandshake icon: *"Direct Giving"*.
- **Interactive Amount Quick-Select:** Preset donation amounts ($25, $50, $100, $250) displayed as interactive pill buttons that link to `/donate?amount=X`.
- **Transparency Tag:** Highlighting Mobile Money (MoMo), Stripe, card processing, and 100% direct-to-programme allocation.
- **Action:** Full-width 48px CTA button routing to `/donate`.

---

## 3. Responsive Behavior

| Breakpoint | Layout Mode | Spacing Between Cards | Visual Balance |
|---|---|---|---|
| **Desktop (≥ 1024px)** | 2-column grid (`lg:grid-cols-2`) | 24px gap | Equal heights (`items-stretch`), high visual symmetry |
| **Tablet (768px – 1023px)** | Stacked cards | 24px gap | Full-width cards with comfortable padding |
| **Mobile (< 768px)** | Stacked single-column | 16px gap | Compact 24px internal padding, touch-friendly 48px buttons |

---

## 4. Verification

- Verified in Playwright browser snapshots:
  - Desktop: `docs/screenshots/desktop/home.png`
  - Tablet: `docs/screenshots/tablet/home.png`
  - Mobile: `docs/screenshots/mobile/home.png`
- Button click-through destinations tested and routing properly to `/become-a-brightener` and `/donate`.
