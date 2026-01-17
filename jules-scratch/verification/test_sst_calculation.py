
import re
from playwright.sync_api import sync_playwright, expect

def test_sst_calculation():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Load the application
        page.goto("http://localhost:8080")

        # Wait for app to load
        page.wait_for_selector("#app-version")
        print("App loaded.")

        # 1. Add a sample
        page.click("#tab-statistica")
        page.wait_for_selector(".sample-card")
        sample_card = page.locator(".sample-card").first

        # Select Mode: SST
        mode_select = sample_card.locator(".mode-select")
        mode_select.select_option("sst")
        print("Selected SST mode.")

        # Select Balance & Glassware
        sample_card.locator("select[data-field='balanceId']").select_option("Bilancia_Analitica")
        sample_card.locator("select[data-field='glasswareId']").select_option("Cilindro 100 mL (ISO 4788 A)")

        # 3. Input Data (M1, M0)
        add_row_btn = sample_card.locator(".btn-add-sst-row")
        add_row_btn.click()
        add_row_btn.click()
        add_row_btn.click()

        # Fill rows
        rows = sample_card.locator("tbody tr")
        rows.nth(0).locator("input[data-field='m1']").fill("50.0050")
        rows.nth(0).locator("input[data-field='m0']").fill("50.0000")
        rows.nth(1).locator("input[data-field='m1']").fill("50.0052")
        rows.nth(1).locator("input[data-field='m0']").fill("50.0000")
        rows.nth(2).locator("input[data-field='m1']").fill("50.0048")
        rows.nth(2).locator("input[data-field='m0']").fill("50.0000")
        print("Data entered.")

        # 4. Calculate
        page.click("#calculate-btn")
        print("Clicked Calculate.")

        # --- HANDLING POTENTIAL MODALS ---
        page.wait_for_timeout(1000)

        if page.locator("#multi-choice-modal-backdrop:not(.hidden)").count() > 0:
            print("Multi-choice modal detected.")
            if page.locator("#modal-choice-grubbs").is_visible():
                page.check("#modal-choice-grubbs")
                print("Selected Grubbs.")

            page.locator("#multi-choice-modal-footer button.bg-blue-600").click()
            print("Clicked Confirm on MultiChoice Modal.")
            page.wait_for_timeout(1000)

        if page.locator("#choice-modal-backdrop:not(.hidden)").count() > 0:
             print("Choice modal detected.")
             page.locator("#choice-modal-footer button.bg-blue-600").click()
             print("Clicked Primary button on Choice Modal.")
             page.wait_for_timeout(1000)

        # 5. Verify Results
        print("Navigating to Extended Uncertainty tab...")

        # Wait for modal to disappear using a style check if needed, or just sleep a bit more
        # The class change is handled by JS with setTimeout(300ms)
        page.wait_for_timeout(1000)

        # Force click the tab using JS if standard click fails due to obstruction
        page.evaluate("document.getElementById('tab-estesa').click()")

        # Use the correct ID: extended-uncertainty-container
        page.wait_for_selector("#extended-uncertainty-container", timeout=5000)
        content = page.locator("#extended-uncertainty-container").text_content()

        print("Result Content (snippet):", content[:500])

        if "8.34" in content or "8.35" in content:
             print("SUCCESS: U% found (approx 8.34%)")
        else:
             print("FAILURE: U% not found.")

        if "4.17" in content:
             print("SUCCESS: U abs found (approx 4.17 mg/L)")
        else:
             print("FAILURE: U abs not found.")

        # --- Verify Mean Concentration in Statistics Tab ---
        page.click("#tab-statistica")
        # Look for "Media" in the result card.
        # The format is "Media ... 50.000"
        # We can look for the text.
        page.wait_for_selector("#results-container")
        stats_content = page.locator("#results-container").text_content()

        # 50.000 mg/L
        if "50.000" in stats_content:
             print("SUCCESS: Correct Mean (50.000) found in Statistics tab.")
        else:
             print("FAILURE: Correct Mean (50.000) NOT found in Statistics tab. Found: " + stats_content[:200])

        page.screenshot(path="jules-scratch/verification/sst_calc_result_v2.png", full_page=True)
        print("Screenshot saved.")

        browser.close()

if __name__ == "__main__":
    test_sst_calculation()
