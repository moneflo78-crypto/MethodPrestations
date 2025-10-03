from playwright.sync_api import sync_playwright, Page

def run_debug(page: Page):
    """
    A simple script to navigate to the page and take a screenshot for debugging purposes.
    """
    print("Navigating to http://localhost:8000...")
    page.goto("http://localhost:8000", timeout=15000)
    print("Page loaded. Taking screenshot...")
    page.screenshot(path="jules-scratch/verification/debug_screenshot.png")
    print("Screenshot 'debug_screenshot.png' taken.")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            run_debug(page)
        except Exception as e:
            print(f"Debug script failed: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    main()