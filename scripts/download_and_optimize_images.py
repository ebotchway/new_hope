#!/usr/bin/env python3
"""
LivingHope Platform - Authentic African & Ghanaian Imagery Optimizer
Downloads authentic, emotional, high-resolution African and Ghanaian photography
and generates responsive WebP assets with metadata for CMS and public pages.
"""

import os
import sys
import urllib.request
from PIL import Image
import io

ASSETS = [
    # 1. Home
    {
        "url": "https://upload.wikimedia.org/wikipedia/commons/0/07/Ghanaian_School_Children%2C_2013.jpg",
        "dest": "public/images/home/hero.webp",
        "size": (1600, 900),
        "alt": "Joyful Ghanaian school children in bright uniforms smiling together in classroom",
        "caption": "LivingHope education and school sponsorship programme in Ghana",
        "folder": "home",
        "crop_anchor": 0.25
    },
    {
        "url": "https://upload.wikimedia.org/wikipedia/commons/2/24/Child_at_Roadside_-_Kuntanase_-_Ghana_%284756185534%29.jpg",
        "dest": "public/images/home/street-child.webp",
        "size": (1200, 900),
        "alt": "Vulnerable child by the roadside in Kuntanase, Ghana looking toward a brighter future through LivingHope intervention",
        "caption": "Street outreach, immediate sanctuary, and educational rescue",
        "folder": "home",
        "crop_anchor": 0.2
    },
    {
        "url": "https://images.unsplash.com/photo-1687794504223-8bdc02e25ef6?q=85&w=1600&auto=format&fit=crop",
        "dest": "public/images/home/partnership-banner.webp",
        "size": (1600, 800),
        "alt": "Young people and community solidarity in Accra, Ghana",
        "caption": "Join hands with LivingHope as a Brightener partner",
        "folder": "partnerships",
        "crop_anchor": 0.3
    },
    {
        "url": "https://images.unsplash.com/photo-1632932693914-89b90ae3d16d?q=85&w=1600&auto=format&fit=crop",
        "dest": "public/images/home/impact.webp",
        "size": (1200, 800),
        "alt": "African students gathered at classroom desks, engaged in collaborative learning",
        "caption": "Real, audited educational outcomes across Ghana",
        "folder": "home",
        "crop_anchor": 0.25
    },

    # 2. About
    {
        "url": "https://images.unsplash.com/photo-1687794504223-8bdc02e25ef6?q=85&w=1600&auto=format&fit=crop",
        "dest": "public/images/about/hero.webp",
        "size": (1600, 900),
        "alt": "LivingHope dedicated Ghanaian leadership team and community educators in Accra",
        "caption": "Our leadership and frontline fieldwork team in Ghana",
        "folder": "about",
        "crop_anchor": 0.3
    },
    {
        "url": "https://upload.wikimedia.org/wikipedia/commons/c/c9/A_teacher_assisting_his_student_to_read.jpg",
        "dest": "public/images/about/team-field.webp",
        "size": (1200, 900),
        "alt": "Ghanaian teacher providing personalized reading mentorship to an eager student",
        "caption": "Direct mentorship and educational rehabilitation",
        "folder": "about",
        "crop_anchor": 0.15
    },
    {
        "url": "https://images.unsplash.com/photo-1632932693914-89b90ae3d16d?q=85&w=1600&auto=format&fit=crop",
        "dest": "public/images/about/mission.webp",
        "size": (1200, 800),
        "alt": "School books, notebooks, and learning supplies provided by LivingHope",
        "caption": "Educational foundation for sustainable transformation in Ghana",
        "folder": "about",
        "crop_anchor": 0.25
    },

    # 3. Programmes
    {
        "url": "https://images.unsplash.com/photo-1632215863479-201029d93143?q=85&w=1600&auto=format&fit=crop",
        "dest": "public/images/programmes/hero.webp",
        "size": (1600, 900),
        "alt": "Students participating actively in community school classroom in West Africa",
        "caption": "LivingHope holistic support pathways",
        "folder": "programmes",
        "crop_anchor": 0.25
    },
    {
        "url": "https://images.unsplash.com/photo-1664990594667-9bd4c60cbcfb?q=85&w=1200&auto=format&fit=crop",
        "dest": "public/images/programmes/education.webp",
        "size": (800, 500),
        "alt": "Young students proudly wearing school uniforms on their way to class",
        "caption": "Formal School Enrollment and Remedial Tutoring",
        "folder": "programmes",
        "crop_anchor": 0.2
    },
    {
        "url": "https://upload.wikimedia.org/wikipedia/commons/f/f2/Carpenter_Ghana.jpg",
        "dest": "public/images/programmes/vocational.webp",
        "size": (800, 500),
        "alt": "Youth learning carpentry craftsmanship in a vocational workshop in Ghana",
        "caption": "Vocational Skills & Apprenticeships for older youth",
        "folder": "programmes",
        "crop_anchor": 0.35
    },
    {
        "url": "https://images.unsplash.com/photo-1710093072215-65070f9cf93e?q=85&w=1200&auto=format&fit=crop",
        "dest": "public/images/programmes/outreach.webp",
        "size": (800, 500),
        "alt": "Field team meeting and supporting children in local Ghanaian community",
        "caption": "Street Outreach and First Contact Rescue in Ghana",
        "folder": "programmes",
        "crop_anchor": 0.25
    },
    {
        "url": "https://upload.wikimedia.org/wikipedia/commons/4/47/A_cook_moving_round_classrooms_to_serve_food_for_school_children_01.jpg",
        "dest": "public/images/programmes/health.webp",
        "size": (800, 500),
        "alt": "School children served warm, balanced meals in classroom in Ghana",
        "caption": "Nutrition, Mental Wellness & Medical Healthcare",
        "folder": "programmes",
        "crop_anchor": 0.3
    },

    # 4. Sponsorship
    {
        "url": "https://images.unsplash.com/photo-1729691032175-d6edd1581a31?q=85&w=1600&auto=format&fit=crop",
        "dest": "public/images/sponsorship/hero.webp",
        "size": (1600, 900),
        "alt": "African girl smiling warmly with hopeful eyes, looking toward an educational future",
        "caption": "Sponsor a Child in Ghana today",
        "folder": "sponsorship",
        "crop_anchor": 0.2
    },
    {
        "url": "https://images.unsplash.com/photo-1762657927837-83dc0efb2e76?q=85&w=1600&auto=format&fit=crop",
        "dest": "public/images/sponsorship/brightener-hero.webp",
        "size": (1600, 900),
        "alt": "Joyful Ghanaian children playing outdoors in Kumasi, thriving in a safe environment",
        "caption": "Become a Brightener partner",
        "folder": "sponsorship",
        "crop_anchor": 0.3
    },

    # 5. Donations
    {
        "url": "https://images.unsplash.com/photo-1690576719929-5bfe2598bbc4?q=85&w=1600&auto=format&fit=crop",
        "dest": "public/images/donations/hero.webp",
        "size": (1600, 900),
        "alt": "Smiling African children embracing educational opportunity with gratitude",
        "caption": "Your donation directly transforms lives in Ghana",
        "folder": "donations",
        "crop_anchor": 0.25
    },
    {
        "url": "https://upload.wikimedia.org/wikipedia/commons/0/06/Young_Girls_Strike_a_Pose_-_Busua_-_Ghana_%284737816187%29.jpg",
        "dest": "public/images/donations/impact.webp",
        "size": (1200, 800),
        "alt": "Joyful young girls celebrating community transformation in Busua, Ghana",
        "caption": "100% transparent and accountable financial stewardship",
        "folder": "donations",
        "crop_anchor": 0.25
    },

    # 6. Partnerships
    {
        "url": "https://images.unsplash.com/photo-1687794504223-8bdc02e25ef6?q=85&w=1600&auto=format&fit=crop",
        "dest": "public/images/partnerships/hero.webp",
        "size": (1600, 900),
        "alt": "Community leaders and partners collaborating for child welfare in Ghana",
        "caption": "Corporate, church, and foundational partnerships",
        "folder": "partnerships",
        "crop_anchor": 0.3
    },
    {
        "url": "https://upload.wikimedia.org/wikipedia/commons/0/07/Ghanaian_School_Children%2C_2013.jpg",
        "dest": "public/images/partnerships/collaboration.webp",
        "size": (1200, 800),
        "alt": "Ghanaian students and community leaders in sustainable development",
        "caption": "Sustainable community-led development in Ghana",
        "folder": "partnerships",
        "crop_anchor": 0.25
    },

    # 7. Beneficiary Portraits (Respectful, authentic, moving Ghanaian/African youth)
    {
        "url": "https://images.unsplash.com/photo-1729691032175-d6edd1581a31?q=85&w=800&auto=format&fit=crop",
        "dest": "public/uploads/children/amara.webp",
        "size": (640, 800), # 4:5 aspect ratio
        "alt": "Amara Mensah - 8 years old primary school student in Accra",
        "caption": "Amara loves reading, drawing, and aspires to become a healthcare nurse",
        "folder": "children",
        "crop_anchor": 0.15
    },
    {
        "url": "https://images.unsplash.com/photo-1534597422092-8a84f1b45a9c?q=85&w=800&auto=format&fit=crop",
        "dest": "public/uploads/children/kwame.webp",
        "size": (640, 800), # 4:5 aspect ratio
        "alt": "Kwame Asante - 10 years old junior student in Tema, Ghana",
        "caption": "Kwame excels in mathematics and wants to study civil engineering",
        "folder": "children",
        "crop_anchor": 0.15
    },
    {
        "url": "https://images.unsplash.com/photo-1710093072215-65070f9cf93e?q=85&w=800&auto=format&fit=crop",
        "dest": "public/uploads/children/efua.webp",
        "size": (640, 800), # 4:5 aspect ratio
        "alt": "Efua Osei - 6 years old kindergarten student in Tamale, Ghana",
        "caption": "Efua is full of energy, loves singing, and is learning to read",
        "folder": "children",
        "crop_anchor": 0.15
    },

    # 8. Placeholders & fallbacks
    {
        "url": "https://images.unsplash.com/photo-1534597422092-8a84f1b45a9c?q=85&w=400&auto=format&fit=crop",
        "dest": "public/images/placeholders/child-avatar.webp",
        "size": (400, 400),
        "alt": "Beneficiary profile avatar in Ghana",
        "caption": "Beneficiary profile placeholder",
        "folder": "placeholders",
        "crop_anchor": 0.2
    },
    {
        "url": "https://upload.wikimedia.org/wikipedia/commons/0/07/Ghanaian_School_Children%2C_2013.jpg",
        "dest": "public/images/placeholders/fallback.webp",
        "size": (800, 600),
        "alt": "LivingHope Ghana educational resources",
        "caption": "Educational resources",
        "folder": "placeholders",
        "crop_anchor": 0.25
    },

    # 9. Direct placeholders matching cms-defaults paths
    {
        "url": "https://upload.wikimedia.org/wikipedia/commons/0/07/Ghanaian_School_Children%2C_2013.jpg",
        "dest": "public/images/placeholders/home-hero.webp",
        "size": (1600, 900),
        "alt": "LivingHope Ghana Home Hero - School children in Ghana",
        "caption": "Transforming lives through love and education",
        "folder": "placeholders",
        "crop_anchor": 0.25
    },
    {
        "url": "https://upload.wikimedia.org/wikipedia/commons/2/24/Child_at_Roadside_-_Kuntanase_-_Ghana_%284756185534%29.jpg",
        "dest": "public/images/placeholders/street-child.webp",
        "size": (1200, 900),
        "alt": "Street child outreach in Ghana",
        "caption": "Rescue and educational rehabilitation",
        "folder": "placeholders",
        "crop_anchor": 0.2
    },
    {
        "url": "https://images.unsplash.com/photo-1687794504223-8bdc02e25ef6?q=85&w=1600&auto=format&fit=crop",
        "dest": "public/images/placeholders/partnership-banner.webp",
        "size": (1600, 800),
        "alt": "Partnership banner in Accra, Ghana",
        "caption": "Become a Brightener partner",
        "folder": "placeholders",
        "crop_anchor": 0.3
    },
    {
        "url": "https://images.unsplash.com/photo-1687794504223-8bdc02e25ef6?q=85&w=1600&auto=format&fit=crop",
        "dest": "public/images/placeholders/about-hero.webp",
        "size": (1600, 900),
        "alt": "About LivingHope Ghana leadership team",
        "caption": "Founded on faith and integrity in Ghana",
        "folder": "placeholders",
        "crop_anchor": 0.3
    },
    {
        "url": "https://upload.wikimedia.org/wikipedia/commons/c/c9/A_teacher_assisting_his_student_to_read.jpg",
        "dest": "public/images/placeholders/team-field.webp",
        "size": (1200, 900),
        "alt": "LivingHope field team and educators in Ghana",
        "caption": "Passionate social workers and educators",
        "folder": "placeholders",
        "crop_anchor": 0.15
    },
    {
        "url": "https://images.unsplash.com/photo-1632215863479-201029d93143?q=85&w=1600&auto=format&fit=crop",
        "dest": "public/images/placeholders/what-we-do-hero.webp",
        "size": (1600, 900),
        "alt": "What We Do hero - African students in classroom",
        "caption": "Connecting generous people to needy children",
        "folder": "placeholders",
        "crop_anchor": 0.25
    },
]

def main():
    print(f"Starting download and optimization of {len(ASSETS)} authentic African/Ghanaian media assets...")
    results = []

    for item in ASSETS:
        dest_path = item["dest"]
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        print(f"Downloading: {item['url'][:65]}... -> {dest_path}")
        
        req = urllib.request.Request(
            item["url"],
            headers={
                "User-Agent": "LivingHopeGhanaApp/2.0 (https://livinghope.org; dev@livinghope.org) Mozilla/5.0 AppleWebKit/537.36"
            }
        )
        
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = resp.read()
            
            raw_size = len(data)
            img = Image.open(io.BytesIO(data))
            orig_w, orig_h = img.size
            
            # Convert to RGB (in case of RGBA/palette/CMYK)
            if img.mode != "RGB":
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
            
            # Crop anchor: use specified vertical anchor (default 0.25 to favor heads/faces)
            anchor = item.get("crop_anchor", 0.25)
            left = (new_w - target_w) // 2
            top_offset = int((new_h - target_h) * anchor)
            top = max(0, min(top_offset, new_h - target_h))
            
            cropped = resized.crop((left, top, left + target_w, top + target_h))
            
            # Save as optimized WebP
            cropped.save(dest_path, "WEBP", quality=84, method=6)
            final_size = os.path.getsize(dest_path)
            
            # Also copy to uploads/cms/ for CMS media library availability
            cms_dest = os.path.join("public/uploads/cms", os.path.basename(dest_path))
            os.makedirs(os.path.dirname(cms_dest), exist_ok=True)
            cropped.save(cms_dest, "WEBP", quality=84, method=6)
            
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

    print(f"\nSuccessfully downloaded and optimized {len(results)} authentic African media assets!")

if __name__ == "__main__":
    main()
