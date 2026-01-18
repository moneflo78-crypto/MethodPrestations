import os
import re
from playwright.sync_api import sync_playwright

def verify_sst_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Determine the absolute path to index.html
        cwd = os.getcwd()
        file_path = f"file://{cwd}/index.html"

        print(f"Navigating to {file_path}")
        page.goto(file_path)

        # 1. Verify Tab Name Change
        # Old: "Analisi Statistica", New: "Analisi dei Campioni"
        print("Checking tab rename...")
        tab_statistica = page.locator('#tab-statistica')
        if "Analisi dei Campioni" not in tab_statistica.inner_text():
            print(f"FAILED: Tab text is '{tab_statistica.inner_text()}', expected 'Analisi dei Campioni'")
        else:
            print("PASSED: Tab renamed correctly.")

        # 2. Verify Tab Removal
        # "Incertezza di Pesata" should be gone
        print("Checking tab removal...")
        tab_pesata = page.locator('#tab-pesata')
        if tab_pesata.count() > 0:
             print("FAILED: 'Incertezza di Pesata' tab still exists.")
        else:
             print("PASSED: 'Incertezza di Pesata' tab removed.")

        # 3. Verify SST Net Weight Column
        print("Checking SST Net Weight column...")
        # Navigate to "Analisi dei Campioni" tab
        tab_statistica.click()

        # Add a sample
        page.locator('#btn-add-sample').click()

        # Change mode to SST (assuming the first sample card is the target)
        # We need to find the select element for the mode. It usually has a class 'mode-select' or similar,
        # or we find it by structure. Based on previous reads, it's likely a select inside the sample card.
        # Let's inspect the DOM structure from previous reads or guess.
        # Typically: select with class 'mode-select' inside the sample card.

        # Wait for sample to appear
        page.wait_for_selector('.sample-card')

        # Select "SST" mode
        # We need to find the select that has options "SST".
        # Let's assume there is a select for mode.
        mode_select = page.locator('.mode-select').first
        mode_select.select_option('sst')

        # Wait for the table to re-render for SST
        # The table headers should now include "Peso Netto"
        page.wait_for_selector('th:has-text("Peso Netto")')

        headers = page.locator('th').all_inner_texts()
        print(f"Headers found: {headers}")
        if any("Peso Netto" in h for h in headers):
            print("PASSED: 'Peso Netto' column header found.")
        else:
            print("FAILED: 'Peso Netto' column header NOT found.")

        # Add a row to SST table
        add_row_btn = page.locator('.btn-add-sst-row').first
        add_row_btn.click()

        # Input Gross and Tare
        # M1 (Lordo) = 10, M0 (Tara) = 5
        inputs = page.locator('.sst-input').all()
        # Assuming order: M1, M0 for the first row
        # We can target by placeholder if available or order

        # Let's be more specific:
        # data-field="m1"
        page.locator('input[data-field="m1"]').first.fill("10")
        page.locator('input[data-field="m0"]').first.fill("5")

        # Trigger calculation/update (usually on input or blur)
        page.locator('input[data-field="m0"]').first.blur()

        # Force a short wait or trigger another event to ensure update
        page.locator('body').click()

        # Check the Net Weight cell
        # It's the 4th column (index 3 if 0-based, but :nth-child is 1-based).
        # Previous cols: #, M1, M0. So Net Weight is 4th.
        # But let's look for the text "5.0000" in the row.

        net_weight_cell = page.locator('td:has-text("5.0000")')
        if net_weight_cell.count() > 0:
             print("PASSED: Net Weight calculated and displayed correctly (5.0000).")
        else:
             print("FAILED: Net Weight 5.0000 not found.")
             # Debug: print all cell texts in that row
             cells = page.locator('tr.border-b').last.locator('td').all_inner_texts()
             print(f"Row cells: {cells}")

        # 4. Verify Class A Cylinders in Library
        print("Checking Class A Cylinders...")
        # Navigate to "Gestione Librerie"
        page.locator('button[data-tab-name="librerie"]').click()
        page.locator('button[data-subtab-name="vetreria"]').click()

        # Check if table contains "Cilindro 10 mL (ISO 4788 A)"
        glassware_table = page.locator('#glassware-library-table')
        if "Cilindro 10 mL (ISO 4788 A)" in glassware_table.inner_text():
             print("PASSED: 'Cilindro 10 mL (ISO 4788 A)' found in library.")
        else:
             print("FAILED: 'Cilindro 10 mL (ISO 4788 A)' NOT found in library.")

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/verification.png")
        print("Screenshot saved to jules-scratch/verification/verification.png")

        browser.close()

if __name__ == "__main__":
    verify_sst_changes()
