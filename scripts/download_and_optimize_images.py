#!/usr/bin/env python3
"""
LivingHope Platform - Phase 6 Image Downloader & WebP Optimizer
Downloads authentic, high-resolution imagery and generates responsive WebP assets
with correct metadata for CMS and public pages.
"""

import os
import sys
import urllib.request
from PIL import Image
import io

ASSETS = [
    # 1. Home
    {
        "url": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=85&w=1600&auto=format&fit=crop",
        "dest": "public/images/home/hero.webp",
        "size": (1600, 900),
        "alt": "Smiling school children in Ghana engaged in classroom learning",
        "caption": "LivingHope education programme in Greater Accra",
        "folder": "home"
    },
    {
        "url": "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=85&w=1200&auto=format&fit=crop",
        "dest": "public/images/home/street-child.webp",
        "size": (1200, 900),
        "alt": "Street-connected child looking toward a brighter future through LivingHope intervention",
        "caption": "Street outreach and rescue initiative",
        "folder": "home"
    },
    {
        "url": "https://images.unsplash.com/photo-1526976668912-1a811878dd37?q=85&w=1600&auto=format&fit=crop",
        "dest": "public/images/home/partnership-banner.webp",
        "size": (1600, 800),
        "alt": "Community partnership and collective action supporting vulnerable youth",
        "caption": "Join hands with LivingHope as a Brightener partner",
        "folder": "partnerships"
    },
    {
        "url": "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=85&w=1200&auto=format&fit=crop",
        "dest": "public/images/home/impact.webp",
        "size": (1200, 800),
        "alt": "LivingHope community gathering celebrating educational milestones",
        "caption": "Real, measurable outcomes across 12 communities",
        "folder": "home"
    },

    # 2. About
    {
        "url": "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=85&w=1600&auto=format&fit=crop",
        "dest": "public/images/about/hero.webp",
        "size": (1600, 900),
        "alt": "LivingHope dedicated staff and social workers in Accra",
        "caption": "Our leadership and fieldwork team",
        "folder": "about"
    },
    {
        "url": "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=85&w=1200&auto=format&fit=crop",
        "dest": "public/images/about/team-field.webp",
        "size": (1200, 900),
        "alt": "LivingHope certified teacher working with children in classroom",
        "caption": "Direct mentorship and educational rehabilitation",
        "folder": "about"
    },
    {
        "url": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=85&w=1200&auto=format&fit=crop",
        "dest": "public/images/about/mission.webp",
        "size": (1200, 800),
        "alt": "School library and reading resources provided by LivingHope",
        "caption": "Educational foundation for sustainable transformation",
        "folder": "about"
    },

    # 3. Programmes
    {
        "url": "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=85&w=1600&auto=format&fit=crop",
        "dest": "public/images/programmes/hero.webp",
        "size": (1600, 900),
        "alt": "Children in school classroom reading books with enthusiasm",
        "caption": "LivingHope holistic support pathways",
        "folder": "programmes"
    },
    {
        "url": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=85&w=800&auto=format&fit=crop",
        "dest": "public/images/programmes/education.webp",
        "size": (800, 500),
        "alt": "Young student carrying school supplies ready to learn",
        "caption": "Formal School Enrollment and Remedial Tutoring",
        "folder": "programmes"
    },
    {
        "url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=85&w=800&auto=format&fit=crop",
        "dest": "public/images/programmes/vocational.webp",
        "size": (800, 500),
        "alt": "Youth learning technical craftsmanship and vocational trades",
        "caption": "Vocational Skills & Apprenticeships for older youth",
        "folder": "programmes"
    },
    {
        "url": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=85&w=800&auto=format&fit=crop",
        "dest": "public/images/programmes/outreach.webp",
        "size": (800, 500),
        "alt": "Field team meeting street-connected children in urban market",
        "caption": "Street Outreach and First Contact Rescue",
        "folder": "programmes"
    },
    {
        "url": "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=85&w=800&auto=format&fit=crop",
        "dest": "public/images/programmes/health.webp",
        "size": (800, 500),
        "alt": "Child receiving nutritious meal and regular health checkup",
        "caption": "Nutrition, Mental Wellness & Medical Healthcare",
        "folder": "programmes"
    },

    # 4. Sponsorship
    {
        "url": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=85&w=1600&auto=format&fit=crop",
        "dest": "public/images/sponsorship/hero.webp",
        "size": (1600, 900),
        "alt": "Child smiling warmly with hope for educational sponsorship",
        "caption": "Sponsor a Child in Ghana today",
        "folder": "sponsorship"
    },
    {
        "url": "https://images.unsplash.com/photo-1524578271613-d550eacf6090?q=85&w=1600&auto=format&fit=crop",
        "dest": "public/images/sponsorship/brightener-hero.webp",
        "size": (1600, 900),
        "alt": "Vibrant Ghanaian youth thriving in safe community environment",
        "caption": "Become a Brightener partner",
        "folder": "sponsorship"
    },

    # 5. Donations
    {
        "url": "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=85&w=1600&auto=format&fit=crop",
        "dest": "public/images/donations/hero.webp",
        "size": (1600, 900),
        "alt": "Hands giving and receiving support with gratitude",
        "caption": "Your donation directly transforms lives",
        "folder": "donations"
    },
    {
        "url": "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=85&w=1200&auto=format&fit=crop",
        "dest": "public/images/donations/impact.webp",
        "size": (1200, 800),
        "alt": "Community partnership impact meeting",
        "caption": "100% transparent and accountable financial stewardship",
        "folder": "donations"
    },

    # 6. Partnerships
    {
        "url": "https://images.unsplash.com/photo-1526976668912-1a811878dd37?q=85&w=1600&auto=format&fit=crop",
        "dest": "public/images/partnerships/hero.webp",
        "size": (1600, 900),
        "alt": "Diverse partners joining together for child welfare in Ghana",
        "caption": "Corporate, church, and foundational partnerships",
        "folder": "partnerships"
    },
    {
        "url": "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=85&w=1200&auto=format&fit=crop",
        "dest": "public/images/partnerships/collaboration.webp",
        "size": (1200, 800),
        "alt": "Collaborative planning session between NGO staff and community leaders",
        "caption": "Sustainable community-led development",
        "folder": "partnerships"
    },

    # 7. Beneficiary Portraits (Respectful, dignified, high quality)
    {
        "url": "https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=85&w=800&auto=format&fit=crop",
        "dest": "public/uploads/children/amara.webp",
        "size": (640, 800), # 4:5 aspect ratio
        "alt": "Amara Mensah - 8 years old primary school student in Accra",
        "caption": "Amara loves reading, drawing, and aspires to become a nurse",
        "folder": "children"
    },
    {
        "url": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=85&w=800&auto=format&fit=crop",
        "dest": "public/uploads/children/kwame.webp",
        "size": (640, 800), # 4:5 aspect ratio
        "alt": "Kwame Asante - 12 years old junior secondary student in Kumasi",
        "caption": "Kwame excels in mathematics and wants to study civil engineering",
        "folder": "children"
    },
    {
        "url": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=85&w=800&auto=format&fit=crop",
        "dest": "public/uploads/children/efua.webp",
        "size": (640, 800), # 4:5 aspect ratio
        "alt": "Efua Osei - 6 years old kindergarten student in Tamale",
        "caption": "Efua is full of energy, loves singing, and is learning to read",
        "folder": "children"
    },

    # 8. Placeholders & fallbacks
    {
        "url": "https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=85&w=400&auto=format&fit=crop",
        "dest": "public/images/placeholders/child-avatar.webp",
        "size": (400, 400),
        "alt": "Child avatar placeholder",
        "caption": "Beneficiary profile placeholder",
        "folder": "placeholders"
    },
    {
        "url": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=85&w=800&auto=format&fit=crop",
        "dest": "public/images/placeholders/fallback.webp",
        "size": (800, 600),
        "alt": "LivingHope platform fallback image",
        "caption": "Educational resources",
        "folder": "placeholders"
    },

    # 9. Direct placeholders matching cms-defaults paths
    {
        "url": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=85&w=1600&auto=format&fit=crop",
        "dest": "public/images/placeholders/home-hero.webp",
        "size": (1600, 900),
        "alt": "LivingHope Ghana Home Hero",
        "caption": "Transforming lives through love and education",
        "folder": "placeholders"
    },
    {
        "url": "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=85&w=1200&auto=format&fit=crop",
        "dest": "public/images/placeholders/street-child.webp",
        "size": (1200, 900),
        "alt": "Street child outreach",
        "caption": "Rescue and educational rehabilitation",
        "folder": "placeholders"
    },
    {
        "url": "https://images.unsplash.com/photo-1526976668912-1a811878dd37?q=85&w=1600&auto=format&fit=crop",
        "dest": "public/images/placeholders/partnership-banner.webp",
        "size": (1600, 800),
        "alt": "Partnership banner",
        "caption": "Become a Brightener partner",
        "folder": "placeholders"
    },
    {
        "url": "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=85&w=1600&auto=format&fit=crop",
        "dest": "public/images/placeholders/about-hero.webp",
        "size": (1600, 900),
        "alt": "About LivingHope Ghana",
        "caption": "Founded on faith and integrity",
        "folder": "placeholders"
    },
    {
        "url": "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=85&w=1200&auto=format&fit=crop",
        "dest": "public/images/placeholders/team-field.webp",
        "size": (1200, 900),
        "alt": "LivingHope field team",
        "caption": "Passionate social workers and educators",
        "folder": "placeholders"
    },
    {
        "url": "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=85&w=1600&auto=format&fit=crop",
        "dest": "public/images/placeholders/what-we-do-hero.webp",
        "size": (1600, 900),
        "alt": "What We Do hero",
        "caption": "Connecting generous people to needy children",
        "folder": "placeholders"
    },
]

def main():
    print(f"Starting download and optimization of {len(ASSETS)} media assets...")
    results = []

    for item in ASSETS:
        dest_path = item["dest"]
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        print(f"Downloading: {item['url'][:60]}... -> {dest_path}")
        
        req = urllib.request.Request(
            item["url"],
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        )
        
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = resp.read()
            
            raw_size = len(data)
            img = Image.open(io.BytesIO(data))
            orig_w, orig_h = img.size
            
            # Convert to RGB (in case of RGBA/palette)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            
            # Resize with aspect ratio preserved (cover/crop to target size)
            target_w, target_h = item["size"]
            target_ratio = target_w / target_h
            orig_ratio = orig_w / orig_h
            
            if orig_ratio > target_ratio:
                # Original is wider than target: fit to target_h, crop sides
                new_h = target_h
                new_w = int(orig_w * (target_h / orig_h))
            else:
                # Original is taller than target: fit to target_w, crop top/bottom
                new_w = target_w
                new_h = int(orig_h * (target_w / orig_w))
            
            resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            
            # Center crop to exact target_w, target_h
            left = (new_w - target_w) // 2
            top = (new_h - target_h) // 2
            cropped = resized.crop((left, top, left + target_w, top + target_h))
            
            # Save as optimized WebP
            cropped.save(dest_path, "WEBP", quality=82, method=6)
            final_size = os.path.getsize(dest_path)
            
            # Also copy to uploads/cms/ for CMS media library availability
            cms_dest = os.path.join("public/uploads/cms", os.path.basename(dest_path))
            cropped.save(cms_dest, "WEBP", quality=82, method=6)
            
            results.append({
                "dest": dest_path,
                "cms_dest": cms_dest,
                "orig_size": raw_size,
                "final_size": final_size,
                "savings_pct": round((1 - final_size / raw_size) * 100, 1) if raw_size > 0 else 0,
                "width": target_w,
                "height": target_h,
                "alt": item["alt"],
                "caption": item["caption"],
                "folder": item["folder"]
            })
            print(f"  ✓ Saved {dest_path}: {target_w}x{target_h}, {final_size // 1024} KB (saved {round((1 - final_size / raw_size) * 100, 1)}%)")
            
        except Exception as e:
            print(f"  ✗ Failed {dest_path}: {e}", file=sys.stderr)
            raise e

    print(f"\nSuccessfully downloaded and optimized {len(results)} assets!")

if __name__ == "__main__":
    main()
