
from playwright.sync_api import sync_playwright, expect
import os

def verify_balances_and_tabs():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # 1. Start - Load the page
            page.goto("http://localhost:8000")
            page.wait_for_load_state("networkidle")

            # 2. Navigate to "Gestione Librerie" tab
            page.click('button[data-tab-name="librerie"]')

            # 3. Click on "Bilance" sub-tab
            # The selector might be tricky if not rendered yet, wait a bit or use specific selector
            page.click('#subtab-bilance')

            # 4. Verify "Bilance" table is visible and has content
            expect(page.locator('#subcontent-bilance')).to_be_visible()
            # Check for the default balance
            expect(page.locator('#balances-library-table')).to_contain_text("Bilancia_Analitica")

            # Screenshot of Balances Library
            page.screenshot(path="verification/balances_library.png")
            print("Screenshot 'balances_library.png' taken.")

            # 5. Add a new balance
            page.click('#btn-add-balance')
            # Wait for modal
            expect(page.locator('#form-modal-content')).to_be_visible()

            # Fill form
            page.fill('#form-field-id', 'MyNewBalance')
            page.fill('#form-field-min-weight', '0.005')
            page.fill('#form-field-capacity', '120')
            page.fill('#form-field-alpha', '0.0002')
            page.fill('#form-field-beta', '2e-6')

            # Click Save (using text match for robustness)
            page.click('button:has-text("Salva")')

            # Verify new balance is in the table
            expect(page.locator('#balances-library-table')).to_contain_text("MyNewBalance")

            # Screenshot after adding
            page.screenshot(path="verification/balances_added.png")
            print("Screenshot 'balances_added.png' taken.")

            # 6. Verify "Incertezza di Pesata" tab
            page.click('button[data-tab-name="pesata"]')

            # Verify content
            expect(page.locator('#content-pesata')).to_be_visible()
            expect(page.locator('#content-pesata')).to_contain_text("Calcolo Incertezza di Pesata")

            # Screenshot of Weighing Tab
            page.screenshot(path="verification/weighing_tab.png")
            print("Screenshot 'weighing_tab.png' taken.")

        except Exception as e:
            print(f"Error: {e}")
            # Take screenshot on error for debugging
            page.screenshot(path="verification/error_state.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    verify_balances_and_tabs()
