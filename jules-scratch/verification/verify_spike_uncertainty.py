import os
from playwright.sync_api import sync_playwright, expect

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Get the absolute path to the index.html file
    file_path = os.path.abspath('index.html')
    page.goto(f'file://{file_path}')

    # 1. Go to "Analisi Statistica" and prepare the sample for spike calculation
    page.get_by_role("button", name="Analisi Statistica").click()

    first_sample_card = page.locator(".sample-card").first
    # Fill raw data to ensure calculation runs
    first_sample_card.locator('textarea[data-field="rawData"]').fill("0.72 0.73 0.73 0.75 0.76 0.80 0.78 0.80 0.74 0.74")
    # Input an expected value for the first sample to make it eligible
    first_sample_card.locator('input[data-field="expectedValue"]').fill("1.5")

    # Trigger the calculation by clicking the main "Calcola" button
    page.get_by_role("button", name="Calcola").click()

    # Handle the outlier test selection modal
    expect(page.locator("#multi-choice-modal-backdrop")).to_be_visible()
    page.locator('input[value="huber"]').check()
    page.get_by_role("button", name="Esegui Test").click()

    # Wait for the statistics table to appear, confirming calculation is complete
    expect(page.locator("#results-container .data-table")).to_be_visible()

    # 2. Switch to the "Incertezza di Preparazione" tab
    page.get_by_role("button", name="Incertezza di Preparazione").click()

    # 3. Open the accordion for Matrix Spike preparation
    page.get_by_text("Preparazione dei matrix spike").click()

    # 4. Fill in the reference material details FIRST
    spike_calculator = page.locator("#spike-calculators-container .bg-white").first
    spike_calculator.get_by_label("Concentrazione Materiale di Riferimento").fill("1000")
    spike_calculator.get_by_label("Incertezza del certificato (U %)").fill("0.5")

    # 5. NOW, add a preparation step
    spike_calculator.get_by_role("button", name="+ Aggiungi Passaggio").click()

    # 6. Locate the newly added step and fill its fields
    # Define the locator for the new step and explicitly wait for it to be visible
    step = spike_calculator.locator(".bg-gray-50").first
    expect(step).to_be_visible()

    # Fill in the preparation step details using robust data-field selectors
    step.locator('select[data-field="pipette"]').select_option("051CHR")
    step.locator('input[data-field="volume"]').fill("5")
    step.locator('select[data-field="dilutionFlask"]').select_option("Matraccio 100 mL")

    # 7. Take a screenshot of the results area
    results_container = spike_calculator.locator('[id^="spike-results-container-"]')
    expect(results_container.get_by_text("Dettaglio Contributi Incertezza")).to_be_visible()

    results_container.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run_verification(playwright)