# Official LivingHope Branding & Visual Identity Specification

## 1. Overview & Brand Archetype

LivingHope operates as a faith-inspired child welfare and educational foundation headquartered in Accra, Ghana. The visual brand conveys institutional warmth, unflinching integrity, and vibrant hope for street-connected children.

The official brand identity was reconstructed and codified based on master brand assets:
- **Brand Typography:** Balanced humanistic sans-serif wordmark: `Livinghope`.
- **Distinctive Core Iconography:** The lower-case letterform `o` in `Livinghope` is rendered as a vibrant, solid crimson circle (`#DC2626`), symbolizing a radiant focal light or rising dawn over vulnerable children.
- **Tagline:** `—— BRIGHTEN THE FUTURE ——` set in uppercase tracking with flanking horizontal decorative hairline rules.
- **Brand Palette:**
  - **Navy Primary (`#0B132B`):** Deep, dignified maritime navy delivering solid institutional trust and contrast.
  - **Crimson Red (`#DC2626`):** Vibrant accent mark symbolizing passion, urgency, and life.
  - **Soft Grey / Light Slate (`#E2E8F0` / `#FFFFFF`):** High-legibility letterforms and icons for dark-mode and dark navy hero surfaces.
  - **Gold Accent (`#D97706` / `#F59E0B`):** Warm solar accent representing youth potential and empowerment.

---

## 2. Generated Vector & Raster Asset Manifest

Master brand assets were procedurally generated at high precision using `scripts/generate_official_brand_assets.py` and are persistently stored in the repository:

| Asset Path | Format | Dimensions | Purpose |
| :--- | :--- | :--- | :--- |
| `public/brand/livinghope-logo-master.svg` | SVG (Vector) | 480x120 | Master brand mark on dark navy container with tagline rules |
| `public/brand/livinghope-logo-dark.svg` | SVG (Vector) | 480x120 | Dark navy background variant for light mode page headers |
| `public/brand/livinghope-logo-light.svg` | SVG (Vector) | 480x120 | Transparent light lettering for dark surfaces and footer |
| `public/brand/livinghope-logo-transparent.svg`| SVG (Vector) | 480x120 | High-contrast version for custom overlays |
| `public/brand/livinghope-symbol.svg` | SVG (Vector) | 128x128 | Standalone icon mark with the distinctive red circular letterform |
| `public/brand/livinghope-symbol.png` | PNG (Raster) | 512x512 | High-resolution square app icon |
| `public/brand/livinghope-logo-dark.png` | PNG (Raster) | 960x240 | High-DPI raster wordmark for email templates & social previews |
| `public/brand/livinghope-logo-light.png` | PNG (Raster) | 960x240 | High-DPI light raster wordmark |
| `public/favicon.ico` | ICO | 48x48 | Browser tab favicon with official symbol mark |
| `public/icon.png` | PNG | 512x512 | Next.js App Router root app icon |

---

## 3. Implementation in Code

The vector mark was directly integrated into `src/components/site/logo.tsx` with full support for light and dark modes:
- Scalable SVG with crisp geometric boundaries at all resolutions.
- Correct text anchoring and alignment between `Livingh`, the red circle `o`, and `pe`.
- Tagline "BRIGHTEN THE FUTURE" flanked by precision vector line dividers (`strokeWidth="1.2"`).
- Applied throughout `SiteHeader`, `SiteFooter`, and Administrative side navigation.
