from playwright.sync_api import sync_playwright

def verify_libraries_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8000")

        # Navigate to Libraries Tab
        page.click("#tab-librerie")

        # Verify Text Update
        page.wait_for_selector("#content-librerie")
        description_text = page.locator("#content-librerie p.text-gray-600").text_content()
        assert "Bilance e Metodi" in description_text
        print("Text verification successful")

        # Verify Balances Tab and Add Balance Modal
        page.click("#subtab-bilance")
        page.click("#btn-add-balance")
        page.wait_for_selector("#form-modal-content")

        # Take screenshot of the Add Balance modal
        page.screenshot(path="jules-scratch/verification/add_balance_modal.png")
        print("Screenshot saved to jules-scratch/verification/add_balance_modal.png")

        browser.close()

if __name__ == "__main__":
    verify_libraries_ui()
