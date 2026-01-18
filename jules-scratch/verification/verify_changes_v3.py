import os
from playwright.sync_api import sync_playwright

def verify_sst_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        cwd = os.getcwd()
        file_path = f"file://{cwd}/index.html"

        print(f"Navigating to {file_path}")
        page.goto(file_path)

        # 1. Verify Tab Name Change
        tab_statistica = page.locator('#tab-statistica')
        if "Analisi dei Campioni" not in tab_statistica.inner_text():
            print(f"FAILED: Tab text is '{tab_statistica.inner_text()}'")
        else:
            print("PASSED: Tab renamed correctly.")

        # 2. Verify Tab Removal
        tab_pesata = page.locator('#tab-pesata')
        if tab_pesata.count() > 0:
             print("FAILED: 'Incertezza di Pesata' tab still exists.")
        else:
             print("PASSED: 'Incertezza di Pesata' tab removed.")

        # 3. Verify SST Net Weight Column
        print("Checking SST Net Weight column...")
        tab_statistica.click()
        page.locator('#btn-add-sample').click()

        page.wait_for_selector('.sample-card')
        sample_card = page.locator('.sample-card').first

        # Select SST mode
        sample_card.locator('.mode-select').select_option('sst')

        # Wait for "Peso Netto" header
        sst_headers = sample_card.locator('table th').all_inner_texts()
        print(f"SST Headers: {sst_headers}")
        if any("Peso Netto" in h for h in sst_headers):
            print("PASSED: 'Peso Netto' column header found.")
        else:
            print("FAILED: 'Peso Netto' column header NOT found.")

        # Add row
        sample_card.locator('.btn-add-sst-row').click()

        # Fill inputs - use .first to avoid strict mode violation if multiple exist (though we just added one, SST might init with some)
        sample_card.locator('input[data-field="m1"]').first.fill("10")
        sample_card.locator('input[data-field="m0"]').first.fill("5")
        sample_card.locator('input[data-field="m0"]').first.blur()

        # Wait for value 5.0000
        net_weight_locator = sample_card.locator('td', has_text="5.0000")

        try:
            net_weight_locator.wait_for(state="visible", timeout=2000)
            print("PASSED: Net Weight 5.0000 calculated and displayed.")
        except:
            print("FAILED: Net Weight 5.0000 not found.")
            row_text = sample_card.locator('table tbody tr').first.inner_text()
            print(f"Row text: {row_text}")

        # 4. Verify Class A Cylinders
        print("Checking Class A Cylinders...")
        page.locator('button[data-tab-name="librerie"]').click()
        page.locator('button[data-subtab-name="vetreria"]').click()

        glassware_table = page.locator('#glassware-library-table')
        if "Cilindro 10 mL (ISO 4788 A)" in glassware_table.inner_text():
             print("PASSED: 'Cilindro 10 mL (ISO 4788 A)' found.")
        else:
             print("FAILED: 'Cilindro 10 mL (ISO 4788 A)' NOT found.")

        page.screenshot(path="jules-scratch/verification/verification_v3.png")
        browser.close()

if __name__ == "__main__":
    verify_sst_changes()
