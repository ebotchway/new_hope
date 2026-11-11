import os
import sys
import time
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3010"

VIEWPORTS = {
    "desktop": {"width": 1440, "height": 900},
    "mobile": {"width": 375, "height": 812},
}

def capture_auth_and_contact():
    for vp in ["desktop", "mobile"]:
        os.makedirs(f"docs/screenshots/{vp}", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        for vp_name, vp_dims in VIEWPORTS.items():
            print(f"\n--- Capturing Auth & Contact for {vp_name} ---")
            context = browser.new_context(viewport=vp_dims)
            page = context.new_page()

            # 1. Login Page
            page.goto(f"{BASE_URL}/login", wait_until="networkidle")
            time.sleep(1)
            page.screenshot(path=f"docs/screenshots/{vp_name}/login.png", full_page=True)
            print(f"  ✓ Saved docs/screenshots/{vp_name}/login.png")

            # On desktop, also capture the Google OAuth safe fallback interaction
            if vp_name == "desktop":
                google_btn = page.locator('button:has-text("Continue with Google")')
                if google_btn.is_visible():
                    google_btn.click()
                    time.sleep(1.5)
                    page.screenshot(path=f"docs/screenshots/desktop/login-google-handled.png")
                    print(f"  ✓ Saved docs/screenshots/desktop/login-google-handled.png")

            # 2. Signup Page
            page.goto(f"{BASE_URL}/signup", wait_until="networkidle")
            time.sleep(1)
            page.screenshot(path=f"docs/screenshots/{vp_name}/signup.png", full_page=True)
            print(f"  ✓ Saved docs/screenshots/{vp_name}/signup.png")

            # 3. Forgot Password Page
            page.goto(f"{BASE_URL}/forgot-password", wait_until="networkidle")
            time.sleep(1)
            page.screenshot(path=f"docs/screenshots/{vp_name}/forgot-password.png", full_page=True)
            print(f"  ✓ Saved docs/screenshots/{vp_name}/forgot-password.png")

            # 4. Reset Password Page
            page.goto(f"{BASE_URL}/reset-password?token=test-token", wait_until="networkidle")
            time.sleep(1)
            page.screenshot(path=f"docs/screenshots/{vp_name}/reset-password.png", full_page=True)
            print(f"  ✓ Saved docs/screenshots/{vp_name}/reset-password.png")

            # 5. Contact page & Navigation check
            page.goto(f"{BASE_URL}/", wait_until="networkidle")
            time.sleep(1)
            # Find Contact link in header
            contact_link = page.locator('header a[href="/contact"]').first
            if contact_link.is_visible():
                contact_link.click()
                page.wait_for_load_state("networkidle")
                time.sleep(1)
                print(f"  ✓ Verified header Contact Us link navigated to: {page.url}")
                page.screenshot(path=f"docs/screenshots/{vp_name}/contact-navigated.png", full_page=True)

            context.close()

        browser.close()

if __name__ == "__main__":
    capture_auth_and_contact()
