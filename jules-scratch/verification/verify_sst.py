from playwright.sync_api import sync_playwright
import os

def test_sst_ui():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Determine the absolute path to the HTML file
        current_dir = os.getcwd()
        html_file_path = os.path.join(current_dir, 'index.html')
        file_url = f'file://{html_file_path}'

        print(f"Navigating to {file_url}")
        page.goto(file_url)

        # 0. Switch to "Analisi Statistica" tab
        print("Switching to 'Analisi Statistica' tab...")
        # Assuming the tab button has data-tab-name="statistica" or similar.
        # I'll use text selector to be safe as per the UI.
        page.click('button:has-text("Analisi Statistica")')

        # Wait for the sample card header to be visible
        page.wait_for_selector('h3:has-text("Campione 1")', state='visible')

        # 1. Switch to SST mode
        print("Switching to SST mode...")
        mode_select = page.locator('select.mode-select').first
        mode_select.select_option('sst')

        # Wait for table to appear
        page.wait_for_selector('table th:has-text("Peso Lordo")', state='visible')
        print("SST Table rendered.")

        # 2. Add a few rows
        print("Adding rows...")
        add_btn = page.locator('.btn-add-sst-row').first
        add_btn.click() # Add 4th row (3 are default)

        # 3. Enter dummy data
        print("Entering data...")
        # Use nth to target specific inputs in the table
        # Row 1
        page.locator('input.sst-input[data-field="m1"]').nth(0).fill("50.0500")
        page.locator('input.sst-input[data-field="m0"]').nth(0).fill("50.0000")
        # Row 2
        page.locator('input.sst-input[data-field="m1"]').nth(1).fill("50.0600")
        page.locator('input.sst-input[data-field="m0"]').nth(1).fill("50.0000")

        # 4. Take screenshot of the card
        print("Taking screenshot...")
        card = page.locator('.sample-card').first
        card.screenshot(path='jules-scratch/verification/sst_ui_verification.png')

        browser.close()

if __name__ == "__main__":
    test_sst_ui()
