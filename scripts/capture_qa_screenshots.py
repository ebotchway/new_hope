import os
import sys
import time
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3010"

VIEWPORTS = {
    "desktop": {"width": 1440, "height": 900},
    "tablet": {"width": 768, "height": 1024},
    "mobile": {"width": 375, "height": 812},
}

PUBLIC_ROUTES = [
    ("home", "/"),
    ("about", "/about"),
    ("what-we-do", "/what-we-do"),
    ("sponsor-a-child", "/sponsor-a-child"),
    ("sponsor-child-detail", "/sponsor-a-child/amara"),
    ("become-a-brightener", "/become-a-brightener"),
    ("donate", "/donate"),
]

ADMIN_ROUTES = [
    ("admin-dashboard", "/admin"),
    ("admin-website-overview", "/admin/website"),
    ("admin-homepage-builder", "/admin/website/homepage"),
    ("admin-pages-manager", "/admin/website/pages"),
    ("admin-navigation-manager", "/admin/website/navigation"),
    ("admin-media-library", "/admin/website/media"),
    ("admin-appearance-settings", "/admin/website/appearance"),
    ("admin-seo-audit", "/admin/website/seo"),
]

def ensure_dirs():
    for vp in VIEWPORTS.keys():
        os.makedirs(f"docs/screenshots/{vp}", exist_ok=True)

def run():
    ensure_dirs()
    print("Starting Playwright screenshot capture...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        for vp_name, vp_dims in VIEWPORTS.items():
            print(f"\n--- Capturing viewport: {vp_name} ({vp_dims['width']}x{vp_dims['height']}) ---")
            context = browser.new_context(
                viewport=vp_dims,
                user_agent="Mozilla/5.0 (LivingHope-QA-Agent)"
            )
            page = context.new_page()

            # 1. Capture public routes
            for name, route in PUBLIC_ROUTES:
                url = f"{BASE_URL}{route}"
                try:
                    print(f"[{vp_name}] Navigating to {name} ({url})...")
                    page.goto(url, wait_until="networkidle", timeout=20000)
                    time.sleep(1) # Allow any CSS transitions
                    screenshot_path = f"docs/screenshots/{vp_name}/{name}.png"
                    page.screenshot(path=screenshot_path, full_page=True)
                    print(f"  ✓ Saved {screenshot_path}")
                except Exception as e:
                    print(f"  ✗ Error capturing {name}: {e}")

            # 2. Login to Admin
            print(f"[{vp_name}] Logging in as Admin...")
            try:
                page.goto(f"{BASE_URL}/login", wait_until="networkidle", timeout=15000)
                page.fill('input[type="email"]', "admin@livinghope.org")
                page.fill('input[type="password"]', "ChangeMe123!")
                page.click('button[type="submit"]')
                page.wait_for_load_state("networkidle", timeout=15000)
                time.sleep(1.5)
                print(f"[{vp_name}] Current URL after login: {page.url}")
            except Exception as e:
                print(f"[{vp_name}] Login error: {e}")

            # 3. Capture Admin routes
            for name, route in ADMIN_ROUTES:
                url = f"{BASE_URL}{route}"
                try:
                    print(f"[{vp_name}] Navigating to admin {name} ({url})...")
                    page.goto(url, wait_until="networkidle", timeout=20000)
                    time.sleep(1)
                    screenshot_path = f"docs/screenshots/{vp_name}/{name}.png"
                    page.screenshot(path=screenshot_path, full_page=True)
                    print(f"  ✓ Saved {screenshot_path}")
                except Exception as e:
                    print(f"  ✗ Error capturing admin {name}: {e}")

            context.close()

        browser.close()
    print("\nAll screenshot captures completed successfully.")

if __name__ == "__main__":
    run()
