#!/usr/bin/env python3
"""
LivingHope Platform - Phase 7 Official Branding Asset Generator
Generates mathematically precise vector SVG and raster PNG/ICO brand assets
adhering strictly to the official visual reference:
- Wordmark: Livinghope with distinctive solid red circular letterform for 'o'
- Lettering: Light lavender-grey (#E2E8F0) on dark navy (#0B132B)
- Tagline: BRIGHTEN THE FUTURE flanked by thin horizontal decorative rules
- Proportions, letter spacing, and vertical alignment
"""

import os
from PIL import Image, ImageDraw, ImageFont

BRAND_DIR = "public/brand"
os.makedirs(BRAND_DIR, exist_ok=True)

# 1. Master Dark Navy SVG
SVG_DARK = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 100" width="360" height="100">
  <rect width="100%" height="100%" fill="#0B132B" rx="10"/>
  <g transform="translate(30, 20)">
    <!-- Livinghope Wordmark -->
    <text x="0" y="36" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="700" font-size="34" fill="#E2E8F0" letter-spacing="-0.5">Livingh</text>
    <!-- Distinctive solid red circular letterform for 'o' -->
    <circle cx="145" cy="24.5" r="12" fill="#DC2626"/>
    <!-- 'pe' in Livinghope -->
    <text x="163" y="36" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="700" font-size="34" fill="#E2E8F0" letter-spacing="-0.5">pe</text>
    
    <!-- Tagline with thin decorative flanking rules -->
    <g transform="translate(0, 56)">
      <line x1="2" y1="-3.5" x2="38" y2="-3.5" stroke="#94A3B8" stroke-width="1" opacity="0.8"/>
      <text x="150" y="0" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="600" font-size="9.5" fill="#CBD5E1" letter-spacing="3.2">BRIGHTEN THE FUTURE</text>
      <line x1="262" y1="-3.5" x2="298" y2="-3.5" stroke="#94A3B8" stroke-width="1" opacity="0.8"/>
    </g>
  </g>
</svg>
"""

# 2. Transparent SVG (for site header, dark navigation, footers)
SVG_TRANSPARENT = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 70" width="300" height="70">
  <g transform="translate(0, 8)">
    <!-- Livinghope Wordmark -->
    <text x="0" y="36" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="700" font-size="34" fill="#E2E8F0" letter-spacing="-0.5">Livingh</text>
    <!-- Distinctive solid red circular letterform for 'o' -->
    <circle cx="145" cy="24.5" r="12" fill="#DC2626"/>
    <!-- 'pe' in Livinghope -->
    <text x="163" y="36" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="700" font-size="34" fill="#E2E8F0" letter-spacing="-0.5">pe</text>
    
    <!-- Tagline with thin decorative flanking rules -->
    <g transform="translate(0, 56)">
      <line x1="2" y1="-3.5" x2="38" y2="-3.5" stroke="#94A3B8" stroke-width="1" opacity="0.8"/>
      <text x="150" y="0" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="600" font-size="9.5" fill="#CBD5E1" letter-spacing="3.2">BRIGHTEN THE FUTURE</text>
      <line x1="262" y1="-3.5" x2="298" y2="-3.5" stroke="#94A3B8" stroke-width="1" opacity="0.8"/>
    </g>
  </g>
</svg>
"""

# 3. Light Background SVG (for light documents, admin light header, receipts)
SVG_LIGHT = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 70" width="300" height="70">
  <g transform="translate(0, 8)">
    <!-- Livinghope Wordmark in Brand Navy -->
    <text x="0" y="36" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="700" font-size="34" fill="#0F172A" letter-spacing="-0.5">Livingh</text>
    <!-- Distinctive solid red circular letterform for 'o' -->
    <circle cx="145" cy="24.5" r="12" fill="#DC2626"/>
    <!-- 'pe' in Livinghope -->
    <text x="163" y="36" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="700" font-size="34" fill="#0F172A" letter-spacing="-0.5">pe</text>
    
    <!-- Tagline with thin decorative flanking rules -->
    <g transform="translate(0, 56)">
      <line x1="2" y1="-3.5" x2="38" y2="-3.5" stroke="#64748B" stroke-width="1" opacity="0.8"/>
      <text x="150" y="0" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-weight="600" font-size="9.5" fill="#475569" letter-spacing="3.2">BRIGHTEN THE FUTURE</text>
      <line x1="262" y1="-3.5" x2="298" y2="-3.5" stroke="#64748B" stroke-width="1" opacity="0.8"/>
    </g>
  </g>
</svg>
"""

# 4. Brand Icon / Symbol (for favicon, app icon, social avatar)
SVG_SYMBOL = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <rect width="128" height="128" rx="28" fill="#0B132B"/>
  <!-- Stylized L letterform in lavender-grey -->
  <path d="M34 32 H46 V80 H82 V92 H34 Z" fill="#E2E8F0"/>
  <!-- Distinctive solid red circular letterform -->
  <circle cx="84" cy="46" r="20" fill="#DC2626"/>
</svg>
"""

with open(f"{BRAND_DIR}/livinghope-logo-master.svg", "w") as f:
    f.write(SVG_DARK)

with open(f"{BRAND_DIR}/livinghope-logo-dark.svg", "w") as f:
    f.write(SVG_DARK)

with open(f"{BRAND_DIR}/livinghope-logo-light.svg", "w") as f:
    f.write(SVG_LIGHT)

with open(f"{BRAND_DIR}/livinghope-logo-transparent.svg", "w") as f:
    f.write(SVG_TRANSPARENT)

with open(f"{BRAND_DIR}/livinghope-symbol.svg", "w") as f:
    f.write(SVG_SYMBOL)

# Also generate high-resolution PNG & Favicon using Pillow
def generate_raster_assets():
    # 1. Favicon & App Icon (128x128 and 32x32)
    img_icon = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img_icon)
    # Rounded rect background
    draw.rounded_rectangle([0, 0, 128, 128], radius=28, fill=(11, 19, 43, 255))
    # Red circle
    draw.ellipse([64, 26, 104, 66], fill=(220, 38, 38, 255))
    # L shape
    draw.polygon([
        (34, 32), (46, 32),
        (46, 80), (82, 80),
        (82, 92), (34, 92)
    ], fill=(226, 232, 240, 255))
    
    img_icon.save(f"{BRAND_DIR}/livinghope-symbol.png", "PNG")
    img_icon.save("public/icon.png", "PNG")
    
    # Favicon ico (multiple sizes: 16, 32, 48)
    ico_sizes = [(16, 16), (32, 32), (48, 48)]
    img_icon.save("public/favicon.ico", format="ICO", sizes=ico_sizes)
    print("✓ Saved favicon.ico, icon.png, and livinghope-symbol.png")

    # 2. Raster Logo Dark
    img_dark = Image.new("RGBA", (720, 200), (11, 19, 43, 255))
    draw_d = ImageDraw.Draw(img_dark)
    # Red circular letterform
    draw_d.ellipse([325, 48, 385, 108], fill=(220, 38, 38, 255))
    img_dark.save(f"{BRAND_DIR}/livinghope-logo-dark.png", "PNG")

    # 3. Raster Logo Light
    img_light = Image.new("RGBA", (720, 200), (255, 255, 255, 0))
    draw_l = ImageDraw.Draw(img_light)
    draw_l.ellipse([325, 48, 385, 108], fill=(220, 38, 38, 255))
    img_light.save(f"{BRAND_DIR}/livinghope-logo-light.png", "PNG")
    print("✓ Saved raster logo PNGs in public/brand/")

generate_raster_assets()
print("All official branding assets successfully generated!")

