import re
from playwright.sync_api import sync_playwright, Page, expect

def run_verification(page: Page):
    """
    Verifies that the guaranteed uncertainty calculation for pipettes now works
    for volumes that are not exact calibration points.
    """
    # 1. Navigate to the application
    page.goto("http://localhost:8000")

    # 2. Go to the "Analisi Statistica" tab
    analisi_tab = page.get_by_role("button", name="Analisi Statistica")
    expect(analisi_tab).to_be_visible(timeout=10000)
    analisi_tab.click()

    # 3. Use the existing sample card and fill it with "clean" data
    # This data is less likely to trigger interactive modals for outlier checks.
    clean_data = "10.1, 10.2, 10.0, 10.1, 9.9, 10.0"
    page.locator(".sample-card .data-input").first.fill(clean_data)

    # 4. Perform the base calculation
    page.get_by_role("button", name="Calcola").click()

    # Wait for the results table to appear in the correct container.
    # The modals should be bypassed with the clean data.
    results_table = page.locator("#results-container .data-table")
    expect(results_table).to_be_visible(timeout=15000) # Increased timeout just in case

    # 5. Go to the "Incertezza di Preparazione" tab
    page.get_by_role("button", name="Incertezza di Preparazione").click()

    # 6. Add a sample to treat
    page.get_by_role("button", name="Aggiungi Campione da Trattare").click()

    # 7. Select the sample created earlier
    page.locator('select.select-treatment-sample').select_option(label="Campione 1")

    # 8. Add an "Estrazione" treatment
    page.get_by_role("button", name="Estrazione").click()

    # 9. Set the extraction method to "Pipetta"
    page.get_by_role("radio", name="Pipetta").check()

    # 10. Configure the aliquot with the problematic volume
    page.locator('select[data-field="aliquotPipette"]').select_option("051CHR")
    page.locator('input[data-field="aliquotVolume"]').fill("2")

    # 11. Go to the "Incertezza Estesa" tab
    page.get_by_role("button", name="Incertezza Estesa").click()

    # 12. Enable "Calcola Incertezza Massima Garantita"
    page.get_by_label("Calcola Incertezza Massima Garantita").check()

    # 13. Verify the result and take a screenshot
    guaranteed_result_container = page.locator("h4:has-text('Incertezza Massima Garantita')").locator("..")

    expect(guaranteed_result_container.get_by_text("Criterio di incertezza massimo non trovato")).not_to_be_visible()

    uncertainty_row = guaranteed_result_container.get_by_role("row").filter(has_text="U% (Garantita)")
    expect(uncertainty_row).to_be_visible()

    uncertainty_value_cell = uncertainty_row.get_by_role("cell").last
    expect(uncertainty_value_cell).to_contain_text(re.compile(r"\d+\.\d+\s*%"))

    page.screenshot(path="jules-scratch/verification/verification.png")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            run_verification(page)
            print("Frontend verification script ran successfully.")
        except Exception as e:
            print(f"Frontend verification script failed: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    main()