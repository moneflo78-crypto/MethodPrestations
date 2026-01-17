
from playwright.sync_api import sync_playwright, expect
import sys

def verify_app_loads():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Capture console messages to detect JS errors
        page.on("console", lambda msg: print(f"CONSOLE: {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))

        try:
            print("Navigating to app...")
            page.goto("http://localhost:8000/index.html")

            # Wait for the main title to ensure basic rendering
            print("Waiting for title...")
            expect(page.locator("h1")).to_contain_text("Valutazione delle prestazioni del metodo applicato")

            # Wait for tabs to be visible
            print("Waiting for tabs...")
            expect(page.locator("nav[aria-label='Tabs']")).to_be_visible()

            # Take a screenshot
            screenshot_path = "jules-scratch/verification/app_load.png"
            page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

        except Exception as e:
            print(f"VERIFICATION FAILED: {e}")
            sys.exit(1)
        finally:
            browser.close()

if __name__ == "__main__":
    verify_app_loads()
