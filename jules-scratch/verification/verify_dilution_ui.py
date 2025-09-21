import asyncio
from playwright.sync_api import sync_playwright, Page, expect
import os

def verify_changes(page: Page):
    # Navigate to the local server
    page.goto('http://localhost:8000/index.html')

    # --- SETUP: Create an eligible sample ---
    # 1. Go to the statistical analysis tab
    page.get_by_role("button", name="Analisi Statistica").click()

    # 2. Add data and an expected value to the first sample
    page.locator('textarea[data-field="rawData"]').first.fill("1, 1.1, 1.2, 1.15, 1.05")
    page.locator('input[data-field="expectedValue"]').first.fill("10")

    # 3. Run the calculation
    calculate_btn = page.get_by_role("button", name="Calcola")
    calculate_btn.click()

    # 4. Handle the outlier test selection modal
    modal = page.locator('#multi-choice-modal-backdrop')
    expect(modal).to_be_visible()
    page.locator('#modal-choice-huber').check() # Select Huber test
    modal.get_by_role("button", name="Esegui Test").click()
    expect(modal).not_to_be_visible() # Wait for modal to disappear

    # 5. Wait for the results to confirm the sample is processed
    expect(page.get_by_role("heading", name="Campione 1 - Report di Analisi")).to_be_visible(timeout=10000)


    # --- VERIFICATION ---
    # 1. Verify Matrix Spike Section
    # ---------------------------------
    page.get_by_role("button", name="Incertezza di Preparazione").click()

    spike_accordion_button = page.locator('.accordion-btn').nth(1)
    spike_accordion_content = page.locator('.accordion-content').nth(1)
    if not spike_accordion_content.is_visible():
        spike_accordion_button.click()
    expect(spike_accordion_content).to_be_visible()

    # Use a scoped locator to find the button within the correct container
    spike_container = page.locator('#spike-calculators-container')
    spike_container.get_by_role("button", name="+ Aggiungi Passaggio").click()

    add_solvent_button_spike = spike_container.locator('button[data-field="dilutionType"][data-value="addSolvent"]')
    expect(add_solvent_button_spike).to_be_visible()
    add_solvent_button_spike.click()

    # Take a screenshot of the whole preparation content area for better context
    page.locator("#content-preparazione").screenshot(path="jules-scratch/verification/verification.png")
    print("Verification screenshot saved.")

    # 2. Verify Treatments Section
    # ---------------------------------
    treatment_accordion_button = page.locator('.accordion-btn').nth(2)
    treatment_accordion_content = page.locator('.accordion-content').nth(2)
    treatment_accordion_button.click()
    expect(treatment_accordion_content).to_be_visible()

    page.get_by_role("button", name="+ Aggiungi Campione da Trattare").click()
    page.get_by_role("button", name="Diluizione").click()

    add_solvent_button_treatment = page.locator('.dilution-type-btn[data-value="addSolvent"]').last
    expect(add_solvent_button_treatment).to_be_visible()
    add_solvent_button_treatment.click()

    # The main screenshot already captures this section as well. No need for a second one.


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_changes(page)
        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    main()
