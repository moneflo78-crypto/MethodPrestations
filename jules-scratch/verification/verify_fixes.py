from playwright.sync_api import sync_playwright, expect
import time

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # 1. Navigate to the application
        page.goto("http://localhost:8000")

        # 2. Go to "Analisi Statistica", add data, and initiate the calculation
        page.get_by_role("button", name="Analisi Statistica").click()
        page.locator(".data-input").first.fill("10.0, 10.1, 10.0, 9.9, 10.0")
        page.locator('input[data-field="name"]').first.fill("Campione Test")
        page.locator("#calculate-btn").click()

        # 3. Handle the interactive modal that appears for normal data
        # Wait for the modal to appear
        expect(page.locator("#multi-choice-modal-backdrop")).to_be_visible()
        # Select the 'Huber' test within the modal
        page.locator("#modal-choice-huber").check()
        # Click the confirm button within the modal
        page.locator("#multi-choice-modal-footer button.bg-blue-600").click()

        # 4. Wait for the results to appear after the modal is handled
        expect(page.locator("#results-container .sample-card")).to_be_visible(timeout=10000)

        # 5. Go to "Incertezza di Preparazione" to set up the test case
        page.get_by_role("button", name="Incertezza di Preparazione").click()
        page.get_by_role("button", name="Aggiungi Campione da Trattare").click()
        page.locator(".select-treatment-sample").select_option(label="Campione Test")

        # 6. Add and configure the "Diluizione" treatment step
        page.get_by_role("button", name="Diluizione").click()
        page.locator('select[data-field="pipette"]').select_option(value="051CHR")
        page.locator('input[data-field="volume"]').fill("2.5")
        page.locator('select[data-field="dilutionFlask"]').select_option(value="Matraccio 50 mL")
        page.locator('input[data-field="sourceManualConcentration"]').fill("10")
        page.locator('input[data-field="sourceManualUncertainty"]').fill("1")

        # 7. Go to the "Incertezza Estesa" tab
        page.get_by_role("button", name="Incertezza Estesa").click()

        # 8. Check the "Calcola Incertezza Massima Garantita" box
        page.locator("#toggle-guaranteed-uncertainty").check()

        # 9. Verify the fix
        guaranteed_results_container = page.locator(".p-5.rounded-lg.shadow-md.border-l-4.border-blue-500")
        expect(guaranteed_results_container).to_be_visible(timeout=5000)
        error_message = page.get_by_text("Nessun criterio di incertezza applicabile trovato")
        expect(error_message).not_to_be_visible()

        # 10. Take the final screenshot for confirmation
        page.screenshot(path="jules-scratch/verification/verification.png")

        print("Verification script completed successfully.")

    except Exception as e:
        print(f"An error occurred during verification: {e}")
        page.screenshot(path="jules-scratch/verification/error_screenshot.png")
        raise e
    finally:
        browser.close()

with sync_playwright() as playwright:
    run_verification(playwright)